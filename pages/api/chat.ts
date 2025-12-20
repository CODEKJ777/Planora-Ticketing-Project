import type { NextApiRequest, NextApiResponse } from 'next'

// Lazy import to avoid build errors if SDK missing at runtime
let GoogleGenerativeAI: any
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI
} catch {}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey || !GoogleGenerativeAI) {
    return res.status(501).json({ error: 'not_configured' })
  }

  try {
    const { message, history } = req.body as { message?: string; history?: Array<{ role: string; text: string }> }
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'invalid_request' })
    }

    const client = new GoogleGenerativeAI(apiKey)
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Build a concise prompt with context
    const system = `You are ASTRO, the Planora event assistant. Be concise, friendly, and helpful. Focus on AKCOMSOC 2025, tickets, registration, pricing, payment, venue, and schedule. If unsure, suggest visiting the registration page or contacting support@planora.app.`
    const contents = [
      { role: 'user', parts: [{ text: system }] },
      ...(Array.isArray(history) ? history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })) : []),
      { role: 'user', parts: [{ text: message }] }
    ]

    const result = await model.generateContent({ contents })
    const text = result?.response?.text?.() || result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.'
    return res.status(200).json({ text })
  } catch (err: any) {
    return res.status(500).json({ error: 'gemini_error', detail: err?.message || 'unknown' })
  }
}
