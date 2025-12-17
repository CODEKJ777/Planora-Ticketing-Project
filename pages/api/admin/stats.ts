import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '../../../lib/adminSession'

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_KEY || '')

function checkAuth(req: NextApiRequest) {
  const token = req.cookies?.[ADMIN_SESSION_COOKIE]
  return verifyAdminSessionToken(token)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkAuth(req)) return res.status(403).json({ error: 'unauthorized' })
  if (req.method !== 'GET') return res.status(405).end()

  const eventId = (req.query.eventId as string) || 'AKCOMSOC2025'

  try {
    // Get total tickets for event
    const { count: totalCount } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('event_id', eventId)
    
    // Get used tickets for event
    const { count: usedCount } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('event_id', eventId).eq('used', true)
    
    // Get tickets by status for event
    const { count: pendingCount } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('event_id', eventId).eq('status', 'pending')
    const { count: issuedCount } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('event_id', eventId).eq('status', 'issued')
    const { count: failedCount } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('event_id', eventId).eq('status', 'failed')
    
    // Calculate revenue (assuming 1000 rupees per ticket)
    const revenue = (issuedCount || 0) * 1000
    
    // Recent registrations for event
    const { data: recentTickets } = await supabase.from('tickets').select('*').eq('event_id', eventId).order('created_at', { ascending: false }).limit(10)

    return res.json({
      eventId,
      total: totalCount || 0,
      used: usedCount || 0,
      valid: (totalCount || 0) - (usedCount || 0),
      pending: pendingCount || 0,
      issued: issuedCount || 0,
      failed: failedCount || 0,
      revenue,
      recentTickets: recentTickets || []
    })
  } catch (err) {
    console.error('stats error', err)
    return res.status(500).json({ error: 'server_error' })
  }
}
