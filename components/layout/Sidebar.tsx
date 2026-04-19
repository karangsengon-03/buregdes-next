'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — Sidebar
// Slide dari kiri · overlay backdrop · book list · user info · logout
// ─────────────────────────────────────────────

import { useEffect } from 'react'
import { useRouter }   from 'next/navigation'
import { X, BookOpen, LogOut, User, Wifi, WifiOff, ChevronRight } from 'lucide-react'
import { useApp }      from '@/contexts/AppContext'
import { useAuth }     from '@/hooks/useAuth'
import { BOOKS }       from '@/constants/books'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { activeBook, setActiveBook, isOnline, activeYear } = useApp()
  const { user, logout } = useAuth()
  const router = useRouter()

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
    onClose()
  }

  const handleLogout = async () => {
    onClose()
    await logout()
    router.replace('/login')
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          background: 'rgba(0,0,0,0.55)',
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
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 50,
          width: 280,
          maxWidth: '85vw',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1)',
          willChange: 'transform',
        }}
      >
        {/* Stripe top */}
        <div
          style={{
            height: 4,
            flexShrink: 0,
            background: 'linear-gradient(90deg, #F59E0B, #EF4444, #10B981, #3B82F6)',
          }}
        />

        {/* Sidebar header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', margin: 0 }}>
              BUKU REGISTER DESA
            </p>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0' }}>
              BuRegDes
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup sidebar"
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              color: 'var(--text-secondary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={16} />
          </button>
        </div>

        {/* Book list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          <p
            style={{
              padding: '8px 16px',
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Pilih Buku
          </p>

          {BOOKS.map((book) => {
            const isActive = activeBook.id === book.id
            return (
              <button
                key={book.id}
                onClick={() => handleSelectBook(book)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 16px',
                  textAlign: 'left',
                  background: isActive ? 'var(--accent-subtle)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                  border: 'none',
                  borderRight: 'none',
                  borderTop: 'none',
                  borderBottom: 'none',
                  borderLeftWidth: 3,
                  borderLeftStyle: 'solid',
                  borderLeftColor: isActive ? 'var(--accent)' : 'transparent',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: isActive ? 'var(--accent)' : 'var(--bg-elevated)',
                  }}
                >
                  <BookOpen size={14} style={{ color: isActive ? '#fff' : 'var(--text-secondary)' }} />
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                      fontSize: 10,
                      fontWeight: 700,
                      color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                      margin: '0 0 2px',
                    }}
                  >
                    {book.kode}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {book.judul}
                  </p>
                </div>

                {isActive && <ChevronRight size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            flexShrink: 0,
            padding: '12px 16px',
            borderTop: '1px solid var(--border)',
          }}
        >
          {/* Koneksi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: isOnline ? 'var(--success)' : 'var(--danger)',
                boxShadow: isOnline ? '0 0 6px var(--success)' : '0 0 6px var(--danger)',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 500, color: isOnline ? 'var(--success)' : 'var(--danger)' }}>
              {isOnline ? 'Terhubung ke server' : 'Tidak ada koneksi'}
            </span>
          </div>

          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--accent-subtle)',
                flexShrink: 0,
              }}
            >
              <User size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email ?? '—'}
              </p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>
                Tahun Anggaran {activeYear}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              background: 'rgba(239,68,68,0.1)',
              color: 'var(--danger)',
              border: '1px solid rgba(239,68,68,0.2)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.18)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
          >
            <LogOut size={13} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  )
}
