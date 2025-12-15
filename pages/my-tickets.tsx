import { useEffect, useState } from 'react'
import supabase from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function MyTickets() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [emailLookup, setEmailLookup] = useState('')
  const [lookupResults, setLookupResults] = useState<any[]>([])
  const router = useRouter()

  useEffect(()=>{
    async function load() {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) {
        router.push('/auth')
        return
      }
      const uid = user.user.id
      const { data, error } = await supabase.from('tickets').select('*').eq('user_id', uid)
      if (error) console.error(error)
      setTickets(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function lookupByEmail(e: React.FormEvent) {
    e.preventDefault()
    const email = emailLookup.trim()
    if (!email) {
      toast.error('Enter an email to search')
      return
    }
    try {
      const res = await fetch('/api/tickets-by-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.error || 'Lookup failed')
        return
      }
      setLookupResults(data.tickets || [])
      if ((data.tickets || []).length === 0) toast('No tickets found for that email')
    } catch (err) {
      toast.error('Lookup failed')
    }
  }

  if (loading) return <div className="p-6 text-strong">Loading...</div>
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-medium text-white">My Tickets</h1>
        <button onClick={signOut} className="btn-ghost">Sign out</button>
      </div>

      <div className="card p-4 mb-6 bg-white/5 border border-white/10">
        <h2 className="text-white font-semibold mb-2">Find tickets by email</h2>
        <form onSubmit={lookupByEmail} className="flex gap-3">
          <input
            className="input flex-1"
            placeholder="Enter the email used for purchase"
            value={emailLookup}
            onChange={e => setEmailLookup(e.target.value)}
          />
          <button className="btn-primary px-4" type="submit">Search</button>
        </form>
        {lookupResults.length > 0 && (
          <div className="mt-4 space-y-3">
            {lookupResults.map(t => (
              <div key={t.id} className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-slate-300 text-xs">{t.email}</div>
                  {t.college && <div className="text-slate-400 text-xs">{t.college}</div>}
                </div>
                <div className="flex gap-3 text-sm">
                  <Link className="text-blue-200 hover:underline" href={`/ticket/${t.id}`}>Open</Link>
                  <a className="text-blue-200 hover:underline" href={t.pdfUrl || `/api/ticket-pdf?id=${t.id}`}>Download PDF</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-4">
        {tickets.length === 0 && <p className="text-blue-200">No tickets yet.</p>}
        {tickets.map(t=> (
          <motion.div key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card p-4 flex items-center gap-4">
            <Image src={t.qr} alt="qr" width={120} height={120} className="rounded-lg h-auto w-auto" />
            <div className="flex-1">
              <p className="font-medium text-white">{t.name}</p>
              <p className="text-sm text-strong">{t.email}</p>
              <div className="flex gap-3 mt-3">
                <Link className="text-sm text-blue-200 hover:underline" href={`/ticket/${t.id}`}>Open ticket</Link>
                <a className="text-sm text-blue-200 hover:underline" href={t.pdfUrl || `/api/ticket-pdf?id=${t.id}`}>Download PDF</a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
