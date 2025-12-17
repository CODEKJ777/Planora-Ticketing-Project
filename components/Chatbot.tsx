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

const FAQ_RESPONSES: Record<string, string> = {
  'akcomsoc': 'AKCOMSOC 2025 is a focused event on 5G networks and Communication IoT. Registration fee is ₹1000. You can register at /akcomsoc-2025!',
  'price|cost|fee|rupees': 'The registration fee for AKCOMSOC 2025 is ₹1000.',
  'payment|razorpay': 'We use Razorpay for secure payments. After registration, you\'ll receive a ticket via email with a QR code.',
  'ticket|download|pdf': 'After payment, check your email for the ticket PDF. You can also find your tickets at /my-tickets by entering your email.',
  'contact|help|support': 'For support, email us or visit our admin panel. We\'re here to help!',
  'when|date|time': 'Event details including date and time will be announced soon. Stay tuned!',
  'location|venue|where': 'Venue details will be shared with registered participants. Register now to stay updated!',
  'ieee': 'IEEE members can enter their IEEE number during registration for verification.',
}

function getBotResponse(userMsg: string): string {
  const lower = userMsg.toLowerCase()
  for (const [pattern, response] of Object.entries(FAQ_RESPONSES)) {
    const regex = new RegExp(pattern, 'i')
    if (regex.test(lower)) return response
  }
  return "I'm here to help! You can ask me about AKCOMSOC 2025, tickets, registration, pricing, or payment. What would you like to know?"
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'bot', text: MASCOT_GREETING, timestamp: new Date() }
  ])
  const [input, setInput] = useState('')

  function sendMessage() {
    const text = input.trim()
    if (!text) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTimeout(() => {
      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: getBotResponse(text),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botReply])
    }, 600)
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
                  onClick={sendMessage}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl hover:opacity-90 transition"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
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
