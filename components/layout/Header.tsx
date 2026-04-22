'use client'
// BuRegDes Next — Header (Session 15)
// Baris 1: Hamburger | BUKU REGISTER / Desa Karang Sengon [/ Kec. Kab.] | Presence · Tema · Cari

import { useCallback, useState, useEffect, useRef } from 'react'
import { Menu, Sun, Moon, Search, X } from 'lucide-react'
import { useApp }       from '@/contexts/AppContext'
import { useDesaInfo }  from '@/hooks/useDesaInfo'
import { usePresence }  from '@/hooks/usePresence'
import { getTheme, setTheme } from '@/lib/session'

interface HeaderProps {
  onMenuClick: () => void
}

// Warna avatar deterministik
const AVATAR_COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16']
function avatarColor(uid: string) {
  let h = 0; for (let i = 0; i < uid.length; i++) h = uid.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}
function initials(name: string) {
  return name.split(/\s+/).slice(0,2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

export function Header({ onMenuClick }: HeaderProps) {
  const { activeBook, activeYear } = useApp()
  const { desaInfo }  = useDesaInfo()
  const { onlineUsers, myUid } = usePresence()

  const [isDark,       setIsDark]       = useState(true)
  const [query,        setQuery]        = useState('')
  const [isFiltering,  setIsFiltering]  = useState(false)
  const filteredResults: unknown[] = []
  const totalRows = 0
  const clearQuery = () => { setQuery(''); setIsFiltering(false) }
  const [presenceOpen, setPresenceOpen] = useState(false)
  const [searchOpen,   setSearchOpen]   = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute('data-theme') !== 'light')
  }, [])

  const toggleTheme = useCallback(() => {
    const next = isDark ? 'light' : 'dark'
    setTheme(next); document.documentElement.setAttribute('data-theme', next); setIsDark(!isDark)
  }, [isDark])

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50)
  }, [searchOpen])

  // Nama desa dari RTDB, fallback default
  const namaDesa    = desaInfo.desa      || 'Desa Karang Sengon'
  const kecamatan   = desaInfo.kecamatan || 'Klabang'
  const kabupaten   = desaInfo.kabupaten || 'Bondowoso'

  return (
    <header style={{
      flexShrink: 0, background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      position: 'relative', zIndex: 30,
    }}>
      {/* ── Baris utama header ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0 8px', height: 52, gap: 6,
      }}>
        {/* Hamburger */}
        <button
          onClick={onMenuClick}
          aria-label="Buka menu"
          style={{
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 9, color: 'var(--text-secondary)',
            background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-subtle)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Menu size={21} />
        </button>

        {/* Identitas institusi */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.10em',
            color: 'var(--text-muted)', textTransform: 'uppercase', lineHeight: 1,
          }}>
            Buku Register
          </p>
          <p style={{
            margin: 0, fontSize: 13, fontWeight: 700,
            color: 'var(--text-primary)', lineHeight: 1.25,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {namaDesa}
          </p>
          <p style={{
            margin: 0, fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            Kecamatan {kecamatan} &nbsp;·&nbsp; Kabupaten {kabupaten}
          </p>
        </div>

        {/* Right controls: Presence · Tema · Cari */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>

          {/* ── Presence avatar ── */}
          {onlineUsers.length > 0 && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setPresenceOpen(v => !v)}
                title="Lihat siapa yang online"
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px 6px', borderRadius: 8,
                }}
              >
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#10B981', flexShrink: 0,
                  boxShadow: '0 0 5px #10B981',
                }} />
                {onlineUsers.slice(0, 3).map((u, i) => (
                  <div key={u.uid} style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: avatarColor(u.uid),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 700, color: '#fff',
                    border: '1.5px solid var(--bg-card)',
                    marginLeft: i === 0 ? 0 : -8,
                    zIndex: 3 - i, position: 'relative', boxSizing: 'border-box',
                  }}>
                    {initials(u.name)}
                  </div>
                ))}
                {onlineUsers.length > 3 && (
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'var(--bg-elevated)', border: '1.5px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 700, color: 'var(--text-muted)',
                    marginLeft: -8, zIndex: 0, boxSizing: 'border-box',
                  }}>
                    +{onlineUsers.length - 3}
                  </div>
                )}
              </button>

              {/* Dropdown siapa online */}
              {presenceOpen && (
                <>
                  <div onClick={() => setPresenceOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 50,
                    minWidth: 200, background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)', borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)', padding: '8px 0',
                  }}>
                    <p style={{
                      margin: 0, padding: '0 12px 7px',
                      fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.07em',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      Sedang Online
                    </p>
                    {onlineUsers.map(u => (
                      <div key={u.uid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px' }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: avatarColor(u.uid),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
                        }}>
                          {initials(u.name)}
                        </div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
                          {u.name}
                          {u.uid === myUid && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 4 }}>(saya)</span>}
                        </p>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tema toggle */}
          <button
            onClick={toggleTheme}
            title="Ganti tema"
            style={{
              width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 9, color: 'var(--text-secondary)',
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-subtle)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Cari */}
          <button
            onClick={() => setSearchOpen(v => !v)}
            title="Cari"
            style={{
              width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 9,
              color: searchOpen ? 'var(--accent)' : 'var(--text-secondary)',
              background: searchOpen ? 'var(--accent-subtle)' : 'transparent',
              border: 'none', cursor: 'pointer',
            }}
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* ── Sub-header: buku aktif + action icons ── */}
      <SubBar
        activeBook={activeBook}
        activeYear={activeYear}
        searchOpen={searchOpen}
        searchRef={searchRef}
        query={query}
        setQuery={setQuery}
        clearQuery={clearQuery}
        isFiltering={isFiltering}
        filteredCount={filteredResults.length}
        totalCount={totalRows}
        onCloseSearch={() => { setSearchOpen(false); clearQuery() }}
      />
    </header>
  )
}

// SubBar terpisah agar mudah dikelola
function SubBar({ activeBook, activeYear, searchOpen, searchRef, query, setQuery, clearQuery, isFiltering, filteredCount, totalCount, onCloseSearch }: {
  activeBook: { kode: string; judul: string }
  activeYear: string
  searchOpen: boolean
  searchRef: React.RefObject<HTMLInputElement | null>
  query: string
  setQuery: (q: string) => void
  clearQuery: () => void
  isFiltering: boolean
  filteredCount: number
  totalCount: number
  onCloseSearch: () => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '0 10px', height: 36,
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-app)', gap: 8,
    }}>
      {/* Kode buku badge */}
      <span style={{
        fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
        fontSize: 10, fontWeight: 700,
        padding: '2px 6px', borderRadius: 4,
        background: 'var(--accent-subtle)', color: 'var(--text-accent)',
        flexShrink: 0, letterSpacing: '0.02em',
      }}>
        {activeBook.kode}
      </span>

      {/* Nama buku atau search input */}
      {searchOpen ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            ref={searchRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari di tabel..."
            style={{
              flex: 1, padding: '3px 8px', fontSize: 13, borderRadius: 6,
              border: '1.5px solid var(--accent)',
              background: 'var(--bg-elevated)', color: 'var(--text-primary)',
              outline: 'none', fontFamily: 'inherit',
            }}
          />
          {isFiltering && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
              {filteredCount}/{totalCount}
            </span>
          )}
          <button onClick={onCloseSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <p style={{
          flex: 1, margin: 0, fontSize: 12, fontWeight: 600,
          color: 'var(--text-secondary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {activeBook.judul}
        </p>
      )}

      {/* TA badge */}
      <span style={{
        fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
        fontSize: 10, color: 'var(--text-muted)', flexShrink: 0,
      }}>
        TA {activeYear}
      </span>
    </div>
  )
}
