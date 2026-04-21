'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — DesaInfoModal
// Bottom-sheet untuk edit info desa
// (nama desa, kecamatan, kabupaten, provinsi)
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { X, MapPin, Check, Loader2 } from 'lucide-react'
import type { DesaInfo } from '@/types'

interface DesaInfoModalProps {
  open: boolean
  desaInfo: DesaInfo
  onClose: () => void
  onSave: (data: Partial<DesaInfo>) => Promise<void>
}

const FIELDS: { key: keyof DesaInfo; label: string; placeholder: string }[] = [
  { key: 'desa',       label: 'Nama Desa',       placeholder: 'Contoh: Karang Sengon'   },
  { key: 'kecamatan',  label: 'Kecamatan',        placeholder: 'Contoh: Sumberjambe'    },
  { key: 'kabupaten',  label: 'Kabupaten / Kota', placeholder: 'Contoh: Jember'         },
  { key: 'provinsi',   label: 'Provinsi',         placeholder: 'Contoh: Jawa Timur'     },
]

export function DesaInfoModal({ open, desaInfo, onClose, onSave }: DesaInfoModalProps) {
  const [form, setForm]       = useState<DesaInfo>(desaInfo)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved]     = useState(false)
  const firstRef              = useRef<HTMLInputElement | null>(null)

  // Sync form saat modal dibuka atau desaInfo berubah
  useEffect(() => {
    if (open) {
      setForm(desaInfo)
      setSaved(false)
      setTimeout(() => firstRef.current?.focus(), 60)
    }
  }, [open, desaInfo])

  // Tutup dengan Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const isDirty = FIELDS.some((f) => form[f.key] !== desaInfo[f.key])

  const handleSave = async () => {
    if (loading) return
    setLoading(true)
    try {
      await onSave(form)
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        onClose()
      }, 800)
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
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
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
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px 14px',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: 'var(--accent-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <MapPin size={17} style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: 15, fontWeight: 700, color: 'var(--text-primary)',
              margin: 0, lineHeight: 1.2,
            }}>
              Info Desa
            </p>
            <p style={{
              fontSize: 11, color: 'var(--text-muted)', margin: 0,
              marginTop: 1,
            }}>
              Digunakan di header dokumen dan ekspor data
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, display: 'flex', alignItems: 'center',
              justifyContent: 'center', borderRadius: 6, border: 'none',
              background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />

        {/* Form */}
        <div style={{ overflowY: 'auto', padding: '16px 16px 0', flex: 1 }}>
          {FIELDS.map((field, idx) => (
            <div key={field.key} style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 11, fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 5,
                }}
              >
                {field.label}
              </label>
              <input
                ref={idx === 0 ? firstRef : undefined}
                type="text"
                value={form[field.key] ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave()
                }}
                placeholder={field.placeholder}
                style={{
                  width: '100%',
                  padding: '11px 13px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 150ms',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
              />
            </div>
          ))}

          {/* Preview badge */}
          {(form.desa || form.kecamatan || form.kabupaten) && (
            <div
              style={{
                marginBottom: 16,
                padding: '10px 13px',
                borderRadius: 10,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Preview Header Dokumen
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                {[
                  form.desa && `Desa ${form.desa}`,
                  form.kecamatan && `Kec. ${form.kecamatan}`,
                  form.kabupaten && `Kab. ${form.kabupaten}`,
                  form.provinsi && `Prov. ${form.provinsi}`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          )}

          <div style={{ height: 4 }} />
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: 8,
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: 11,
              fontSize: 13, fontWeight: 600,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !isDirty}
            style={{
              flex: 2,
              padding: '11px',
              borderRadius: 11,
              fontSize: 13, fontWeight: 700,
              border: 'none',
              background: saved
                ? 'var(--success)'
                : loading || !isDirty
                ? 'var(--bg-card)'
                : 'var(--accent)',
              color: loading || !isDirty ? 'var(--text-muted)' : '#fff',
              cursor: loading || !isDirty ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              transition: 'background 200ms',
            }}
          >
            {loading ? (
              <Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} />
            ) : saved ? (
              <Check size={15} />
            ) : null}
            {saved ? 'Tersimpan!' : loading ? 'Menyimpan…' : 'Simpan Info Desa'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
