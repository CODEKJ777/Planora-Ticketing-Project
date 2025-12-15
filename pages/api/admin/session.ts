// Developed by: Kalidas KJ
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  createSessionCookie,
  clearSessionCookie,
  verifyAdminSessionToken,
} from '../../../lib/adminSession'

const DEFAULT_ADMIN_SECRET = '7532159'

function getAdminSecret() {
  return process.env.ADMIN_SECRET || DEFAULT_ADMIN_SECRET
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const token = req.cookies?.[ADMIN_SESSION_COOKIE]
      const authenticated = verifyAdminSessionToken(token)
      return res.status(200).json({ authenticated })
    }

    if (req.method === 'POST') {
      const { secret } = req.body || {}
      const provided = typeof secret === 'string' ? secret.trim() : ''
      const expected = getAdminSecret().trim()
      if (!provided) return res.status(400).json({ error: 'missing_secret' })
      if (provided !== expected) return res.status(401).json({ error: 'invalid_secret' })
      const token = createAdminSessionToken()
      res.setHeader('Set-Cookie', createSessionCookie(token))
      return res.status(200).json({ ok: true })
    }

    if (req.method === 'DELETE') {
      res.setHeader('Set-Cookie', clearSessionCookie())
      return res.status(200).json({ ok: true })
    }
  } catch (err) {
    console.error('admin session error', err)
    return res.status(500).json({ error: 'server_error' })
  }

  return res.status(405).end()
}
