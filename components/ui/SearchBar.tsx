'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — SearchBar (Session 5)
// Collapsible search: tap ikon → input muncul
// ─────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  query: string
  onQueryChange: (q: string) => void
  onClear: () => void
  resultCount: number    // jumlah hasil filter
  totalCount: number     // total baris
  isFiltering: boolean
}

export function SearchBar({
  query,
  onQueryChange,
  onClear,
  resultCount,
  totalCount,
  isFiltering,
}: SearchBarProps) {
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus saat expand
  useEffect(() => {
    if (expanded) {
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [expanded])

  // Collapse otomatis saat query dikosongkan
  const handleClear = useCallback(() => {
    onClear()
    setExpanded(false)
  }, [onClear])

  // Kalau sudah ada query tapi user collapse → jangan collapse
  const handleToggle = useCallback(() => {
    if (expanded && query) {
      // Tetap expanded kalau ada query, fokus ulang saja
      inputRef.current?.focus()
      return
    }
    setExpanded(prev => !prev)
  }, [expanded, query])

  // Tekan Escape → clear + collapse
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        handleClear()
      }
    },
    [handleClear]
  )

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {/* Input search — slide in dari kanan */}
      <div
        style={{
          overflow: 'hidden',
          maxWidth: expanded ? 180 : 0,
          opacity: expanded ? 1 : 0,
          transition: 'max-width 200ms ease, opacity 180ms ease',
          marginRight: expanded ? 4 : 0,
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari di tabel..."
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: 160,
              padding: '6px 28px 6px 10px',
              borderRadius: 8,
              border: '1.5px solid var(--border-focus)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: 12,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {/* Clear tombol di dalam input */}
          {query && (
            <button
              onMouseDown={e => {
                e.preventDefault()
                handleClear()
              }}
              style={{
                position: 'absolute',
                right: 5,
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                border: 'none',
                background: 'var(--text-muted)',
                color: 'var(--bg-card)',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Badge jumlah hasil — muncul saat filter aktif */}
      {isFiltering && (
        <div
          style={{
            marginRight: 4,
            padding: '2px 7px',
            borderRadius: 10,
            background: resultCount > 0
              ? 'var(--accent-subtle)'
              : 'rgba(239,68,68,0.15)',
            color: resultCount > 0
              ? 'var(--accent)'
              : 'var(--danger)',
            fontSize: 10,
            fontWeight: 700,
            fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {resultCount}/{totalCount}
        </div>
      )}

      {/* Tombol ikon search */}
      <button
        onClick={handleToggle}
        title={expanded ? 'Tutup pencarian' : 'Cari baris'}
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: isFiltering
            ? 'var(--accent-subtle)'
            : expanded
            ? 'var(--bg-elevated)'
            : 'var(--bg-card)',
          color: isFiltering
            ? 'var(--accent)'
            : 'var(--text-muted)',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background 150ms, color 150ms',
        }}
        onMouseEnter={e => {
          if (!isFiltering) {
            e.currentTarget.style.background = 'var(--bg-elevated)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }
        }}
        onMouseLeave={e => {
          if (!isFiltering) {
            e.currentTarget.style.background = expanded
              ? 'var(--bg-elevated)'
              : 'var(--bg-card)'
            e.currentTarget.style.color = 'var(--text-muted)'
          }
        }}
      >
        <Search size={14} />
      </button>
    </div>
  )
}
