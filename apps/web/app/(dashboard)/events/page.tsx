'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, ArrowRight, Info } from 'lucide-react'
import { ZENLER_TO_GHL_EVENTS, GHL_TO_ZENLER_EVENTS, EventDefinition } from '@/lib/events'
import Link from 'next/link'

interface EnabledMap {
  [key: string]: boolean
}

function EventToggle({
  event,
  enabled,
  onChange,
}: {
  event: EventDefinition
  enabled: boolean
  onChange: (key: string, val: boolean) => void
}) {
  return (
    <div
      className={`flex items-start justify-between p-4 rounded-xl border transition-all ${
        enabled
          ? 'border-blue-500/30 bg-blue-500/5'
          : 'border-white/5 bg-white/[0.02] opacity-60'
      }`}
    >
      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-center gap-2">
          <p className="text-white text-sm font-medium">{event.label}</p>
          <div className="group relative">
            <Info size={12} className="text-slate-500 cursor-help" />
            <div className="absolute left-5 top-0 w-48 bg-[#162240] border border-white/10 rounded-lg p-2.5 text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              {event.direction === 'ZENLER_TO_GHL'
                ? `GHL: ${event.ghlAction}`
                : `Zenler: ${event.zenlerAction}`}
            </div>
          </div>
        </div>
        <p className="text-slate-500 text-xs mt-0.5">{event.description}</p>
        <p className="text-xs mt-1 font-mono text-slate-600">{event.key}</p>
      </div>

      {/* Toggle */}
      <button
        onClick={() => onChange(event.key, !enabled)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export default function EventsPage() {
  const [enabled, setEnabled] = useState<EnabledMap>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasConnection, setHasConnection] = useState(false)

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        setHasConnection(data.hasConnection)
        const map: EnabledMap = {}
        if (data.configs) {
          data.configs.forEach((c: any) => {
            map[`${c.direction}__${c.eventKey}`] = c.isEnabled
          })
        }
        setEnabled(map)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggleEvent = (key: string, direction: string, val: boolean) => {
    setEnabled((prev) => ({ ...prev, [`${direction}__${key}`]: val }))
  }

  const isEnabled = (key: string, direction: string) =>
    enabled[`${direction}__${key}`] ?? false

  const handleSave = async () => {
    setSaving(true)

    const configs = [
      ...ZENLER_TO_GHL_EVENTS.map((e) => ({
        eventKey: e.key,
        direction: 'ZENLER_TO_GHL',
        isEnabled: isEnabled(e.key, 'ZENLER_TO_GHL'),
      })),
      ...GHL_TO_ZENLER_EVENTS.map((e) => ({
        eventKey: e.key,
        direction: 'GHL_TO_ZENLER',
        isEnabled: isEnabled(e.key, 'GHL_TO_ZENLER'),
      })),
    ]

    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ configs }),
    })

    setSaving(false)

    if (res.ok) {
      toast.success('Event settings saved!')
    } else {
      toast.error('Failed to save settings')
    }
  }

  const enabledCount = Object.values(enabled).filter(Boolean).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-400" size={28} />
      </div>
    )
  }

  if (!hasConnection) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-slate-400 mb-4">Connect your platforms first before selecting events.</p>
        <Link href="/connect" className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm">
          Go to Connect <ArrowRight size={15} />
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Sync Events</h1>
          <p className="text-slate-400 text-sm mt-1">
            Toggle the events you want to sync.{' '}
            <span className="text-blue-400 font-medium">{enabledCount} active</span>
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : null}
          Save settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Zenler → GHL */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              ZENLER
            </span>
            <ArrowRight size={14} className="text-slate-500" />
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              GHL
            </span>
            <span className="text-slate-500 text-xs ml-1">
              {ZENLER_TO_GHL_EVENTS.filter((e) => isEnabled(e.key, 'ZENLER_TO_GHL')).length}/
              {ZENLER_TO_GHL_EVENTS.length} on
            </span>
          </div>

          <div className="space-y-3">
            {ZENLER_TO_GHL_EVENTS.map((event) => (
              <EventToggle
                key={event.key}
                event={event}
                enabled={isEnabled(event.key, 'ZENLER_TO_GHL')}
                onChange={(key, val) => toggleEvent(key, 'ZENLER_TO_GHL', val)}
              />
            ))}
          </div>
        </div>

        {/* GHL → Zenler */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              GHL
            </span>
            <ArrowRight size={14} className="text-slate-500" />
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              ZENLER
            </span>
            <span className="text-slate-500 text-xs ml-1">
              {GHL_TO_ZENLER_EVENTS.filter((e) => isEnabled(e.key, 'GHL_TO_ZENLER')).length}/
              {GHL_TO_ZENLER_EVENTS.length} on
            </span>
          </div>

          <div className="space-y-3">
            {GHL_TO_ZENLER_EVENTS.map((event) => (
              <EventToggle
                key={event.key}
                event={event}
                enabled={isEnabled(event.key, 'GHL_TO_ZENLER')}
                onChange={(key, val) => toggleEvent(key, 'GHL_TO_ZENLER', val)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
