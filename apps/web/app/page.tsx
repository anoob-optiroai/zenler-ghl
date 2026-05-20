import Link from 'next/link'
import { ArrowRight, Zap, RefreshCw, Shield, Activity } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#090e1a] overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-lg tracking-tight">
            Zenler ↔ GHL
          </span>
          <span className="text-slate-500 text-sm font-normal">by devdelulu</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="#features" className="text-slate-400 hover:text-white text-sm transition-colors">
            Features
          </Link>
          <Link href="#events" className="text-slate-400 hover:text-white text-sm transition-colors">
            Events
          </Link>
          <Link href="/login" className="text-slate-400 hover:text-white text-sm transition-colors">
            Sign in
          </Link>
          <Link
            href="/register"
            className="btn-glow px-4 py-2 rounded-lg text-sm font-semibold text-white"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-8 text-center">
        {/* Background glow */}
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            REAL-TIME BIDIRECTIONAL SYNC
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Connect{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Zenler
            </span>{' '}
            &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
              GoHighLevel
            </span>
            <br />
            in minutes
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
            Every enrollment, payment, lesson completion, and contact event — synced live,
            both ways. No code. No Zapier. Just connect and go.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="btn-glow flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-base"
            >
              Start for free <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/20 font-semibold text-base transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Mock UI preview */}
        <div className="relative z-10 mt-16 max-w-3xl mx-auto">
          <div className="glass rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-900/20">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-white/[0.02]">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-slate-500">zenler.devdelulu.com/dashboard</span>
            </div>

            {/* Dashboard preview */}
            <div className="p-6 bg-[#0d1424]">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Events Synced', value: '2,847', color: 'text-blue-400' },
                  { label: 'Success Rate', value: '99.8%', color: 'text-green-400' },
                  { label: 'Active Events', value: '14/18', color: 'text-indigo-400' },
                ].map((stat) => (
                  <div key={stat.label} className="glass rounded-xl p-4 text-left">
                    <p className="text-slate-500 text-xs mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Event log rows */}
              <div className="space-y-2">
                {[
                  { event: 'enrollment.created', from: 'Zenler', to: 'GHL', status: 'success', time: '2s ago' },
                  { event: 'contact.created', from: 'GHL', to: 'Zenler', status: 'success', time: '14s ago' },
                  { event: 'payment.received', from: 'Zenler', to: 'GHL', status: 'success', time: '1m ago' },
                  { event: 'opportunity.won', from: 'GHL', to: 'Zenler', status: 'success', time: '3m ago' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between glass rounded-lg px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-blue-300">{row.event}</span>
                      <span className="text-xs text-slate-500">{row.from} → {row.to}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{row.time}</span>
                      <span className="w-2 h-2 rounded-full bg-green-400 status-live" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Everything you need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: <Zap className="text-blue-400" size={22} />,
                title: 'Real-time sync',
                desc: 'Events fire instantly via webhooks. No polling delays, no cron jobs.',
              },
              {
                icon: <RefreshCw className="text-indigo-400" size={22} />,
                title: 'Both directions',
                desc: 'Zenler → GHL and GHL → Zenler. Full bidirectional flow out of the box.',
              },
              {
                icon: <Shield className="text-green-400" size={22} />,
                title: 'Retry logic',
                desc: 'Failed events are automatically retried with exponential backoff.',
              },
              {
                icon: <Activity className="text-purple-400" size={22} />,
                title: 'Live event logs',
                desc: 'See every event with status, payload, and response in real time.',
              },
            ].map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events section */}
      <section id="events" className="py-20 px-8 bg-[#0d1424]/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-3">
            18 events supported
          </h2>
          <p className="text-slate-400 text-center mb-12">Pick exactly which ones you need.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Zenler → GHL */}
            <div className="glass rounded-2xl p-6 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-sm font-bold text-blue-400">ZENLER</span>
                <span className="text-slate-500">→</span>
                <span className="text-sm font-bold text-indigo-400">GHL</span>
              </div>
              <ul className="space-y-3">
                {[
                  'user.registered',
                  'enrollment.created',
                  'enrollment.cancelled',
                  'lesson.completed',
                  'course.completed',
                  'payment.received',
                  'payment.failed',
                  'subscription.cancelled',
                  'certificate.issued',
                  'quiz.passed',
                ].map((e) => (
                  <li key={e} className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                    <span className="text-sm font-mono text-slate-300">{e}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* GHL → Zenler */}
            <div className="glass rounded-2xl p-6 border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-sm font-bold text-indigo-400">GHL</span>
                <span className="text-slate-500">→</span>
                <span className="text-sm font-bold text-blue-400">ZENLER</span>
              </div>
              <ul className="space-y-3">
                {[
                  'contact.created',
                  'contact.updated',
                  'contact.deleted',
                  'tag.added',
                  'tag.removed',
                  'opportunity.created',
                  'opportunity.won',
                  'opportunity.status_changed',
                ].map((e) => (
                  <li key={e} className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                    <span className="text-sm font-mono text-slate-300">{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-8 border-t border-white/5 text-center">
        <p className="text-slate-500 text-sm">
          © 2025 devdelulu · Built by{' '}
          <a href="https://devdelulu.com" className="text-blue-400 hover:underline">
            devdelulu.com
          </a>
        </p>
      </footer>
    </main>
  )
}
