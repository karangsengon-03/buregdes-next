'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — Header
// Judul buku aktif · koneksi dot · year selector · theme toggle · menu
// ─────────────────────────────────────────────

import { useCallback, useState, useEffect } from 'react'
import { Menu, Wifi, WifiOff, Sun, Moon, ChevronDown } from 'lucide-react'
import { useApp }     from '@/contexts/AppContext'
import { getTheme, setTheme } from '@/lib/session'
import { YEARS }      from '@/constants/books'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { activeBook, activeYear, setActiveYear, isOnline } = useApp()

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
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 12px',
        height: 48,
        flexShrink: 0,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        zIndex: 30,
      }}
    >
      {/* Menu button */}
      <button
        onClick={onMenuClick}
        aria-label="Buka menu"
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
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-subtle)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <Menu size={18} />
      </button>

      {/* Kode + Judul buku */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: 4,
            background: 'var(--accent-subtle)',
            color: 'var(--text-accent)',
            flexShrink: 0,
          }}
        >
          {activeBook.kode}
        </span>
        <h1
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            margin: 0,
          }}
        >
          {activeBook.judul}
        </h1>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>

        {/* Connection dot */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 6px',
            borderRadius: 8,
            background: 'var(--bg-elevated)',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: isOnline ? 'var(--success)' : 'var(--danger)',
              boxShadow: isOnline
                ? '0 0 6px var(--success)'
                : '0 0 6px var(--danger)',
              flexShrink: 0,
            }}
          />
          {isOnline
            ? <Wifi size={11} style={{ color: 'var(--success)' }} />
            : <WifiOff size={11} style={{ color: 'var(--danger)' }} />
          }
        </div>

        {/* Year selector */}
        <div style={{ position: 'relative' }}>
          <select
            value={activeYear}
            onChange={(e) => setActiveYear(e.target.value)}
            style={{
              appearance: 'none',
              padding: '4px 20px 4px 8px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <ChevronDown
            size={10}
            style={{
              position: 'absolute',
              right: 5,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: 'var(--text-muted)',
            }}
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle tema"
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
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-subtle)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  )
}
