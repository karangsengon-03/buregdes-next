'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — Sidebar (Session 13)
// · Hamburger-only navigation (BottomNav dihapus)
// · Year selector dropdown di dalam sidebar
// · Link ke Pengaturan
// · Tampilkan versi app di header sidebar
// · Auto-close saat pilih buku / navigasi
// ─────────────────────────────────────────────

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  X, BookOpen, LogOut, User, ChevronRight,
  Settings, ChevronDown,
} from 'lucide-react'
import { useApp }      from '@/contexts/AppContext'
import { useAuth }     from '@/hooks/useAuth'
import { BOOKS, YEARS } from '@/constants/books'
import { APP_VERSION } from '@/hooks/useSettings'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { activeBook, setActiveBook, isOnline, activeYear, setActiveYear } = useApp()
  const { user, logout } = useAuth()
  const router   = useRouter()
  const pathname = usePathname()

  // Tutup dengan Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Cegah scroll body saat sidebar terbuka
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleSelectBook = (book: typeof BOOKS[0]) => {
    setActiveBook(book)
    // Kalau sedang di halaman selain /app, kembali ke /app
    if (pathname !== '/app') router.push('/app')
    onClose()
  }

  const handleSettings = () => {
    router.push('/app/settings')
    onClose()
  }

  const handleLogout = async () => {
    onClose()
    await logout()
    router.replace('/login')
  }

  const isSettings = pathname === '/app/settings'

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: open ? 'blur(2px)' : 'none',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 280ms ease',
        }}
      />

      {/* Panel */}
      <aside
        aria-label="Sidebar navigasi"
        style={{
          position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
          width: 288, maxWidth: '88vw',
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--sidebar-divider, var(--border))',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1)',
          willChange: 'transform',
          boxShadow: open ? '6px 0 32px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {/* Stripe top */}
        <div style={{
          height: 4, flexShrink: 0,
          background: 'linear-gradient(90deg, #F59E0B, #EF4444, #10B981, #3B82F6)',
        }} />

        {/* ── Header sidebar ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px 12px',
          borderBottom: '1px solid var(--sidebar-divider)',
          flexShrink: 0,
        }}>
          <div>
            <p style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
              color: 'var(--text-muted)', margin: 0,
              textTransform: 'uppercase',
            }}>
              BUKU REGISTER DESA
            </p>
            <div style={{ marginTop: 2 }}>
              <h2 style={{
                fontSize: 16, fontWeight: 800,
                color: 'var(--sidebar-fg-title)', margin: 0, lineHeight: 1.2,
              }}>
                BuRegDes Next
              </h2>
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: 'var(--accent)',
                fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              }}>
                v{APP_VERSION}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup sidebar"
            style={{
              width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, color: 'var(--text-secondary)',
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={17} />
          </button>
        </div>

        {/* ── Tahun Anggaran ── */}
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--sidebar-divider)',
          flexShrink: 0,
        }}>
          <p style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
            color: 'var(--sidebar-fg-muted)', margin: '0 0 6px',
            textTransform: 'uppercase',
          }}>
            Tahun Anggaran
          </p>
          <div style={{ position: 'relative' }}>
            <select
              value={activeYear}
              onChange={e => setActiveYear(e.target.value)}
              style={{
                width: '100%',
                appearance: 'none',
                padding: '8px 32px 8px 12px',
                borderRadius: 8,
                fontSize: 14, fontWeight: 700,
                cursor: 'pointer', outline: 'none',
                background: 'rgba(59,130,246,0.10)',
                color: '#93C5FD',
                border: '1px solid rgba(59,130,246,0.25)',
                fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              }}
            >
              {YEARS.map(y => (
                <option key={y} value={y} style={{ background: '#0A1628', color: '#F1F5F9' }}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              style={{
                position: 'absolute', right: 10, top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none',
                color: '#93C5FD',
              }}
            />
          </div>
        </div>

        {/* ── Daftar Buku ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          <p style={{
            padding: '8px 16px 6px',
            fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
            color: 'var(--sidebar-fg-muted)', textTransform: 'uppercase', margin: 0,
          }}>
            Pilih Buku
          </p>

          {BOOKS.map(book => {
            const isActive = activeBook.id === book.id && !isSettings
            return (
              <button
                key={book.id}
                onClick={() => handleSelectBook(book)}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px',
                  textAlign: 'left',
                  background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                  borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                  border: 'none', borderLeftWidth: 3, borderLeftStyle: 'solid',
                  borderLeftColor: isActive ? 'var(--accent)' : 'transparent',
                  cursor: 'pointer', transition: 'background 120ms',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                {/* Icon */}
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  background: isActive ? 'var(--accent)' : 'var(--sidebar-icon-bg)',
                }}>
                  <BookOpen size={15} style={{ color: isActive ? '#fff' : 'var(--text-secondary)' }} />
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                    fontSize: 10, fontWeight: 700,
                    color: isActive ? 'var(--accent)' : 'var(--sidebar-fg-muted)',
                    margin: '0 0 1px',
                  }}>
                    {book.kode}
                  </p>
                  <p style={{
                    fontSize: 13, fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#fff' : 'var(--sidebar-fg)',
                    margin: 0, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {book.judul}
                  </p>
                </div>

                {isActive && <ChevronRight size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
              </button>
            )
          })}

          {/* ── Divider ── */}
          <div style={{ height: 1, background: 'var(--sidebar-divider)', margin: '8px 16px' }} />

          {/* ── Pengaturan ── */}
          <button
            onClick={handleSettings}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 16px',
              textAlign: 'left',
              background: isSettings ? 'rgba(59,130,246,0.12)' : 'transparent',
              borderLeft: `3px solid ${isSettings ? 'var(--accent)' : 'transparent'}`,
              border: 'none', borderLeftWidth: 3, borderLeftStyle: 'solid',
              borderLeftColor: isSettings ? 'var(--accent)' : 'transparent',
              cursor: 'pointer', transition: 'background 120ms',
            }}
            onMouseEnter={e => { if (!isSettings) e.currentTarget.style.background = 'var(--sidebar-hover)' }}
            onMouseLeave={e => { if (!isSettings) e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              background: isSettings ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
            }}>
              <Settings size={15} style={{ color: isSettings ? '#fff' : 'var(--text-secondary)' }} />
            </div>
            <p style={{
              fontSize: 13, fontWeight: isSettings ? 600 : 400,
              color: isSettings ? '#fff' : 'var(--sidebar-fg)',
              margin: 0, flex: 1,
            }}>
              Pengaturan
            </p>
            {isSettings && <ChevronRight size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
          </button>
        </div>

        {/* ── Footer ── */}
        <div style={{
          flexShrink: 0,
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
          borderTop: '1px solid var(--sidebar-divider)',
        }}>
                    {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--accent-subtle)', flexShrink: 0,
            }}>
              <User size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 13, fontWeight: 600,
                color: 'var(--text-sidebar-active)', margin: 0,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user?.displayName ?? user?.email?.split('@')[0] ?? '—'}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                {user?.email ?? ''}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px',
              borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: 'rgba(239,68,68,0.10)',
              color: 'var(--danger)',
              border: '1px solid rgba(239,68,68,0.20)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.10)'}
          >
            <LogOut size={14} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  )
}
