import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Calendar, MapPin, Ticket as TicketIcon, IndianRupee } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'

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
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone)
}

export default function EventRegistrationPage() {
  const router = useRouter()
  const { id } = router.query
  
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [college, setCollege] = useState('')
  const [ieee, setIeee] = useState('')

  useEffect(() => {
    if (!id) return
    
    async function fetchEvent() {
      try {
        const res = await fetch('/api/events')
        if (res.ok) {
          const data = await res.json()
          const foundEvent = data.events?.find((e: any) => e.id === id)
          if (foundEvent) {
            setEvent(foundEvent)
          } else {
            toast.error('Event not found')
          }
        }
      } catch (err) {
        console.error('Error loading event:', err)
        toast.error('Failed to load event')
      } finally {
        setLoading(false)
      }
    }
    
    fetchEvent()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }
    
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email')
      return
    }
    
    if (phone && !validatePhone(phone)) {
      toast.error('Please enter a valid 10-digit phone number')
      return
    }

    setSubmitting(true)

    try {
      // Create order
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: event.price_inr,
          eventId: event.id,
          name,
          email,
          phone,
          college,
          ieee
        })
      })

      if (!orderRes.ok) {
        toast.error('Failed to create order')
        return
      }

      const orderData = await orderRes.json()

      // Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_Rry2rwBqAIzSSw',
        amount: event.price_inr * 100,
        currency: 'INR',
        name: event.title,
        description: `Registration for ${event.title}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                metadata: {
                  eventId: event.id,
                  name,
                  email,
                  phone,
                  college,
                  ieee
                }
              })
            })

            if (verifyRes.ok) {
              const data = await verifyRes.json()
              // Show success modal/popup
              toast.success('🎉 Registration Successful! Check your email for ticket details.', {
                duration: 5000,
                style: {
                  background: '#10b981',
                  color: '#fff',
                  fontSize: '16px',
                  padding: '16px'
                }
              })
              
              // Extract ticket ID from URL
              const ticketId = data.ticketUrl?.split('/ticket/')[1] || data.ticketId
              
              setTimeout(() => {
                if (ticketId) {
                  router.push(`/ticket/${ticketId}`)
                } else {
                  router.push('/my-tickets')
                }
              }, 2000)
            } else {
              const errorData = await verifyRes.json()
              toast.error(`Payment verification failed: ${errorData.error || 'Unknown error'}`)
            }
          } catch (err) {
            console.error('Payment verification error:', err)
            toast.error('Error verifying payment. Please contact support.')
          }
        },
        prefill: {
          name,
          email,
          contact: phone
        },
        theme: {
          color: '#8B5CF6'
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err) {
      console.error('Payment error:', err)
      toast.error('Error processing payment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading event...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Event Not Found</h1>
          <p className="text-slate-400">The event you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/events')}>Browse Events</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <Head>
        <title>{event.title} - Registration</title>
        <script src="https://checkout.razorpay.com/v1/checkout.js" />
      </Head>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Event Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {event.image_url && (
            <div 
              className="h-64 rounded-2xl bg-cover bg-center"
              style={{ backgroundImage: `url(${event.image_url})` }}
            />
          )}
          
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold text-white">{event.title}</h1>
            <p className="text-slate-300 text-lg">{event.description}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            {event.date && (
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-violet-400 font-semibold">
              <IndianRupee className="w-4 h-4" />
              <span>₹{event.price_inr}</span>
            </div>
          </div>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 bg-white/5 border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <TicketIcon className="w-6 h-6 text-violet-400" />
              <h2 className="text-2xl font-bold text-white">Register Now</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-1 block">Full Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-1 block">Email Address *</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-1 block">Phone Number</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-1 block">College/Institution</label>
                <Input
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="Your college name"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-1 block">IEEE Membership Number</label>
                <Input
                  value={ieee}
                  onChange={(e) => setIeee(e.target.value)}
                  placeholder="Optional"
                  disabled={submitting}
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={submitting}
                >
                  Pay ₹{event.price_inr} & Register
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
