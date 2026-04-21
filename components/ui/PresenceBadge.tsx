'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — PresenceBadge (Session 8 Fixed)
// Avatar stack + dropdown siapa yang sedang online
// ─────────────────────────────────────────────

import { useState } from 'react'
import { X } from 'lucide-react'
import type { OnlineUser } from '@/hooks/usePresence'

interface PresenceBadgeProps {
  users:  OnlineUser[]
  myUid:  string | null
}

// Warna avatar deterministik dari hash UID
const AVATAR_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
]
function avatarColor(uid: string) {
  let hash = 0
  for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

export function PresenceBadge({ users, myUid }: PresenceBadgeProps) {
  const [open, setOpen] = useState(false)

  if (users.length === 0) return null

  const MAX_SHOWN = 3
  const shown     = users.slice(0, MAX_SHOWN)
  const extra     = users.length - MAX_SHOWN

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {/* Avatar stack trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        title={`${users.length} pengguna online`}
        style={{
          display: 'flex', alignItems: 'center',
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
        }}
      >
        {/* Green dot */}
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#10B981',
          boxShadow: '0 0 0 2px #0D1B2A',
          marginRight: 5, flexShrink: 0, display: 'inline-block',
        }} />

        {/* Avatar stack */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {shown.map((u, i) => (
            <div
              key={u.uid}
              title={u.uid === myUid ? `${u.name} (saya)` : u.name}
              style={{
                width: 24, height: 24, borderRadius: '50%',
                background: avatarColor(u.uid),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, color: '#fff',
                border: '1.5px solid var(--bg-card)',
                marginLeft: i === 0 ? 0 : -7,
                zIndex: MAX_SHOWN - i, position: 'relative',
                boxSizing: 'border-box',
              }}
            >
              {initials(u.name)}
            </div>
          ))}
          {extra > 0 && (
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'var(--bg-elevated)',
              border: '1.5px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: 'var(--text-muted)',
              marginLeft: -7, zIndex: 0, position: 'relative',
              boxSizing: 'border-box',
            }}>
              +{extra}
            </div>
          )}
        </div>
      </button>

      {/* Dropdown daftar online */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          />
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)', right: 0, zIndex: 50,
            minWidth: 200,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            padding: '10px 0', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 12px 8px',
              borderBottom: '1px solid var(--border)', marginBottom: 6,
            }}>
              <span style={{
                fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Online Sekarang
              </span>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 2,
                }}
              >
                <X size={13} />
              </button>
            </div>

            {/* List */}
            {users.map(u => (
              <div key={u.uid} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: avatarColor(u.uid),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {initials(u.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {u.name}
                    {u.uid === myUid && (
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 4 }}>
                        (saya)
                      </span>
                    )}
                  </p>
                </div>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
