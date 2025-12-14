import { useEffect, useState } from 'react'
import Link from 'next/link'
import supabase from '../lib/supabaseClient'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Calendar, Search, MapPin, Ticket } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ExplorePage() {
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function load() {
            // Fetch public events (RLS policy allows reading all events)
            const { data } = await supabase
                .from('events')
                .select('*, profiles(full_name)')
                .order('date', { ascending: true })

            if (data) setEvents(data)
            setLoading(false)
        }
        load()
    }, [])

    const filtered = events.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.location?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="min-h-screen py-10 px-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
                <div className="space-y-2">
                    <h1 className="text-4xl font-display font-bold text-white">Explore Events</h1>
                    <p className="text-slate-400">Discover trending events happening around you.</p>
                </div>
                <div className="w-full md:w-96 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search events, locations..."
                        className="pl-10"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500">Scanning for signals...</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.length === 0 && (
                        <div className="col-span-full text-center py-20 text-slate-500">
                            No events found matching your search.
                        </div>
                    )}
                    {filtered.map((e, i) => (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={e.id}>
                            <Card hoverEffect className="h-full flex flex-col p-0 overflow-hidden bg-surface group">
                                <div className="aspect-video bg-black/40 relative overflow-hidden">
                                    {e.image_url ? (
                                        <img src={e.image_url} alt={e.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                                            <Calendar className="w-12 h-12 text-white/10" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                                        {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{e.title}</h3>
                                        <p className="text-sm text-primary">{e.profiles?.full_name || 'Planora Host'}</p>
                                    </div>

                                    {e.location && (
                                        <div className="flex items-center text-xs text-slate-400">
                                            <MapPin className="w-3 h-3 mr-1" /> {e.location}
                                        </div>
                                    )}

                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="text-lg font-bold text-white">
                                            {e.price_inr === 0 ? 'Free' : `₹${e.price_inr}`}
                                        </div>
                                        <Link href={`/e/${e.id}`}>
                                            <Button variant="cosmic" className="h-9 px-4 text-xs">
                                                Get Ticket <Ticket className="ml-2 w-3 h-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
