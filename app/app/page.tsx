'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — /app page (placeholder Session 2)
// Tabel data akan diisi di Session 3
// ─────────────────────────────────────────────

import { BookOpen, Plus } from 'lucide-react'
import { useApp }         from '@/contexts/AppContext'

export default function AppPage() {
  const { activeBook, activeYear, showToast } = useApp()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sub-header: identitas buku */}
      <div
        style={{
          padding: '10px 16px',
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--accent-subtle)',
            flexShrink: 0,
          }}
        >
          <BookOpen size={16} style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <p
            style={{
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            {activeBook.kode} · TA {activeYear}
          </p>
          <h2
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {activeBook.judul}
          </h2>
        </div>
      </div>

      {/* Placeholder — Session 3 akan isi ini dengan tabel RTDB */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          gap: 16,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--accent-subtle)',
          }}
        >
          <BookOpen size={28} style={{ color: 'var(--accent)' }} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Belum ada data
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            Data {activeBook.kode} untuk tahun {activeYear} akan tampil di sini.
          </p>
        </div>

        <button
          onClick={() =>
            showToast({
              message: `Tabel ${activeBook.kode} akan dibangun di Session 3`,
              variant: 'info',
            })
          }
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 20px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
        >
          <Plus size={15} />
          Tambah Baris
        </button>
      </div>
    </div>
  )
}
