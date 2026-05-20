'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, ExternalLink, Copy, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Connection {
  id: string
  zenlerApiKey?: string
  zenlerDomain?: string
  ghlApiKey: string
  ghlLocationId: string
  zenlerWebhookToken: string
  isActive: boolean
}

export default function ConnectPage() {
  const router = useRouter()
  const [connection, setConnection] = useState<Connection | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [showGhlKey, setShowGhlKey] = useState(false)
  const [form, setForm] = useState({
    zenlerApiKey: '',
    zenlerDomain: '',
    ghlApiKey: '',
    ghlLocationId: '',
  })

  useEffect(() => {
    fetch('/api/connect')
      .then((r) => r.json())
      .then((data) => {
        if (data.connection) {
          setConnection(data.connection)
          setForm({
            zenlerApiKey: data.connection.zenlerApiKey || '',
            zenlerDomain: data.connection.zenlerDomain || '',
            ghlApiKey: data.connection.ghlApiKey || '',
            ghlLocationId: data.connection.ghlLocationId || '',
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleVerify = async () => {
    setVerifying(true)
    const res = await fetch('/api/connect/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setVerifying(false)
    if (data.ghlValid) {
      toast.success('GHL credentials verified!')
    } else {
      toast.error('GHL API key invalid. Please check and try again.')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const res = await fetch('/api/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setSaving(false)

    if (res.ok) {
      const data = await res.json()
      setConnection(data.connection)
      toast.success('Connection saved! Now select your events.')
      router.push('/events')
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to save')
    }
  }

  const copyWebhookUrl = () => {
    const url = `${window.location.origin.replace('3000', '3001')}/wh/zenler/${connection?.zenlerWebhookToken}`
    navigator.clipboard.writeText(url)
    toast.success('Webhook URL copied!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-400" size={28} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Connect Platforms</h1>
        <p className="text-slate-400 text-sm mt-1">
          Enter your Zenler and GoHighLevel credentials to begin syncing.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Zenler card */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 text-xs font-bold">Z</span>
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">Zenler</h2>
              <p className="text-slate-500 text-xs">Course & membership platform</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Zenler School Domain
              </label>
              <input
                type="text"
                value={form.zenlerDomain}
                onChange={(e) => setForm({ ...form, zenlerDomain: e.target.value })}
                placeholder="myschool.newzenler.com"
                className="input-dark w-full px-4 py-3 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Zenler API Key{' '}
                <span className="text-slate-500 text-xs">(optional — for GHL → Zenler)</span>
              </label>
              <input
                type="password"
                value={form.zenlerApiKey}
                onChange={(e) => setForm({ ...form, zenlerApiKey: e.target.value })}
                placeholder="••••••••••••••••"
                className="input-dark w-full px-4 py-3 rounded-xl text-sm"
              />
              <p className="text-slate-500 text-xs mt-1.5">
                Find in Zenler → Settings → API & Integrations
              </p>
            </div>
          </div>
        </div>

        {/* GHL card */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <span className="text-indigo-400 text-xs font-bold">G</span>
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">GoHighLevel</h2>
              <p className="text-slate-500 text-xs">Sub-account — Private Integration</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">GHL API Key</label>
              <div className="relative">
                <input
                  type={showGhlKey ? 'text' : 'password'}
                  value={form.ghlApiKey}
                  onChange={(e) => setForm({ ...form, ghlApiKey: e.target.value })}
                  placeholder="••••••••••••••••"
                  required
                  className="input-dark w-full px-4 py-3 pr-12 rounded-xl text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowGhlKey(!showGhlKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showGhlKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-slate-500 text-xs mt-1.5">
                GHL Sub-account → Settings → Private Integrations → API Key
              </p>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Location ID</label>
              <input
                type="text"
                value={form.ghlLocationId}
                onChange={(e) => setForm({ ...form, ghlLocationId: e.target.value })}
                placeholder="abc123xyz..."
                required
                className="input-dark w-full px-4 py-3 rounded-xl text-sm"
              />
              <p className="text-slate-500 text-xs mt-1.5">
                GHL Sub-account → Settings → Business Profile → Location ID
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={!form.ghlApiKey || verifying}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-500/30 text-indigo-400 text-sm hover:bg-indigo-500/10 transition-all disabled:opacity-40"
          >
            {verifying ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Verify GHL credentials
          </button>
        </div>

        {/* Webhook URL (shown after save) */}
        {connection && (
          <div className="glass rounded-2xl p-6 border border-green-500/20">
            <h3 className="text-white font-semibold text-sm mb-1">Your Zenler Webhook URL</h3>
            <p className="text-slate-400 text-xs mb-4">
              Paste this in Zenler → Settings → Webhooks
            </p>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-xs text-green-300 bg-white/5 px-4 py-2.5 rounded-lg truncate">
                {typeof window !== 'undefined'
                  ? `${window.location.origin.replace('3000', '3001')}/wh/zenler/${connection.zenlerWebhookToken}`
                  : `/wh/zenler/${connection.zenlerWebhookToken}`}
              </code>
              <button
                type="button"
                onClick={copyWebhookUrl}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green-500/15 text-green-400 text-xs hover:bg-green-500/25 transition-all"
              >
                <Copy size={13} /> Copy
              </button>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-glow flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                {connection ? 'Update connection' : 'Save & continue'}
                <ExternalLink size={15} />
              </>
            )}
          </button>
          {connection && (
            <span className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle2 size={15} />
              Connected
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
