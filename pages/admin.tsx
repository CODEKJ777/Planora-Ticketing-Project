import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

type AuthState = 'unknown' | 'authenticated' | 'unauthenticated'

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [q, setQ] = useState('')
  const [tickets, setTickets] = useState<any[]>([])
  const [authState, setAuthState] = useState<AuthState>('unknown')
  const [loading, setLoading] = useState(false)
  const isAuthed = authState === 'authenticated'

  const search = useCallback(async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault()
    if (!isAuthed) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/tickets?q=${encodeURIComponent(q)}`)
      if (!res.ok) {
        if (res.status === 403) {
          setAuthState('unauthenticated')
        }
        return
      }
      const j = await res.json()
      setTickets(j || [])
    } finally {
      setLoading(false)
    }
  }, [isAuthed, q])

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/session')
      const data = await res.json()
      setAuthState(data?.authenticated ? 'authenticated' : 'unauthenticated')
      if (data?.authenticated) {
        await search()
      } else {
        setTickets([])
      }
    } catch (err) {
      console.error(err)
      setAuthState('unauthenticated')
    }
  }, [search])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret }) })
      if (res.ok) {
        setSecret('')
        setAuthState('authenticated')
        await search()
      } else {
        const body = await res.json().catch(()=>({}))
        alert(body?.error || 'Invalid secret')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/session', { method: 'DELETE' })
    setAuthState('unauthenticated')
    setTickets([])
  }

  async function toggle(id: string) {
    if (!isAuthed) return
    const res = await fetch('/api/admin/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'toggle' }) })
    if (res.status === 403) {
      setAuthState('unauthenticated')
      return
    }
    await search()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-white">Admin - Tickets</h1>
        {isAuthed && <button onClick={handleLogout} className="btn-ghost text-sm">Log out</button>}
      </div>

      {authState !== 'authenticated' ? (
        <form onSubmit={handleLogin} className="card glass p-4 space-y-3 max-w-md">
          <p className="text-sm text-strong">Enter the admin secret to start managing tickets.</p>
          <input required placeholder="Admin secret" value={secret} onChange={e=>setSecret(e.target.value)} className="p-2 bg-transparent border border-white/6 rounded-md text-white" />
          <button disabled={loading} className="btn-primary">{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
      ) : (
        <div className="space-y-4">
          <form onSubmit={search} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <input placeholder="search id or email" value={q} onChange={e=>setQ(e.target.value)} className="w-full p-2 bg-transparent border border-white/6 rounded-md text-white" />
            </div>
            <button className="btn-primary">{loading ? 'Searching…' : 'Search'}</button>
          </form>

          <div className="space-y-3">
            {tickets.length === 0 && <p className="text-sm text-strong">No tickets found.</p>}
            {tickets.map(t => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{t.id}</div>
                  <div className="text-sm text-strong">{t.email} — {t.name}</div>
                  <div className="text-xs text-strong">Used: {String(t.used)}</div>
                </div>
                <div>
                  <button onClick={()=>toggle(t.id)} className="btn-ghost">Toggle used</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
