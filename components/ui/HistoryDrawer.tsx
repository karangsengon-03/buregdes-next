'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — HistoryDrawer (Session 8 Fixed)
// Bottom-sheet riwayat perubahan
//
// Schema entry (sesuai RTDB aktual):
//   { bookId, colLabel, key, newVal, ri, ts, user }
//   TIDAK ada: oldVal (memang tidak dicatat di RTDB asli)
// ─────────────────────────────────────────────

import { History, X, Clock } from 'lucide-react'
import type { HistoryEntry } from '@/hooks/useHistory'

interface HistoryDrawerProps {
  open:     boolean
  entries:  HistoryEntry[]
  status:   'idle' | 'loading' | 'ready'
  bookName: string
  onClose:  () => void
}

function formatRelative(ts: number): string {
  if (!ts) return '—'
  const diff = Date.now() - ts
  if (diff < 60_000)    return 'baru saja'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} mnt lalu`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} jam lalu`
  return new Date(ts).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

// Group entries per hari (berdasarkan ts)
function groupByDay(entries: HistoryEntry[]): Array<[string, HistoryEntry[]]> {
  const groups = new Map<string, HistoryEntry[]>()
  for (const e of entries) {
    const d   = e.ts ? new Date(e.ts) : new Date()
    const key = d.toLocaleDateString('id-ID', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    })
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(e)
  }
  return Array.from(groups.entries())
}

function truncate(val: string | number | null, max = 40): string {
  if (val === null || val === undefined || val === '') return '(kosong)'
  const s = String(val).replace(/\n/g, ' ↵ ')   // newline → ↵ supaya tidak wrap aneh
  return s.length > max ? s.slice(0, max) + '…' : s
}

// Warna avatar deterministik
const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899']
function userColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}
function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

export function HistoryDrawer({
  open, entries, status, bookName, onClose,
}: HistoryDrawerProps) {
  if (!open) return null

  const groups = groupByDay(entries)

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0, zIndex: 61,
        background: 'var(--bg-card)',
        borderRadius: '18px 18px 0 0',
        maxHeight: '82dvh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'rgba(245,158,11,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <History size={15} style={{ color: 'var(--warning)' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              Riwayat Perubahan
            </p>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
              {bookName}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', cursor: 'pointer',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 32px' }}>

          {/* Loading */}
          {status === 'loading' && (
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Memuat riwayat…</p>
            </div>
          )}

          {/* Empty */}
          {status === 'ready' && entries.length === 0 && (
            <div style={{
              padding: '40px 16px', textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(245,158,11,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Clock size={22} style={{ color: 'var(--warning)' }} />
              </div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                Belum ada riwayat
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Perubahan data akan tercatat di sini setelah mengedit sel.
              </p>
            </div>
          )}

          {/* Entries per hari */}
          {status === 'ready' && groups.map(([day, dayEntries]) => (
            <div key={day}>
              {/* Day header */}
              <div style={{
                padding: '10px 16px 4px',
                fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                position: 'sticky', top: 0,
                background: 'var(--bg-card)',
              }}>
                {day}
              </div>

              {dayEntries.map((e, idx) => (
                <div
                  key={`${e._pushKey}-${idx}`}
                  style={{
                    margin: '0 12px 6px',
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {/* Top: kolom + waktu */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: 6, gap: 8,
                  }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: 'var(--accent)',
                      background: 'var(--accent-subtle)',
                      padding: '2px 7px', borderRadius: 5, flexShrink: 0,
                      maxWidth: '60%', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {e.colLabel || e.key}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                      {formatRelative(e.ts)}
                    </span>
                  </div>

                  {/* Nilai baru */}
                  <div style={{
                    padding: '5px 8px', borderRadius: 6,
                    background: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.15)',
                    marginBottom: 6,
                  }}>
                    <span style={{
                      fontSize: 12, color: 'var(--success)',
                      fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                      wordBreak: 'break-all',
                    }}>
                      {truncate(e.newVal)}
                    </span>
                  </div>

                  {/* Footer: baris + user */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: 8,
                  }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      Baris ke-{e.ri + 1}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%',
                        background: userColor(e.user),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 7, fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}>
                        {initials(e.user)}
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {e.user}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
