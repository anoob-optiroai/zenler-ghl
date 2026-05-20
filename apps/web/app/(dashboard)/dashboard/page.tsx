import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Activity, CheckCircle2, AlertCircle, Zap } from 'lucide-react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// Force dynamic rendering — this page reads session + DB at request time
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  const connection = await prisma.connection.findFirst({
    where: { userId },
    include: {
      eventConfigs: true,
      eventLogs: {
        orderBy: { createdAt: 'desc' },
        take: 8,
      },
    },
  })

  const totalLogs = await prisma.eventLog.count({
    where: { connectionId: connection?.id },
  })
  const successLogs = await prisma.eventLog.count({
    where: { connectionId: connection?.id, status: 'SUCCESS' },
  })
  const failedLogs = await prisma.eventLog.count({
    where: { connectionId: connection?.id, status: 'FAILED' },
  })
  const activeEvents = connection?.eventConfigs.filter((e: { isEnabled: boolean }) => e.isEnabled).length ?? 0

  const stats = [
    { label: 'Total Events', value: totalLogs.toLocaleString(), icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Successful', value: successLogs.toLocaleString(), icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    { label: 'Failed', value: failedLogs.toLocaleString(), icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { label: 'Active Events', value: `${activeEvents}/18`, icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-slate-400 text-sm mt-1">
          {connection?.isActive ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 status-live inline-block" />
              Connection active
            </span>
          ) : (
            <span className="text-yellow-400">
              No connection yet.{' '}
              <Link href="/connect" className="text-blue-400 hover:underline">
                Set it up →
              </Link>
            </span>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className={`glass rounded-2xl p-5 border ${s.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-xs font-medium">{s.label}</p>
              <s.icon size={16} className={s.color} />
            </div>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent events */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold text-sm">Recent Events</h2>
          <Link href="/logs" className="text-blue-400 text-xs hover:underline flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {connection?.eventLogs.length === 0 || !connection ? (
          <div className="px-6 py-12 text-center text-slate-500 text-sm">
            No events yet. Events will appear here once your connection is live.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {connection.eventLogs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between px-6 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      log.status === 'SUCCESS'
                        ? 'bg-green-400'
                        : log.status === 'FAILED'
                        ? 'bg-red-400'
                        : 'bg-yellow-400'
                    }`}
                  />
                  <span className="text-sm font-mono text-slate-200">{log.eventKey}</span>
                  <span className="text-xs text-slate-500">
                    {log.direction === 'ZENLER_TO_GHL' ? 'Zenler → GHL' : 'GHL → Zenler'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      log.status === 'SUCCESS'
                        ? 'bg-green-500/15 text-green-400'
                        : log.status === 'FAILED'
                        ? 'bg-red-500/15 text-red-400'
                        : 'bg-yellow-500/15 text-yellow-400'
                    }`}
                  >
                    {log.status}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions if no connection */}
      {!connection && (
        <div className="mt-6 glass rounded-2xl p-8 border border-blue-500/20 text-center">
          <h3 className="text-white font-semibold mb-2">Get started in 2 minutes</h3>
          <p className="text-slate-400 text-sm mb-5">
            Connect your Zenler and GHL accounts, then pick the events you want to sync.
          </p>
          <Link href="/connect" className="btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm">
            Connect platforms <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  )
}
