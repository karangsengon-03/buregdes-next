'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — /app page (Session 12)
// Perbaikan UX:
// - Format tabel standar: nomor kolom di bawah label header (seperti versi lama)
// - Teks data berwarna amber (#F59E0B) untuk keterbacaan lansia
// - Font tabel 14px (naik dari 13px)
// - Sub-header 2 baris: baris atas = judul buku, baris bawah = action buttons
// - Kolom Kepada/Dari/Ket sudah ada di A5-A6
// ─────────────────────────────────────────────

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Plus, Trash2, BookOpen, WifiOff, RefreshCw,
  FileSpreadsheet, SearchX, Printer, History,
  Lock, Unlock, LockKeyhole, LayoutList, LayoutGrid,
  Pencil, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useApp }            from '@/contexts/AppContext'
import { useBookData }       from '@/hooks/useBookData'
import { useSearch }         from '@/hooks/useSearch'
import { useHistory }        from '@/hooks/useHistory'
import { useLock }           from '@/hooks/useLock'
import { AddRowModal }       from '@/components/ui/AddRowModal'
import { ConfirmDialog }     from '@/components/ui/ConfirmDialog'
import { ExportModal }       from '@/components/ui/ExportModal'
import { PrintModal }        from '@/components/ui/PrintModal'
import { HistoryDrawer }     from '@/components/ui/HistoryDrawer'
import { LockModal }         from '@/components/ui/LockModal'
import type { BookRow, HighlightPart } from '@/types'
import type { LockModalMode } from '@/components/ui/LockModal'

type ViewMode = 'table' | 'card'

// Warna teks data utama (amber seperti versi lama)
const DATA_COLOR = 'var(--data-text)'
const DATA_MONO  = 'var(--data-mono)'

// ── ActionBtn helper ──────────────────────────
function ActionBtn({
  onClick, title, children,
  active = false,
  activeColor = 'var(--accent)',
  activeBg = 'var(--accent-subtle)',
  activeBorder,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
  active?: boolean
  activeColor?: string
  activeBg?: string
  activeBorder?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 8, flexShrink: 0, cursor: 'pointer',
        border: `1px solid ${active && activeBorder ? activeBorder : 'var(--border)'}`,
        background: active ? activeBg : 'transparent',
        color: active ? activeColor : 'var(--text-muted)',
        transition: 'background 150ms, color 150ms',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = activeBg; e.currentTarget.style.color = activeColor }}
      onMouseLeave={e => {
        e.currentTarget.style.background = active ? activeBg : 'transparent'
        e.currentTarget.style.color = active ? activeColor : 'var(--text-muted)'
      }}
    >
      {children}
    </button>
  )
}

// ── Skeleton loading row ──────────────────────
function SkeletonRow({ colCount }: { colCount: number }) {
  return (
    <tr>
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} style={{ padding: '11px 12px' }}>
          <div style={{
            height: 12, borderRadius: 4, background: 'var(--border)',
            width: i === 0 ? 28 : i === colCount - 1 ? '60%' : '80%',
            animation: 'pulse 1.4s ease-in-out infinite',
          }} />
        </td>
      ))}
      <td style={{ padding: '11px 8px', width: 36 }} />
    </tr>
  )
}

// ── Skeleton card ─────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 12,
      border: '1px solid var(--border)', padding: '14px 14px 10px',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {[80, 60, 90, 50].map((w, i) => (
        <div key={i} style={{
          height: 11, borderRadius: 4, background: 'var(--border)',
          width: `${w}%`, animation: 'pulse 1.4s ease-in-out infinite',
          animationDelay: `${i * 0.1}s`,
        }} />
      ))}
    </div>
  )
}

// ── Highlight renderer ────────────────────────
function HighlightedText({ parts, colType }: { parts: HighlightPart[]; colType?: string }) {
  return (
    <>
      {parts.map((part, i) =>
        part.highlight ? (
          <mark key={i} style={{
            background: 'rgba(59,130,246,0.30)', color: 'var(--text-primary)',
            borderRadius: 3, padding: '0 1px',
            fontFamily: colType === 'mono'
              ? 'var(--font-mono, "JetBrains Mono", monospace)' : 'inherit',
          }}>
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  )
}

// ── Inline cell editor (table) ────────────────
interface CellProps {
  value:         string | number | undefined
  colKey:        string
  colType?:      string
  rowId:         string
  readOnly?:     boolean
  isMatch?:      boolean
  highlightText: (text: string) => HighlightPart[]
  onSave:        (rowId: string, field: string, value: string | number) => Promise<void>
}

function EditableCell({ value, colKey, colType, rowId, readOnly, isMatch, highlightText, onSave }: CellProps) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState('')
  const [saving,  setSaving]  = useState(false)
  const inputRef              = useRef<HTMLInputElement>(null)

  const displayValue = value !== undefined && value !== null && value !== ''
    ? String(value) : '—'
  const isEmpty = displayValue === '—'

  const startEdit = () => {
    if (readOnly) return
    setDraft(value !== undefined && value !== null ? String(value) : '')
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const commit = async () => {
    const trimmed  = draft.trim()
    const original = value !== undefined && value !== null ? String(value) : ''
    if (trimmed === original) { setEditing(false); return }
    setSaving(true)
    try {
      await onSave(rowId, colKey, trimmed)
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter')  { e.preventDefault(); commit() }
    if (e.key === 'Escape') { setEditing(false) }
  }

  if (editing) {
    return (
      <td style={{ padding: '4px 6px', minWidth: colType === 'date' ? 130 : undefined }}>
        <input
          ref={inputRef}
          type={colType === 'date' ? 'date' : 'text'}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKey}
          disabled={saving}
          style={{
            width: '100%', padding: '6px 8px', fontSize: 14, borderRadius: 6,
            border: '1.5px solid var(--accent)',
            background: 'var(--bg-elevated)', color: 'var(--text-primary)',
            outline: 'none',
            fontFamily: colType === 'mono'
              ? 'var(--font-mono, "JetBrains Mono", monospace)' : 'inherit',
          }}
        />
      </td>
    )
  }

  const highlightParts = isMatch && !isEmpty ? highlightText(displayValue) : null

  // Warna teks: kosong (muted), mono (amber terang), data biasa (amber)
  const textColor = isEmpty ? 'var(--text-muted)' : colType === 'mono' ? DATA_MONO : DATA_COLOR

  return (
    <td
      onClick={startEdit}
      style={{
        padding: '11px 12px', fontSize: 14,
        color: textColor,
        cursor: readOnly ? 'default' : 'pointer',
        transition: 'background 120ms',
        fontFamily: colType === 'mono'
          ? 'var(--font-mono, "JetBrains Mono", monospace)' : 'inherit',
        background: isMatch && !isEmpty ? 'rgba(59,130,246,0.06)' : 'transparent',
      borderRight: '1px solid var(--border)',
      }}
      onMouseEnter={e => { if (!readOnly) e.currentTarget.style.background = 'var(--bg-elevated)' }}
      onMouseLeave={e => { e.currentTarget.style.background = isMatch && !isEmpty ? 'rgba(59,130,246,0.06)' : 'transparent' }}
    >
      {isEmpty ? '—'
        : highlightParts ? <HighlightedText parts={highlightParts} colType={colType} />
        : displayValue}
    </td>
  )
}

// ── Card Row Edit Modal ───────────────────────
interface CardEditModalProps {
  open:    boolean
  row:     BookRow
  cols:    { k: string; l: string; type?: string; ro?: boolean }[]
  locked:  boolean
  onClose: () => void
  onSave:  (rowId: string, field: string, value: string | number) => Promise<void>
}

function CardEditModal({ open, row, cols, locked, onClose, onSave }: CardEditModalProps) {
  const [draft,  setDraft]  = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      const init: Record<string, string> = {}
      cols.forEach(c => {
        if (!c.ro) init[c.k] = row[c.k] !== undefined && row[c.k] !== null ? String(row[c.k]) : ''
      })
      setDraft(init)
    }
  }, [open, row, cols])

  if (!open) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const c of cols) {
        if (c.ro) continue
        const original = row[c.k] !== undefined && row[c.k] !== null ? String(row[c.k]) : ''
        const next     = (draft[c.k] ?? '').trim()
        if (next !== original) await onSave(row._id ?? '', c.k, next)
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'flex-end',
        animation: 'fadeIn 150ms ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, margin: '0 auto',
          background: 'var(--bg-elevated)',
          borderRadius: '16px 16px 0 0',
          padding: '16px 16px calc(16px + env(safe-area-inset-bottom))',
          animation: 'slideUp 200ms ease',
          maxHeight: '85vh', overflowY: 'auto',
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 14px' }} />
        <p style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
          Edit Baris No. {row.no}
        </p>
        {locked && (
          <div style={{
            padding: '8px 12px', borderRadius: 8, marginBottom: 12,
            background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)',
            fontSize: 13, color: 'var(--warning)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <LockKeyhole size={13} /> Baris ini terkunci — tidak bisa diedit
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cols.filter(c => !c.ro).map(col => (
            <div key={col.k}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                {col.l}
              </label>
              <input
                type={col.type === 'date' ? 'date' : 'text'}
                value={draft[col.k] ?? ''}
                onChange={e => setDraft(prev => ({ ...prev, [col.k]: e.target.value }))}
                disabled={locked || saving}
                style={{
                  width: '100%', padding: '9px 10px', fontSize: 14,
                  borderRadius: 8, border: '1.5px solid var(--border)',
                  background: locked ? 'var(--bg-card)' : 'var(--bg-input)',
                  color: 'var(--text-primary)', outline: 'none',
                  fontFamily: col.type === 'mono'
                    ? 'var(--font-mono, "JetBrains Mono", monospace)' : 'inherit',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { if (!locked) e.currentTarget.style.borderColor = 'var(--accent)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px', borderRadius: 9, fontSize: 14, fontWeight: 600,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-secondary)', cursor: 'pointer',
            }}
          >Batal</button>
          {!locked && (
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 2, padding: '10px', borderRadius: 9, fontSize: 14, fontWeight: 700,
                border: 'none', background: 'var(--accent)', color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
              }}
            >{saving ? 'Menyimpan...' : 'Simpan'}</button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Entry Card ────────────────────────────────
interface EntryCardProps {
  row:           BookRow
  rowIdx:        number
  cols:          { k: string; l: string; type?: string; w?: number; ro?: boolean }[]
  isLocked:      boolean
  globalLocked:  boolean
  isMatch:       boolean
  highlightText: (text: string) => HighlightPart[]
  onEdit:        (row: BookRow) => void
  onDelete:      (row: BookRow) => void
  onToggleLock:  (ri: number) => void
}

function EntryCard({
  row, rowIdx, cols, isLocked, globalLocked, isMatch,
  highlightText, onEdit, onDelete, onToggleLock,
}: EntryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const contentCols = cols.filter(c => !c.ro)
  const previewCols = contentCols.slice(0, 2)
  const extraCols   = contentCols.slice(2)
  const hasExtra    = extraCols.length > 0

  const renderVal = (col: typeof cols[0], val: string | number | undefined) => {
    const display = val !== undefined && val !== null && val !== '' ? String(val) : '—'
    const isEmpty = display === '—'
    const color   = isEmpty ? 'var(--text-muted)' : col.type === 'mono' ? DATA_MONO : DATA_COLOR
    if (isMatch && !isEmpty) {
      const parts = highlightText(display)
      return <HighlightedText parts={parts} colType={col.type} />
    }
    return (
      <span style={{
        color,
        fontFamily: col.type === 'mono' ? 'var(--font-mono, "JetBrains Mono", monospace)' : 'inherit',
        fontSize: 14,
      }}>
        {display}
      </span>
    )
  }

  return (
    <div style={{
      background: isLocked ? 'rgba(245,158,11,0.05)' : isMatch ? 'rgba(59,130,246,0.05)' : 'var(--bg-card)',
      borderRadius: 12,
      border: `1px solid ${isLocked ? 'rgba(245,158,11,0.25)' : isMatch ? 'rgba(59,130,246,0.25)' : 'var(--border)'}`,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{
          minWidth: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 7, flexShrink: 0,
          background: isLocked ? 'rgba(245,158,11,0.15)' : 'var(--accent-subtle)',
          color: isLocked ? 'var(--warning)' : 'var(--accent)',
          fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
          fontSize: 12, fontWeight: 700,
        }}>
          {row.no ?? rowIdx + 1}
        </span>
        {isLocked && (
          <span style={{
            fontSize: 10, fontWeight: 600, color: 'var(--warning)',
            background: 'rgba(245,158,11,0.12)', borderRadius: 5, padding: '2px 7px',
          }}>Terkunci</span>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 4 }}>
          {!globalLocked && (
            <button onClick={() => onToggleLock(rowIdx)} title={isLocked ? 'Buka kunci' : 'Kunci baris'}
              style={{
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 7, border: 'none',
                background: isLocked ? 'rgba(245,158,11,0.15)' : 'transparent',
                color: isLocked ? 'var(--warning)' : 'var(--text-muted)', cursor: 'pointer',
              }}>
              <LockKeyhole size={14} />
            </button>
          )}
          {!isLocked && !globalLocked && (
            <button onClick={() => onEdit(row)} title="Edit"
              style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <Pencil size={14} />
            </button>
          )}
          {!isLocked && !globalLocked && (
            <button onClick={() => onDelete(row)} title="Hapus"
              style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {previewCols.map(col => (
          <div key={col.k}>
            <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {col.l}
            </p>
            <div>{renderVal(col, row[col.k] as string | number | undefined)}</div>
          </div>
        ))}
        {hasExtra && (
          <>
            {expanded && extraCols.map(col => (
              <div key={col.k}>
                <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {col.l}
                </p>
                <div>{renderVal(col, row[col.k] as string | number | undefined)}</div>
              </div>
            ))}
            <button onClick={() => setExpanded(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 0', background: 'none', border: 'none', fontSize: 12, fontWeight: 600, color: 'var(--accent)', cursor: 'pointer', alignSelf: 'flex-start' }}>
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? 'Sembunyikan' : `${extraCols.length} kolom lagi`}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────
export default function AppPage() {
  const { activeBook, activeYear, showToast } = useApp()
  const { rows, status, error, addRow, updateCell, deleteRow } = useBookData(activeBook.id, activeYear)
  const { query, setQuery, clearQuery, filteredResults, totalRows, isFiltering, highlightText } = useSearch(rows, activeBook.cols)
  const { entries: histEntries, status: histStatus, logEdit } = useHistory(activeBook.id)
  const { isGlobalLocked, hasPin, hasMasterHash, unlockedSession, setPin, unlock, lock, toggleRowLock, isRowLocked, verifyMaster, setMasterHash } = useLock(activeYear)

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') return (localStorage.getItem('brViewMode') as ViewMode) ?? 'table'
    return 'table'
  })
  const handleSetViewMode = (mode: ViewMode) => { setViewMode(mode); localStorage.setItem('brViewMode', mode) }

  const [addOpen,       setAddOpen]       = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<BookRow | null>(null)
  const [deleting,      setDeleting]      = useState(false)
  const [exportOpen,    setExportOpen]    = useState(false)
  const [printOpen,     setPrintOpen]     = useState(false)
  const [histOpen,      setHistOpen]      = useState(false)
  const [lockOpen,      setLockOpen]      = useState(false)
  const [lockMode,      setLockMode]      = useState<LockModalMode>('set')
  const [cardEditRow,   setCardEditRow]   = useState<BookRow | null>(null)
  const [rowHistTarget, setRowHistTarget] = useState<BookRow | null>(null)

  const openLock = useCallback(() => {
    if (!hasPin) setLockMode('set')
    else if (isGlobalLocked) setLockMode('unlock')
    else setLockMode('change')
    setLockOpen(true)
  }, [hasPin, isGlobalLocked])

  const handleToggleRowLock = useCallback(async (ri: number) => {
    try { await toggleRowLock(activeBook.id, ri, activeYear) }
    catch { showToast({ message: 'Gagal mengubah kunci baris', variant: 'error' }) }
  }, [toggleRowLock, activeBook.id, activeYear, showToast])

  const handleAdd = useCallback(async (data: Record<string, string | number>) => {
    try { await addRow(data); showToast({ message: 'Baris berhasil ditambahkan', variant: 'success' }) }
    catch { showToast({ message: 'Gagal menambah baris', variant: 'error' }); throw new Error('add failed') }
  }, [addRow, showToast])

  const handleUpdateCell = useCallback(async (rowId: string, field: string, value: string | number) => {
    const ri    = rows.findIndex(r => r._id === rowId)
    const col   = activeBook.cols.find(c => c.k === field)
    const label = col?.l ?? field
    try {
      await updateCell(rowId, field, value)
      showToast({ message: 'Perubahan tersimpan', variant: 'success', duration: 1500 })
      if (ri >= 0) logEdit({ bookId: activeBook.id, ri, key: field, colLabel: label, newVal: value }).catch(() => {})
    } catch {
      showToast({ message: 'Gagal menyimpan perubahan', variant: 'error' })
    }
  }, [updateCell, showToast, rows, activeBook, logEdit])

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmDelete?._id) return
    setDeleting(true)
    try {
      await deleteRow(confirmDelete._id)
      showToast({ message: `Baris No. ${confirmDelete.no} dihapus`, variant: 'success' })
      setConfirmDelete(null)
    } catch {
      showToast({ message: 'Gagal menghapus baris', variant: 'error' })
    } finally { setDeleting(false) }
  }, [confirmDelete, deleteRow, showToast])

  const filteredRows = filteredResults.map(r => r.row)
  const displayRows  = isFiltering ? filteredRows : rows

  // ── Sub-header: 2 baris ──────────────────
  const subHeader = (
    <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
      <div style={{ padding: '0 8px', display: 'flex', alignItems: 'center', gap: 4, height: 44 }}>
        {/* View toggle */}
        <div style={{ display: 'flex', borderRadius: 7, border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0 }}>
          <button onClick={() => handleSetViewMode('table')} title="Tampilan Tabel"
            style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: viewMode === 'table' ? 'var(--accent)' : 'transparent', color: viewMode === 'table' ? '#fff' : 'var(--text-muted)' }}>
            <LayoutList size={16} />
          </button>
          <button onClick={() => handleSetViewMode('card')} title="Tampilan Card"
            style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderLeft: '1px solid var(--border)', cursor: 'pointer', background: viewMode === 'card' ? 'var(--accent)' : 'transparent', color: viewMode === 'card' ? '#fff' : 'var(--text-muted)' }}>
            <LayoutGrid size={16} />
          </button>
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border)', flexShrink: 0, margin: '0 2px' }} />

        <ActionBtn onClick={() => { setRowHistTarget(null); setHistOpen(true) }} title="Riwayat Edit" active={histEntries.length > 0} activeColor="var(--warning)" activeBg="rgba(245,158,11,0.08)">
          <History size={16} />
        </ActionBtn>
        <ActionBtn onClick={() => setPrintOpen(true)} title="Cetak">
          <Printer size={16} />
        </ActionBtn>
        <ActionBtn onClick={() => setExportOpen(true)} title="Export / Backup">
          <FileSpreadsheet size={16} />
        </ActionBtn>

        <div style={{ width: 1, height: 24, background: 'var(--border)', flexShrink: 0, margin: '0 2px' }} />

        <ActionBtn onClick={openLock} title={isGlobalLocked ? 'Buku terkunci — tap untuk buka' : hasPin ? 'Ganti PIN' : 'Set PIN Kunci'} active={isGlobalLocked} activeColor="var(--warning)" activeBg="rgba(245,158,11,0.10)" activeBorder="rgba(245,158,11,0.4)">
          {isGlobalLocked ? <Lock size={16} /> : <Unlock size={16} />}
        </ActionBtn>

        {isFiltering && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
            {filteredResults.length}/{totalRows}
          </span>
        )}
      </div>
    </div>
  )

  // ── Loading ───────────────────────────────
  if (status === 'loading' || status === 'idle') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {subHeader}
        <div style={{ flex: 1, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
            <thead>
              <tr style={{ background: 'var(--bg-table-head)', borderBottom: '2px solid var(--border)' }}>
                {activeBook.cols.map(col => (
                  <th key={col.k} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', width: col.w ?? undefined }}>{col.l}</th>
                ))}
                <th style={{ width: 36 }} />
              </tr>
            </thead>
            <tbody>{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} colCount={activeBook.cols.length} />)}</tbody>
          </table>
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────
  if (status === 'error') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {subHeader}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <WifiOff size={32} style={{ color: 'var(--danger)', opacity: 0.6 }} />
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, textAlign: 'center' }}>
            Gagal memuat data<br /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{error}</span>
          </p>
          <button onClick={() => window.location.reload()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            <RefreshCw size={14} /> Coba lagi
          </button>
        </div>
      </div>
    )
  }

  // ── Empty ─────────────────────────────────
  if (rows.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {subHeader}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={24} style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>Belum ada entri</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{activeBook.kode} · TA {activeYear}</p>
          </div>
          {!isGlobalLocked && (
            <button onClick={() => setAddOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 9, fontSize: 14, fontWeight: 700, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}>
              <Plus size={15} /> Tambah Entri Pertama
            </button>
          )}
        </div>
        <AddRowModal open={addOpen} cols={activeBook.cols} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
        {/* FAB di empty state */}
        {!isGlobalLocked && (
          <button onClick={() => setAddOpen(true)} title="Tambah baris baru"
            style={{ position: 'fixed', right: 16, bottom: 'calc(16px + env(safe-area-inset-bottom))', width: 52, height: 52, borderRadius: '50%', background: 'var(--accent)', color: '#fff', border: 'none', boxShadow: '0 4px 20px rgba(59,130,246,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20 }}>
            <Plus size={24} />
          </button>
        )}
      </div>
    )
  }

  // ── No search results ─────────────────────
  if (isFiltering && filteredRows.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {subHeader}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <SearchX size={28} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Tidak ditemukan untuk &quot;{query}&quot;</p>
        </div>
      </div>
    )
  }

  // ── Main content ──────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {subHeader}

      {/* ── TABLE VIEW ── */}
      {viewMode === 'table' && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 360 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
              {/* Baris 1: label kolom */}
              <tr style={{ background: 'var(--bg-table-head)', borderBottom: '1px solid var(--border)' }}>
                {activeBook.cols.map(col => (
                  <th key={col.k} style={{
                    padding: '9px 12px 2px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                    color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '0.05em', width: col.w ?? undefined, whiteSpace: 'nowrap',
                  }}>
                    {col.l}
                  </th>
                ))}
                <th style={{ width: 96, padding: '9px 8px 2px', position: 'sticky', right: 0, background: 'var(--bg-table-head)', zIndex: 1 }} />
              </tr>
              {/* Baris 2: nomor kolom — standar format buku register desa */}
              <tr style={{ background: 'var(--bg-table-head)', borderBottom: '2px solid var(--border)' }}>
                {activeBook.cols.map((_, ci) => (
                  <th key={ci} style={{
                    padding: '2px 12px 8px', textAlign: 'left',
                    fontSize: 11, fontWeight: 600,
                    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                    color: 'var(--accent)',
                    borderRight: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    {ci + 1}
                  </th>
                ))}
                <th style={{ padding: '2px 8px 8px', position: 'sticky', right: 0, background: 'var(--bg-table-head)', zIndex: 1 }} />
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, rowIdx) => {
                const rowLocked = isRowLocked(activeBook.id, rowIdx)
                const isMatch   = isFiltering

                return (
                  <tr
                    key={row._id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: rowLocked ? 'rgba(245,158,11,0.04)' : 'transparent',
                      transition: 'background 100ms',
                      opacity: isGlobalLocked && !rowLocked ? 0.75 : 1,
                    }}
                    onMouseEnter={e => { if (!rowLocked) (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-elevated)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = rowLocked ? 'rgba(245,158,11,0.04)' : 'transparent' }}
                  >
                    {activeBook.cols.map(col => (
                      <EditableCell
                        key={col.k}
                        value={row[col.k] as string | number | undefined}
                        colKey={col.k}
                        colType={col.type}
                        rowId={row._id ?? ''}
                        readOnly={col.ro || rowLocked || isGlobalLocked}
                        isMatch={isMatch}
                        highlightText={highlightText}
                        onSave={handleUpdateCell}
                      />
                    ))}
                    <td style={{
                      padding: '4px 6px', width: 96, whiteSpace: 'nowrap',
                      position: 'sticky', right: 0, zIndex: 1,
                      background: rowLocked ? 'rgba(245,158,11,0.04)' : 'var(--bg-app)',
                      borderLeft: '1px solid var(--border)',
                    }}>
                      <div style={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                        {/* Log per baris */}
                        <button
                          onClick={() => { setRowHistTarget(row); setHistOpen(true) }}
                          title="Riwayat baris ini"
                          style={{
                            width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: 6, border: 'none', background: 'transparent',
                            color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; e.currentTarget.style.color = 'var(--warning)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                        >
                          <History size={13} />
                        </button>
                        {/* Lock per baris */}
                        {!isGlobalLocked && (
                          <button
                            onClick={() => handleToggleRowLock(rowIdx)}
                            title={rowLocked ? 'Buka kunci baris' : 'Kunci baris'}
                            style={{
                              width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              borderRadius: 6, border: 'none', flexShrink: 0,
                              background: rowLocked ? 'rgba(245,158,11,0.15)' : 'transparent',
                              color: rowLocked ? 'var(--warning)' : 'var(--text-muted)',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.18)'; e.currentTarget.style.color = 'var(--warning)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = rowLocked ? 'rgba(245,158,11,0.15)' : 'transparent'; e.currentTarget.style.color = rowLocked ? 'var(--warning)' : 'var(--text-muted)' }}
                          >
                            <LockKeyhole size={13} />
                          </button>
                        )}
                        {/* Hapus baris */}
                        {!rowLocked && !isGlobalLocked && (
                          <button
                            onClick={() => setConfirmDelete(row)}
                            title="Hapus baris ini"
                            style={{
                              width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              borderRadius: 6, border: 'none', background: 'transparent',
                              color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = 'var(--danger)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>


        </div>
      )}

      {/* ── CARD VIEW ── */}
      {viewMode === 'card' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {displayRows.map((row, rowIdx) => {
              const rowLocked = isRowLocked(activeBook.id, rowIdx)
              const isMatch   = isFiltering && filteredResults.some(r => r.row._id === row._id)
              return (
                <EntryCard
                  key={row._id} row={row} rowIdx={rowIdx} cols={activeBook.cols}
                  isLocked={rowLocked} globalLocked={isGlobalLocked} isMatch={isMatch}
                  highlightText={highlightText}
                  onEdit={r => setCardEditRow(r)}
                  onDelete={r => setConfirmDelete(r)}
                  onToggleLock={handleToggleRowLock}
                />
              )
            })}
          </div>

        </div>
      )}

      {/* ── FAB Tambah ── */}
      {!isFiltering && !isGlobalLocked && (
        <button
          onClick={() => setAddOpen(true)}
          title="Tambah baris baru"
          style={{
            position: 'fixed',
            right: 16,
            bottom: 'calc(16px + env(safe-area-inset-bottom))',
            width: 52, height: 52,
            borderRadius: '50%',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 20px rgba(59,130,246,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 20,
            transition: 'transform 150ms, box-shadow 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(59,130,246,0.65)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.5)' }}
        >
          <Plus size={24} />
        </button>
      )}

      {/* ── Modals ── */}
      <AddRowModal open={addOpen} cols={activeBook.cols} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
      <ConfirmDialog
        open={!!confirmDelete} title="Hapus Baris"
        message={`Yakin ingin menghapus baris No. ${confirmDelete?.no}? Data yang dihapus tidak bisa dikembalikan.`}
        confirmLabel="Hapus" onConfirm={handleDeleteConfirm} onCancel={() => setConfirmDelete(null)} loading={deleting}
      />
      <ExportModal open={exportOpen} book={activeBook} rows={rows} year={activeYear} onClose={() => setExportOpen(false)} />
      <PrintModal open={printOpen} book={activeBook} rows={rows} filtered={filteredRows} year={activeYear} isFiltering={isFiltering} onClose={() => setPrintOpen(false)} />
      <HistoryDrawer
        open={histOpen}
        entries={rowHistTarget
          ? histEntries.filter(e => rows[e.ri]?._id === rowHistTarget._id)
          : histEntries
        }
        status={histStatus}
        bookName={rowHistTarget
          ? `${activeBook.kode} — Baris No. ${rowHistTarget.no}`
          : `${activeBook.kode} — ${activeBook.judul}`
        }
        onClose={() => { setHistOpen(false); setRowHistTarget(null) }}
      />
      <LockModal open={lockOpen} mode={lockMode} hasMasterHash={hasMasterHash} onClose={() => setLockOpen(false)} onSetPin={setPin} onUnlock={unlock} onVerifyMaster={verifyMaster} onSetMaster={setMasterHash} />
      {cardEditRow && (
        <CardEditModal
          open={!!cardEditRow} row={cardEditRow} cols={activeBook.cols}
          locked={isRowLocked(activeBook.id, rows.findIndex(r => r._id === cardEditRow._id))}
          onClose={() => setCardEditRow(null)} onSave={handleUpdateCell}
        />
      )}
    </div>
  )
}
