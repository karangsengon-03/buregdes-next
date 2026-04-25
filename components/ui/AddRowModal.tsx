'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — AddRowModal
// Modal form untuk tambah baris baru ke tabel
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { X, Plus } from 'lucide-react'
import type { BookColumn } from '@/types'

interface AddRowModalProps {
  open: boolean
  cols: BookColumn[]
  onClose: () => void
  onAdd: (data: Record<string, string | number>) => Promise<void>
}

export function AddRowModal({ open, cols, onClose, onAdd }: AddRowModalProps) {
  const [form, setForm]       = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const firstInputRef         = useRef<HTMLInputElement | null>(null)

  // Reset form saat open
  useEffect(() => {
    if (open) {
      const init: Record<string, string> = {}
      cols.filter(c => !c.ro).forEach(c => { init[c.k] = '' })
      setForm(init)
      setTimeout(() => firstInputRef.current?.focus(), 50)
    }
  }, [open, cols])

  // Tutup dengan Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const editableCols = cols.filter(c => !c.ro)

  const handleSubmit = async () => {
    // Validasi minimal satu field terisi
    const hasValue = editableCols.some(c => form[c.k]?.trim())
    if (!hasValue) return

    setLoading(true)
    try {
      // Konversi type number
      const data: Record<string, string | number> = {}
      editableCols.forEach(c => {
        const val = form[c.k] ?? ''
        data[c.k] = c.type === 'number' ? (Number(val) || 0) : val
      })
      await onAdd(data)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 500,
          borderRadius: '16px 16px 0 0',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderBottom: 'none',
          paddingBottom: 'env(safe-area-inset-bottom)',
          maxHeight: '88dvh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px 12px',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'var(--accent-subtle)',
              border: '1px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Plus size={18} style={{ color: 'var(--accent)' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
            Tambah Baris
          </span>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center',
              justifyContent: 'center', borderRadius: 8, border: 'none',
              background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form scroll area */}
        <div style={{ overflowY: 'auto', padding: '0 16px', flex: 1 }}>
          {editableCols.map((col, idx) => (
            <div key={col.k} style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 11, fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 5,
                }}
              >
                {col.l}
              </label>
              <input
                ref={idx === 0 ? firstInputRef : undefined}
                type={col.type === 'date' ? 'date' : col.type === 'number' ? 'number' : 'text'}
                value={form[col.k] ?? ''}
                onChange={e => setForm(prev => ({ ...prev, [col.k]: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                style={{
                  width: '100%', padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-input)',
                  background: 'var(--bg-input)', color: 'var(--text-primary)',
                  fontSize: col.type === 'mono' ? 13 : 14,
                  fontFamily: col.type === 'mono'
                    ? 'var(--font-mono, "JetBrains Mono", monospace)'
                    : 'inherit',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color var(--transition-fast)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-subtle)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-input)'; e.currentTarget.style.boxShadow = 'none' }}
                placeholder={col.type === 'date' ? 'yyyy-mm-dd' : `Isi ${col.l.toLowerCase()}…`}
              />
            </div>
          ))}
          <div style={{ height: 8 }} />
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 700,
              border: 'none',
              background: loading ? 'var(--text-muted)' : 'var(--accent)',
              color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background var(--transition-fast)',
            }}
          >
            {loading ? (
              <span
                style={{
                  width: 14, height: 14,
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
            ) : (
              <Plus size={16} />
            )}
            {loading ? 'Menyimpan…' : 'Simpan Baris'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
