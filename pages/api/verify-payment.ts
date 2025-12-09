// Developed by: Kalidas KJ
import type { NextApiRequest, NextApiResponse } from 'next'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import QRCode from 'qrcode'
import PDFDocument from 'pdfkit'
import { PassThrough } from 'stream'
import { insertTicketWithStatus, setTicketStatus } from '../../lib/ticketStatus'
import { getTransport } from '../../lib/mailer'
import { logError, logInfo, logWarn } from '../../lib/logger'

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_KEY || '')
const BUCKET = 'tickets'

async function ensureBucket() {
  try {
    await supabase.storage.createBucket(BUCKET, { public: false })
  } catch (e) {
    // ignore bucket exists or insufficient permissions errors
  }
}

async function createSignedPdfUrl(id: string, ticketId?: string) {
  const filePath = `${id}.pdf`
  const expires = Number(process.env.STORAGE_URL_EXPIRES || '604800')
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(filePath, expires)
  if (error) {
    logError('signed url err', { error: error, ticketId: ticketId || id })
    return undefined
  }
  return data?.signedUrl
}

async function uploadPdfAndGetUrl(id: string, pdfBuffer: Buffer, ticketId: string) {
  await ensureBucket()
  const filePath = `${id}.pdf`
  const uploadRes = await supabase.storage.from(BUCKET).upload(filePath, pdfBuffer, { contentType: 'application/pdf', upsert: true })
  if (uploadRes.error) {
    logError('upload error', { error: uploadRes.error, ticketId })
  }
  return (await createSignedPdfUrl(id, ticketId)) || `${process.env.BASE_URL || 'http://localhost:3000'}/ticket/${id}`
}

const transporter = getTransport()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, metadata } = req.body
  const paymentId = String(razorpay_payment_id || '').trim()
  if (!paymentId) return res.status(400).json({ error: 'missing_payment_id' })
  // verify signature using HMAC SHA256
  const secret = process.env.RAZORPAY_KEY_SECRET || ''
  const generated_signature = crypto.createHmac('sha256', secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex')
  if (generated_signature !== razorpay_signature) {
    logWarn('invalid razorpay signature', { generated_signature, razorpay_signature })
    return res.status(400).json({ error: 'invalid_signature' })
  }

  const name = (metadata?.name || '').trim()
  const email = (metadata?.email || '').trim()
  if (!name || !email) return res.status(400).json({ error: 'missing_user_details' })

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

  // Return existing ticket if this payment was already processed
  const { data: existingTicket, error: existingError } = await supabase
    .from('tickets')
    .select('*')
    .eq('payment_id', paymentId)
    .limit(1)
    .maybeSingle()
  if (existingError) {
    logError('ticket lookup error', { error: existingError })
  }
  if (existingTicket) {
    const ticketUrl = `${baseUrl}/ticket/${existingTicket.id}`
    const pdfUrl = await createSignedPdfUrl(existingTicket.id, existingTicket.id)
    logInfo('returning existing ticket for payment', { paymentId, ticketId: existingTicket.id })
    return res.json({ ticketUrl, pdfUrl })
  }

  // create ticket record in Supabase
  let ticketId = `TICKET_${Date.now()}`
  let insertedTicket: any | null = null
  try {
    const id = ticketId
    const qrData = `${id}|${email}`
    const qrSvg = await QRCode.toDataURL(qrData)
    insertedTicket = await insertTicketWithStatus(
      supabase,
      {
        id,
        name,
        email,
        user_id: metadata?.user_id || null,
        payment_id: paymentId,
        qr: qrSvg,
        created_at: new Date(),
      },
      'pending'
    )
    ticketId = insertedTicket?.id || id
    // send email with ticket link and attach PDF
    const ticketUrl = `${baseUrl}/ticket/${ticketId}`

    // generate PDF in-memory
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const stream = new PassThrough()
    const buffers: any[] = []
    doc.pipe(stream)
    doc.fontSize(20).text('Event Ticket', { align: 'center' })
    doc.moveDown()
    doc.fontSize(14).text(`Name: ${metadata?.name}`)
    doc.text(`Email: ${metadata?.email}`)
    doc.text(`Ticket ID: ${id}`)
    doc.moveDown()
    if (qrSvg.startsWith('data:image')) {
      const base64 = qrSvg.split(',')[1]
      const img = Buffer.from(base64, 'base64')
      try { doc.image(img, { fit: [200,200], align: 'center' }) } catch(e) { logError('pdf image error', { error: e }) }
    }
    doc.end()

    // collect buffer
    stream.on('data', (chunk) => buffers.push(chunk))
    await new Promise<void>((resolve) => stream.on('end', () => resolve()))
    const pdfBuffer = Buffer.concat(buffers)

    const pdfUrl = await uploadPdfAndGetUrl(ticketId, pdfBuffer, ticketId)

    // send email via SMTP with inline QR and signed download link
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      to: email,
      subject: 'Your Ticket',
      html: `
        <div style="font-family: Arial, sans-serif; font-size:14px; color:#111">
          <p>Hi ${name},</p>
          <p>Thanks for your purchase. Your ticket is ready — open it here: <a href="${ticketUrl}">View Ticket</a></p>
          <p><img src="${qrSvg}" alt="QR" style="width:200px;height:200px"/></p>
          <p>You can download a printable PDF here: <a href="${pdfUrl}">Download ticket PDF</a></p>
          <p>Show this QR at entry.</p>
        </div>
      `,
    })
    await setTicketStatus(supabase, ticketId, 'issued')
    logInfo('ticket issued', { ticketId, paymentId, email })
    return res.json({ ticketUrl, pdfUrl })
  } catch (err) {
    logError('ticket issuance failed', { ticketId, paymentId, error: (err as Error)?.message })
    if (ticketId && insertedTicket?.id) {
      await setTicketStatus(supabase, ticketId, 'failed')
    }
    return res.status(500).json({ error: 'ticket_failed' })
  }
}
