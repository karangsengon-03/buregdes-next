'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — BottomNav
// Tab navigasi antar buku A.1–A.6
// ─────────────────────────────────────────────

import { BookOpen } from 'lucide-react'
import { useApp }   from '@/contexts/AppContext'
import { BOOKS }    from '@/constants/books'

export function BottomNav() {
  const { activeBook, setActiveBook } = useApp()

  return (
    <nav
      style={{
        display: 'flex',
        flexShrink: 0,
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        position: 'relative',
        zIndex: 30,
      }}
      aria-label="Navigasi buku"
    >
      {BOOKS.map((book) => {
        const isActive = activeBook.id === book.id
        return (
          <button
            key={book.id}
            onClick={() => setActiveBook(book)}
            title={book.judul}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              padding: '8px 0',
              minHeight: 52,
              position: 'relative',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            {/* Active indicator — bar di atas */}
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 8,
                  right: 8,
                  height: 2,
                  borderRadius: 2,
                  background: 'var(--accent)',
                }}
              />
            )}

            {/* Icon wrapper */}
            <span
              style={{
                width: 28,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6,
                background: isActive ? 'var(--accent-subtle)' : 'transparent',
                transition: 'background 150ms',
              }}
            >
              <BookOpen size={13} />
            </span>

            {/* Kode buku */}
            <span
              style={{
                fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
                lineHeight: 1,
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              {book.kode}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
