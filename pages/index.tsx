import { useState } from 'react'
import Link from 'next/link'

declare global {
  interface Window {
    Razorpay: new (options: any) => {
      open(): void
      on(event: string, handler: Function): void
      close(): void
    }
  }
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function showError(message: string) {
  alert(`Error: ${message}`)
}

export default function Home() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const priceInr = 1000

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!name.trim()) {
      showError('Please enter your name')
      return
    }
    
    if (!validateEmail(email)) {
      showError('Please enter a valid email address')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      })
      const data = await res.json()
      if (data?.orderId && data?.razorpayKey) {
        const options = {
          key: data.razorpayKey,
          amount: data.amount,
          currency: 'INR',
          name: 'Event Ticket',
          description: 'Ticket purchase',
          order_id: data.orderId,
          handler: async function (response: any) {
            const verify = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, metadata: { name, email } })
            })
            const v = await verify.json()
            if (v?.ticketUrl) window.location.href = v.ticketUrl
            else showError('Payment verified but ticket not generated')
          }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
      } else {
        showError('Failed to create order')
      }
    } catch (err) {
      console.error(err)
      showError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-4xl font-extrabold mb-4">Get your ticket in minutes</h2>
          <p className="text-strong mb-6">Secure payments, instant PDF ticket and QR — email delivered. Small events, big experiences.</p>
          <div className="flex gap-3">
            <a href="#buy" className="btn-primary">Buy Ticket — ₹{priceInr}</a>
            <Link href="/verify" className="btn-ghost">Staff Verify</Link>
          </div>
        </div>

        <div id="buy" className="card p-6 glass soft-border">
          <h3 className="text-xl font-semibold mb-3">Quick purchase</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input required value={name} onChange={e=>setName(e.target.value)} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-strong-accent">Price: <strong>₹{priceInr}</strong></div>
              <button disabled={loading} className="btn-primary">{loading ? 'Processing…' : `Pay ₹${priceInr}`}</button>
            </div>
          </form>
        </div>
      </section>

      <section className="mt-12" id="gallery">
        <h3 className="text-2xl font-bold text-white mb-4">Featured Trail Event</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card glass p-0 overflow-hidden border border-white/10">
            <div className="h-48 w-full gallery-cover" />
            <div className="p-4 space-y-2">
              <p className="text-sm uppercase tracking-wide text-blue-200">Trail Experience</p>
              <h4 className="text-xl font-semibold text-white">Cup of coffee with Elon Musk & Sundar Pichai</h4>
              <p className="text-sm text-strong">An intimate fireside coffee chat with two visionaries. Limited spots, secure your invite now.</p>
              <div className="flex items-center justify-between pt-2">
                <div className="text-lg font-semibold text-white">₹{priceInr}</div>
                <a href="#buy" className="btn-primary">Get Ticket</a>
              </div>
            </div>
          </div>
          <div className="card glass p-4 space-y-2 text-white">
            <h5 className="text-lg font-semibold">What you get</h5>
            <ul className="list-disc list-inside text-sm text-blue-100 space-y-1">
              <li>Exclusive coffee table chat</li>
              <li>Guaranteed seat & unique QR ticket</li>
              <li>Printable PDF delivered instantly</li>
              <li>Supports direct Supabase record tracking</li>
            </ul>
            <div className="pt-2 text-sm text-blue-100">Proceed via the Quick purchase form above; payment uses Razorpay and auto-updates Supabase with your ticket.</div>
          </div>
        </div>
      </section>
    </div>
  )
}
