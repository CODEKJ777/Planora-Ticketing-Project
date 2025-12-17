import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Play, Calendar, Users, BarChart } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen">

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">
                    <h2 className="text-sm font-semibold tracking-wide text-primary uppercase">Host Your Events With Planora Tickets</h2>
                    <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight">
                        Plan. Publish. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Engage.</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        When planning gets effortless, great events happen. Planora Tickets has you covered with powerful tools to host, manage, and execute memorable experiences seamlessly.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Link href="/host">
                            <Button variant="cosmic" className="h-14 px-8 text-lg">Host Now <ArrowRight className="ml-2" /></Button>
                        </Link>
                        <Link href="/events">
                            <Button variant="outline" className="h-14 px-8 text-lg">Explore Events</Button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Stats Grid */}
            <section className="py-12 border-y border-white/5 bg-white/5 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { label: 'Commission', value: '100%' },
                        { label: 'Tickets Sold', value: '10k+' },
                        { label: 'Active Users', value: '15k+' },
                        { label: 'Events Hosted', value: '90+' },
                    ].map((stat, i) => (
                        <div key={i}>
                            <div className="text-3xl font-display font-bold text-white">{stat.value}</div>
                            <div className="text-sm text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-display font-bold">Everything you need</h2>
                    <p className="text-slate-400 mt-2">Powerful features for modern event organizers.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { title: 'Easy Embeddable', desc: 'Registration Widget for your own site.', icon: Calendar },
                        { title: 'Smart Discovery', desc: 'Get your event in front of thousands.', icon: Users },
                        { title: 'Built-In Certificates', desc: 'Auto-generate certificates for attendees.', icon: Check },
                        { title: 'Customizable Page', desc: 'Stunning event pages that convert.', icon: ArrowRight },
                        { title: 'Automated Alerts', desc: 'WhatsApp & Email reminders included.', icon: Play },
                        { title: 'Real-time Analytics', desc: 'Track sales and check-ins live.', icon: BarChart },
                    ].map((feat, i) => (
                        <Card key={i} className="p-8 bg-surface hover:bg-surface-hover glass-card" hoverEffect>
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                                <feat.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Pricing */}
            <section className="py-24 bg-black/20">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-display font-bold text-center mb-16">Simple Pricing</h2>
                    <div className="grid lg:grid-cols-3 gap-8 items-start">
                        {/* Free */}
                        <Card className="p-8 border-white/10 bg-surface">
                            <h3 className="text-xl font-bold text-white">Free Plan</h3>
                            <p className="text-sm text-slate-400 py-4">Perfect for small community events</p>
                            <div className="text-4xl font-bold text-white mb-6">₹0</div>
                            <ul className="space-y-3 mb-8 text-sm text-slate-300">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> up to 300 attendees</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> Basic event setup</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> Email notifications</li>
                            </ul>
                            <Button variant="outline" className="w-full">Get Started</Button>
                        </Card>

                        {/* Standard - Featured */}
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-secondary blur-lg opacity-40" />
                            <Card className="relative p-8 border-primary/50 bg-black/40">
                                <div className="absolute top-0 right-0 bg-primary text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">POPULAR</div>
                                <h3 className="text-xl font-bold text-white">Standard Plan</h3>
                                <p className="text-sm text-slate-400 py-4">Essential tools for growing events</p>
                                <div className="text-4xl font-bold text-white mb-6">4% <span className="text-lg font-normal text-slate-400">/ ticket</span></div>
                                <ul className="space-y-3 mb-8 text-sm text-slate-300">
                                    <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> Everything in Free</li>
                                    <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> Paid ticket support</li>
                                    <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> Custom ticket styles</li>
                                    <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> Attendee profiles</li>
                                </ul>
                                <Button variant="cosmic" className="w-full">Start Hosting</Button>
                            </Card>
                        </div>

                        {/* Org */}
                        <Card className="p-8 border-white/10 bg-surface">
                            <h3 className="text-xl font-bold text-white">Organisation</h3>
                            <p className="text-sm text-slate-400 py-4">Centralized control for teams</p>
                            <div className="text-4xl font-bold text-white mb-6">₹25k <span className="text-lg font-normal text-slate-400">/ year</span></div>
                            <ul className="space-y-3 mb-8 text-sm text-slate-300">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> Multiple events</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> Team management</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> Advanced analytics</li>
                            </ul>
                            <Button variant="outline" className="w-full">Contact Sales</Button>
                        </Card>
                    </div>
                </div>
            </section>

            <footer className="py-12 border-t border-white/10 text-center text-slate-500 text-sm">
                <p>© 2025 Planora Tickets — All Rights Reserved</p>
            </footer>
        </div>
    )
}
