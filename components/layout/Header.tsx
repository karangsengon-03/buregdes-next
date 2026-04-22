'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — Header (Session 13)
// · Hamburger menu kiri
// · Kode buku + judul buku aktif (tengah)
// · Dot koneksi + toggle tema (kanan)
// · Year selector dipindah ke Sidebar
// ─────────────────────────────────────────────

import { useCallback, useState, useEffect } from 'react'
import { Menu, Wifi, WifiOff, Sun, Moon } from 'lucide-react'
import { useApp }  from '@/contexts/AppContext'
import { getTheme, setTheme } from '@/lib/session'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { activeBook, isOnline } = useApp()

  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute('data-theme') !== 'light')
  }, [])

  const toggleTheme = useCallback(() => {
    const next = isDark ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    setIsDark(!isDark)
  }, [isDark])

  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '0 10px', height: 48, flexShrink: 0,
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      position: 'relative', zIndex: 30,
    }}>
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        aria-label="Buka menu"
        style={{
          width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 9, color: 'var(--text-secondary)',
          background: 'transparent', border: 'none', cursor: 'pointer',
          flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-subtle)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Menu size={20} />
      </button>

      {/* Kode badge + Judul buku */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
          fontSize: 11, fontWeight: 700,
          padding: '3px 7px', borderRadius: 5,
          background: 'var(--accent-subtle)', color: 'var(--text-accent)',
          flexShrink: 0, letterSpacing: '0.02em',
        }}>
          {activeBook.kode}
        </span>
        <h1 style={{
          fontSize: 14, fontWeight: 700,
          color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          margin: 0,
        }}>
          {activeBook.judul}
        </h1>
      </div>

      {/* Right: koneksi + tema */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {/* Dot koneksi */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 8px', borderRadius: 8,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
            background: isOnline ? 'var(--success)' : 'var(--danger)',
            boxShadow: isOnline ? '0 0 6px var(--success)' : '0 0 6px var(--danger)',
          }} />
          {isOnline
            ? <Wifi size={12} style={{ color: 'var(--success)' }} />
            : <WifiOff size={12} style={{ color: 'var(--danger)' }} />
          }
        </div>

        {/* Tema toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle tema"
          style={{
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 9, color: 'var(--text-secondary)',
            background: 'transparent', border: 'none', cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-subtle)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  )
}
