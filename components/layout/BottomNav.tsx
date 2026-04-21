'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — BottomNav (Session 6 update)
// + Tab "Pengaturan" → /app/settings
// ─────────────────────────────────────────────

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Settings } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useDesaInfo } from '@/hooks/useDesaInfo'

export function BottomNav() {
  const pathname             = usePathname()
  const { activeBook }       = useApp()
  const { desaInfo }         = useDesaInfo()

  const isSettings = pathname === '/app/settings'
  const isBook     = !isSettings

  // Apakah info desa belum lengkap → tampilkan dot warning di Settings
  const desaWarning = !desaInfo.desa

  const tabs = [
    {
      href:    '/app',
      label:   activeBook.shortName ?? activeBook.kode,
      icon:    <BookOpen size={20} />,
      active:  isBook,
      warning: false,
    },
    {
      href:    '/app/settings',
      label:   'Pengaturan',
      icon:    <Settings size={20} />,
      active:  isSettings,
      warning: desaWarning,
    },
  ]

  return (
    <nav
      style={{
        flexShrink: 0,
        display: 'flex',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-card)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map(tab => (
        <Link
          key={tab.href}
          href={tab.href}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            padding: '10px 4px',
            textDecoration: 'none',
            color: tab.active ? 'var(--accent)' : 'var(--text-muted)',
            position: 'relative',
            transition: 'color 150ms',
          }}
        >
          {/* Icon + warning dot */}
          <div style={{ position: 'relative' }}>
            {tab.icon}
            {tab.warning && (
              <span
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -3,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--warning)',
                  border: '1.5px solid var(--bg-card)',
                }}
              />
            )}
          </div>

          {/* Label */}
          <span
            style={{
              fontSize: 10,
              fontWeight: tab.active ? 700 : 500,
              letterSpacing: '0.01em',
              maxWidth: 72,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </span>

          {/* Active indicator bar */}
          {tab.active && (
            <span
              style={{
                position: 'absolute',
                top: 0,
                left: '25%',
                right: '25%',
                height: 2,
                borderRadius: '0 0 2px 2px',
                background: 'var(--accent)',
              }}
            />
          )}
        </Link>
      ))}
    </nav>
  )
}
