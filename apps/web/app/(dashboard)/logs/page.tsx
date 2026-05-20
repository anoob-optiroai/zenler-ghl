'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'

interface LogEntry {
  id: string
  eventKey: string
  direction: 'ZENLER_TO_GHL' | 'GHL_TO_ZENLER'
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'RETRYING'
  payload?: any
  response?: any
  errorMessage?: string
  retryCount: number
  createdAt: string
  processedAt?: string
}

const statusColors = {
  SUCCESS: 'bg-green-500/15 text-green-400 border-green-500/20',
  FAILED: 'bg-red-500/15 text-red-400 border-red-500/20',
  PENDING: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  RETRYING: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
}

const dotColors = {
  SUCCESS: 'bg-green-400',
  FAILED: 'bg-red-400',
  PENDING: 'bg-yellow-400 animate-pulse',
  RETRYING: 'bg-orange-400 animate-pulse',
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'SUCCESS' | 'FAILED'>('ALL')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchLogs = async () => {
    const res = await fetch(`/api/logs?filter=${filter}`)
    const data = await res.json()
    if (data.logs) setLogs(data.logs)
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    fetchLogs()
  }, [filter])

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchLogs, 5000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoRefresh, filter])

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Logs</h1>
          <p className="text-slate-400 text-sm mt-1">Every event processed by your connection</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-all ${
              autoRefresh
                ? 'border-green-500/30 bg-green-500/10 text-green-400'
                : 'border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
            {autoRefresh ? 'Live' : 'Paused'}
          </button>

          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-xs transition-all"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5">
        {(['ALL', 'SUCCESS', 'FAILED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              filter === f
                ? 'border-blue-500/40 bg-blue-500/15 text-blue-400'
                : 'border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Logs table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-blue-400" size={24} />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            No events yet. Events will appear here in real time.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 text-xs text-slate-500 font-medium bg-white/[0.02]">
              <span />
              <span>Event</span>
              <span>Direction</span>
              <span>Status</span>
              <span>Retries</span>
              <span>Time</span>
            </div>

            {logs.map((log) => (
              <div key={log.id}>
                <button
                  onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                  className="w-full grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3.5 text-left hover:bg-white/[0.02] transition-colors items-center"
                >
                  <span className="text-slate-600">
                    {expanded === log.id ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </span>
                  <span className="font-mono text-sm text-slate-200">{log.eventKey}</span>
                  <span className="text-xs text-slate-500">
                    {log.direction === 'ZENLER_TO_GHL' ? 'Zenler → GHL' : 'GHL → Zenler'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[log.status]}`}>
                    {log.status}
                  </span>
                  <span className={`text-xs ${log.retryCount > 0 ? 'text-orange-400' : 'text-slate-600'}`}>
                    {log.retryCount}x
                  </span>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </button>

                {/* Expanded payload */}
                {expanded === log.id && (
                  <div className="px-5 pb-5 bg-white/[0.01]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {log.payload && (
                        <div>
                          <p className="text-xs text-slate-500 mb-2">Payload</p>
                          <pre className="text-xs text-slate-300 bg-black/30 rounded-xl p-4 overflow-auto max-h-48">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </div>
                      )}
                      {(log.response || log.errorMessage) && (
                        <div>
                          <p className="text-xs text-slate-500 mb-2">
                            {log.errorMessage ? 'Error' : 'Response'}
                          </p>
                          <pre className={`text-xs rounded-xl p-4 overflow-auto max-h-48 ${
                            log.errorMessage
                              ? 'text-red-300 bg-red-900/20'
                              : 'text-slate-300 bg-black/30'
                          }`}>
                            {log.errorMessage || JSON.stringify(log.response, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
