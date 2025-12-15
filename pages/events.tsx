import Link from 'next/link'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function EventsPage() {
  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto space-y-8">
      <Head>
        <title>Events</title>
      </Head>
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Upcoming Events</h1>
        <p className="text-slate-400">Discover and register for our latest events.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-0 overflow-hidden bg-white/5 border-white/10">
            <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 h-36 flex items-center justify-center">
              <div className="text-white text-xl font-semibold">AKCOMSOC 2025</div>
            </div>
            <div className="p-5 space-y-3">
              <h2 className="text-white font-bold text-lg">AKCOMSOC 2025</h2>
              <p className="text-slate-300 text-sm">A focused deep dive into 5G networks and Communication IoT—latency, edge, massive IoT, and secure protocols powering next-gen experiences.</p>
              <div className="flex justify-between items-center">
                <div className="text-slate-400 text-sm">Fee: ₹1000</div>
                <Link href="/akcomsoc-2025" passHref>
                  <Button variant="primary" className="px-4">Register</Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
