import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { ShieldCheck, LogOut, Search, CheckCircle, XCircle } from 'lucide-react'

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
        if (res.status === 403) setAuthState('unauthenticated')
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
      if (data?.authenticated) await search()
      else setTickets([])
    } catch (err) {
      console.error(err)
      setAuthState('unauthenticated')
    }
  }, [search])

  useEffect(() => { checkSession() }, [checkSession])

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret }) })
      if (res.ok) {
        setSecret('')
        setAuthState('authenticated')
        toast.success('Authenticated')
        await search()
      } else {
        toast.error('Invalid secret')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/session', { method: 'DELETE' })
    setAuthState('unauthenticated')
    setTickets([])
    toast.success('Logged out')
  }

  async function toggle(id: string) {
    if (!isAuthed) return
    const res = await fetch('/api/admin/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'toggle' }) })
    if (res.status === 403) {
      setAuthState('unauthenticated')
      return
    }
    await search()
    toast.success('Status updated')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <ShieldCheck className="text-primary" /> Admin Portal
        </h1>
        {isAuthed && (
          <Button onClick={handleLogout} variant="ghost" className="text-sm h-10 px-4">
            <LogOut className="w-4 h-4 mr-2" /> Log out
          </Button>
        )}
      </div>

      {authState !== 'authenticated' ? (
        <div className="flex justify-center pt-10">
          <Card className="p-8 space-y-6 max-w-md w-full glass-card">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold">Admin Access</h2>
              <p className="text-sm text-slate-400">Enter secure key to manage tickets.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Secret Key"
                value={secret}
                onChange={e => setSecret(e.target.value)}
                disabled={loading}
              />
              <Button isLoading={loading} className="w-full" variant="cosmic">Authenticate</Button>
            </form>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="p-6 bg-white/5 border-white/5">
            <form onSubmit={search} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by Ticket ID, Email or Name..."
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  className="bg-black/20"
                />
              </div>
              <Button isLoading={loading} variant="primary" className="w-32">
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
            </form>
          </Card>

          <div className="grid gap-4">
            {tickets.length === 0 && (
              <div className="text-center py-12 text-slate-500">No tickets found matching your query.</div>
            )}
            {tickets.map(t => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface hover:bg-surface-hover border border-white/5 rounded-xl p-4 flex items-start justify-between transition-colors"
              >
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{t.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${t.used ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                      {t.used ? 'USED' : 'VALID'}
                    </span>
                  </div>
                  <div className="font-medium text-white">{t.name}</div>
                  <div className="text-slate-400">{t.email}</div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    {t.phone && <span className="px-2 py-0.5 rounded bg-white/5">📞 {t.phone}</span>}
                    {t.college && <span className="px-2 py-0.5 rounded bg-white/5">🏫 {t.college}</span>}
                    {t.ieee && <span className="px-2 py-0.5 rounded bg-white/5">IEEE: {t.ieee}</span>}
                  </div>
                </div>
                <div>
                  <Button onClick={() => toggle(t.id)} variant="ghost" className="h-9 text-xs">
                    {t.used ? 'Mark Valid' : 'Mark Used'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
