import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send } from 'lucide-react'
import AstroMascot from './AstroMascot'

type Message = {
  id: string
  role: 'user' | 'bot'
  text: string
  timestamp: Date
}

const MASCOT_GREETING = "Hi! I'm ASTRO, your event assistant! 🎉 Ask me anything about AKCOMSOC 2025, tickets, or registration!"

type Intent = { id: string; keywords: string[]; response: (msg: string) => string }

const INTENTS: Intent[] = [
  {
    id: 'akcomsoc',
    keywords: ['akcomsoc', 'akcom', 'soc25', '2025'],
    response: () => 'AKCOMSOC 2025 focuses on 5G networks and Communication IoT. Fee is ₹1000. Register at /akcomsoc-2025.'
  },
  {
    id: 'pricing',
    keywords: ['price', 'cost', 'fee', 'rupees', '₹', 'rs'],
    response: () => 'Registration fee is ₹1000. Discounts may apply for IEEE members.'
  },
  {
    id: 'payment',
    keywords: ['payment', 'razorpay', 'pay', 'upi', 'card'],
    response: () => 'Payments are processed via Razorpay. After payment, your ticket with QR is emailed instantly.'
  },
  {
    id: 'ticket',
    keywords: ['ticket', 'download', 'pdf', 'qr', 'entry pass'],
    response: () => 'Find tickets at /my-tickets using your email, or use the emailed link. PDF download is included.'
  },
  {
    id: 'support',
    keywords: ['contact', 'help', 'support', 'issue', 'problem'],
    response: () => 'We\'re here to help! Email support@planora.app or ask here for guidance.'
  },
  {
    id: 'schedule',
    keywords: ['when', 'date', 'time', 'schedule'],
    response: () => 'Event schedule will be announced to registered attendees. Stay tuned!'
  },
  {
    id: 'venue',
    keywords: ['location', 'venue', 'where', 'address'],
    response: () => 'Venue details will be shared with registrants. Register to receive updates.'
  },
  {
    id: 'ieee',
    keywords: ['ieee', 'membership'],
    response: () => 'IEEE members can provide their number during registration for verification.'
  }
]

const FOLLOW_UPS: Record<string, string[]> = {
  akcomsoc: ['What\'s included?', 'How do I register?', 'Any discounts?'],
  pricing: ['Any student discount?', 'Is GST included?'],
  payment: ['Is UPI supported?', 'Can I pay later?'],
  ticket: ['Where to find my ticket?', 'Can I reschedule?'],
  support: ['Contact support', 'Report an issue'],
  schedule: ['When does it start?', 'How long is it?'],
  venue: ['Is parking available?', 'Exact address?'],
  ieee: ['How to add IEEE ID?']
}

function scoreIntent(msg: string, intent: Intent): number {
  const text = msg.toLowerCase()
  return intent.keywords.reduce((score, kw) => score + (text.includes(kw) ? 1 : 0), 0)
}

function getBotResponse(userMsg: string): { text: string; followUps?: string[] } {
  let best: { intent: Intent; score: number } | null = null
  for (const intent of INTENTS) {
    const s = scoreIntent(userMsg, intent)
    if (!best || s > best.score) best = { intent, score: s }
  }
  if (best && best.score > 0) {
    const id = best.intent.id
    return { text: best.intent.response(userMsg), followUps: FOLLOW_UPS[id] }
  }
  return {
    text: "I'm here to help! Ask about AKCOMSOC, tickets, registration, pricing, payment, venue, or schedule.",
    followUps: ['Ticket price', 'How to register', 'Where is the venue?']
  }
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'bot', text: MASCOT_GREETING, timestamp: new Date() }
  ])
  const [input, setInput] = useState('')

  async function sendMessage(textOverride?: string) {
    const text = (textOverride ?? input).trim()
    if (!text) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    if (!textOverride) setInput('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      })
      if (res.ok) {
        const data = await res.json()
        const botReply: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: data.text, timestamp: new Date() }
        setMessages(prev => [...prev, botReply])
        return
      }
    } catch {}
    // Fallback to local intents
    const resp = getBotResponse(text)
    const botReply: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: resp.text, timestamp: new Date() }
    setMessages(prev => [...prev, botReply])
    if (resp.followUps?.length) {
      const tips = 'Suggestions: ' + resp.followUps.map(f => `• ${f}`).join('  ')
      const helper: Message = { id: (Date.now() + 2).toString(), role: 'bot', text: tips, timestamp: new Date() }
      setMessages(prev => [...prev, helper])
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12">
                  <AstroMascot />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">ASTRO</div>
                  <div className="text-xs text-slate-400">Your Event Assistant</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition">
                <X className="w-4 h-4 text-slate-400" />
              </button>

            </div>
              

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                        : 'bg-white/5 text-slate-200 border border-white/10'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={() => sendMessage()}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl hover:opacity-90 transition"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              {/* Quick follow-up chips */}
              <div className="mt-3 flex flex-wrap gap-2">
                {['Ticket price', 'How to register', 'Where is the venue?'].map((tip) => (
                  <button
                    key={tip}
                    onClick={() => sendMessage(tip)}
                    className="text-xs px-3 py-1 rounded-full border border-white/10 text-slate-300 hover:border-white/30 hover:bg-white/5"
                  >
                    {tip}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full shadow-lg flex items-center justify-center z-50 hover:shadow-xl transition overflow-hidden"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="w-10 h-10">
            <AstroMascot />
          </div>
        )}
      </motion.button>
    </>
  )
}
