import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Card } from '../../components/ui/Card'

export default function TicketPage() {
  const router = useRouter()
  const { id } = router.query
  const [ticket, setTicket] = useState<any>(null)

  useEffect(()=>{
    if (!id) return
    fetch(`/api/ticket/${id}`).then(r=>r.json()).then(setTicket)
  },[id])

  if (!ticket) return <div className="p-6 text-slate-300">Loading...</div>
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Card className="p-8 bg-white/5 border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">PASS</span>
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Entry Pass</h1>
            <p className="text-slate-400 text-sm">Ticket ID: {ticket.id}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 items-start">
          <div className="rounded-xl border border-fuchsia-500/30 bg-black/60 p-4 flex items-center justify-center">
            {/* Use plain img to support data URLs reliably */}
            <img src={ticket.qr} alt="QR code" className="w-48 h-48 rounded-md" />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-slate-400">Name</div>
            <div className="text-white font-semibold text-lg">{ticket.name}</div>
            <div className="text-sm text-slate-400 mt-3">Email</div>
            <div className="text-slate-200">{ticket.email}</div>
            <div className="text-sm text-slate-500 mt-3">Event</div>
            <div className="text-violet-400 font-medium">{ticket.event_id || 'AKCOMSOC 2025'}</div>

            <div className="mt-6 flex gap-3">
              <a href={ticket.pdfUrl || `/api/ticket-pdf?id=${ticket.id}`} className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl hover:opacity-90 transition inline-flex items-center">Download PDF</a>
              <Link className="text-sm text-slate-300 hover:underline self-center" href="/my-tickets">Back to my tickets</Link>
            </div>
            <p className="text-xs text-slate-500 mt-2">Show the QR at entry. Do not share publicly.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
