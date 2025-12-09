import crypto from 'crypto'

const COOKIE_NAME = 'admin_session'
const DEFAULT_TTL_SECONDS = Number(process.env.ADMIN_SESSION_TTL || 3600)

function getSecret() {
  const secret = process.env.ADMIN_SECRET
  if (!secret) {
    throw new Error('ADMIN_SECRET is not configured')
  }
  return secret
}

export function createAdminSessionToken(ttlSeconds: number = DEFAULT_TTL_SECONDS) {
  const nonce = crypto.randomBytes(16).toString('hex')
  const expires = Date.now() + ttlSeconds * 1000
  const payload = `${nonce}.${expires}`
  const signature = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex')
  return `${payload}.${signature}`
}

export function verifyAdminSessionToken(token?: string | null) {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [nonce, expires, signature] = parts
  if (!nonce || !expires || !signature) return false
  const payload = `${nonce}.${expires}`
  const expectedSignature = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex')
  if (expectedSignature.length !== signature.length) return false
  const expectedBuffer = Buffer.from(expectedSignature, 'hex')
  const providedBuffer = Buffer.from(signature, 'hex')
  if (expectedBuffer.length !== providedBuffer.length) return false
  if (!crypto.timingSafeEqual(expectedBuffer, providedBuffer)) return false
  const expNumber = Number(expires)
  if (!Number.isFinite(expNumber)) return false
  if (Date.now() > expNumber) return false
  return true
}

export function createSessionCookie(token: string, ttlSeconds: number = DEFAULT_TTL_SECONDS) {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : ''
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${ttlSeconds};${secure}`
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : ''
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0;${secure}`
}

export { COOKIE_NAME as ADMIN_SESSION_COOKIE, DEFAULT_TTL_SECONDS }
