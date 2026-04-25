'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — Toast
// Global notification · variant: success/error/warning/info
// ─────────────────────────────────────────────

import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
} as const

const COLORS = {
  success: { border: 'var(--success)', bg: 'rgba(16,185,129,0.1)',  icon: 'var(--success)' },
  error:   { border: 'var(--danger)',  bg: 'rgba(239,68,68,0.1)',   icon: 'var(--danger)'  },
  warning: { border: 'var(--warning)', bg: 'rgba(245,158,11,0.1)',  icon: 'var(--warning)' },
  info:    { border: 'var(--accent)',  bg: 'var(--accent-subtle)',  icon: 'var(--accent)'  },
} as const

export function Toast() {
  const { toast, dismissToast } = useApp()

  if (!toast) return null

  const variant = toast.variant ?? 'info'
  const Icon    = ICONS[variant]
  const colors  = COLORS[variant]

  return (
    <>
      <div
        role="alert"
        style={{
          position: 'fixed',
          bottom: 'calc(16px + env(safe-area-inset-bottom))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '88vw',
          background: 'var(--bg-elevated)',
          border: `1px solid ${colors.border}`,
          boxShadow: `0 4px 24px rgba(0,0,0,0.4)`,
          animation: 'toast-in 220ms cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <Icon size={15} style={{ color: colors.icon, flexShrink: 0 }} />
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: 0, flex: 1 }}>
          {toast.message}
        </p>
        <button
          onClick={dismissToast}
          aria-label="Tutup"
          style={{
            flexShrink: 0,
            marginLeft: 4,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={13} />
        </button>
      </div>

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.96); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
    </>
  )
}
