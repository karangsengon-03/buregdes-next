'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — ExportModal (Session 10)
// 4 opsi: Excel buku ini · Excel semua buku · PDF · Backup/Restore JSON
// ─────────────────────────────────────────────

import { useState, useCallback, useRef } from 'react'
import {
  FileSpreadsheet, FileText, Download, X,
  CheckCircle2, DatabaseBackup, Upload, ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { useDesaInfo }  from '@/hooks/useDesaInfo'
import { BOOKS }        from '@/constants/books'
import { useBookData }  from '@/hooks/useBookData'
import type { BookDef, BookRow } from '@/types'

interface ExportModalProps {
  open:    boolean
  book:    BookDef
  rows:    BookRow[]
  year:    string
  onClose: () => void
}

type ExportState = 'idle' | 'loading' | 'done' | 'error'
type ActivePanel = null | 'excel-single' | 'excel-all' | 'pdf' | 'backup' | 'restore'

// ── Sub-hook: fetch semua buku untuk export all ──
function useAllBooksData(year: string, enabled: boolean) {
  const a1 = useBookData('A1', year)
  const a2 = useBookData('A2', year)
  const a3 = useBookData('A3', year)
  const a4 = useBookData('A4', year)
  const a5 = useBookData('A5', year)
  const a6 = useBookData('A6', year)

  if (!enabled) return null

  return {
    A1: a1.rows, A2: a2.rows, A3: a3.rows,
    A4: a4.rows, A5: a5.rows, A6: a6.rows,
  }
}

export function ExportModal({ open, book, rows, year, onClose }: ExportModalProps) {
  const { desaInfo }        = useDesaInfo()
  const [panel, setPanel]   = useState<ActivePanel>(null)
  const [state, setState]   = useState<ExportState>('idle')
  const [errMsg, setErrMsg] = useState('')
  const [restoreInfo, setRestoreInfo] = useState<string>('')
  const fileInputRef        = useRef<HTMLInputElement>(null)

  const allRows = useAllBooksData(year, panel === 'excel-all')

  const reset = useCallback(() => {
    setState('idle')
    setErrMsg('')
    setRestoreInfo('')
  }, [])

  const handleClose = useCallback(() => {
    setPanel(null)
    reset()
    onClose()
  }, [onClose, reset])

  const goPanel = useCallback((p: ActivePanel) => {
    setPanel(p)
    reset()
  }, [reset])

  // ── Handlers ─────────────────────────────────

  const handleExcelSingle = useCallback(async () => {
    setState('loading')
    try {
      const { exportExcel } = await import('@/lib/exportExcel')
      exportExcel({ book, rows, year, desaInfo })
      setState('done')
      setTimeout(handleClose, 1200)
    } catch (e) {
      console.error(e)
      setErrMsg('Gagal export Excel.')
      setState('error')
    }
  }, [book, rows, year, desaInfo, handleClose])

  const handleExcelAll = useCallback(async () => {
    if (!allRows) return
    setState('loading')
    try {
      const { exportAllBooks } = await import('@/lib/exportExcel')
      exportAllBooks({ allRows, books: BOOKS, desaInfo, year })
      setState('done')
      setTimeout(handleClose, 1200)
    } catch (e) {
      console.error(e)
      setErrMsg('Gagal export Excel semua buku.')
      setState('error')
    }
  }, [allRows, desaInfo, year, handleClose])

  const handlePDF = useCallback(async () => {
    setState('loading')
    try {
      const { exportPDF } = await import('@/lib/exportPDF')
      await exportPDF({ book, rows, year, desaInfo })
      setState('done')
      setTimeout(handleClose, 1200)
    } catch (e) {
      console.error(e)
      setErrMsg('Gagal export PDF.')
      setState('error')
    }
  }, [book, rows, year, desaInfo, handleClose])

  const handleBackup = useCallback(async () => {
    setState('loading')
    try {
      const { backupJSON } = await import('@/lib/backupRestore')
      await backupJSON(year)
      setState('done')
      setTimeout(handleClose, 1200)
    } catch (e) {
      console.error(e)
      setErrMsg('Gagal backup data.')
      setState('error')
    }
  }, [year, handleClose])

  const handleRestoreFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setState('loading')
    setRestoreInfo('')
    try {
      const { restoreJSON } = await import('@/lib/backupRestore')
      const result = await restoreJSON(file, year)
      setRestoreInfo(
        `Berhasil restore ${result.booksRestored.length} buku (${result.booksRestored.join(', ')}).` +
        (result.desaInfo ? ' Info desa diperbarui.' : '')
      )
      setState('done')
    } catch (e) {
      console.error(e)
      setErrMsg('File tidak valid atau gagal restore.')
      setState('error')
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [year])

  if (!open) return null

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '7px 0', borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, marginRight: 12 }}>
        {label}
      </span>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>
        {value}
      </span>
    </div>
  )

  const menuItems: {
    id: ActivePanel
    icon: React.ReactNode
    color: string
    bg: string
    title: string
    sub: string
  }[] = [
    {
      id: 'excel-single',
      icon: <FileSpreadsheet size={17} />,
      color: 'var(--success)', bg: 'var(--success-subtle)',
      title: 'Excel — Buku Ini',
      sub: `${book.kode} · ${rows.length} baris`,
    },
    {
      id: 'excel-all',
      icon: <FileSpreadsheet size={17} />,
      color: '#34D399', bg: 'rgba(52,211,153,0.12)',
      title: 'Excel — Semua Buku',
      sub: 'A1–A6 dalam 1 file · 6 sheet',
    },
    {
      id: 'pdf',
      icon: <FileText size={17} />,
      color: '#F87171', bg: 'rgba(248,113,113,0.12)',
      title: 'PDF — Buku Ini',
      sub: `${book.kode} · landscape A4`,
    },
    {
      id: 'backup',
      icon: <DatabaseBackup size={17} />,
      color: 'var(--accent)', bg: 'var(--accent-subtle)',
      title: 'Backup JSON',
      sub: `Snapshot data TA ${year}`,
    },
    {
      id: 'restore',
      icon: <Upload size={17} />,
      color: 'var(--warning)', bg: 'var(--warning-subtle)',
      title: 'Restore JSON',
      sub: 'Upload file backup ke RTDB',
    },
  ]

  return (
    <>
      <div onClick={handleClose} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }} />

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--bg-elevated)',
        borderRadius: '18px 18px 0 0',
        border: '1px solid var(--border)', borderBottom: 'none',
        padding: '0 0 env(safe-area-inset-bottom)',
        maxWidth: 480, margin: '0 auto',
        maxHeight: '90dvh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 16px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {panel && (
              <button onClick={() => { setPanel(null); reset() }} style={{
                width: 32, height: 32, borderRadius: 8, border: 'none',
                background: 'var(--bg-card)', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 18, fontWeight: 700,
                transition: 'background var(--transition-fast)',
              }}>‹</button>
            )}
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              {panel === null             ? 'Export & Backup'
               : panel === 'excel-single' ? 'Excel — Buku Ini'
               : panel === 'excel-all'    ? 'Excel — Semua Buku'
               : panel === 'pdf'          ? 'PDF — Buku Ini'
               : panel === 'backup'       ? 'Backup JSON'
               :                           'Restore JSON'}
            </p>
          </div>
          <button onClick={handleClose} style={{
            width: 32, height: 32, borderRadius: 8, border: 'none',
            background: 'transparent', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            transition: 'background var(--transition-fast)',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '12px 16px 20px', overflowY: 'auto', flex: 1 }}>

          {/* ── MENU UTAMA ── */}
          {panel === null && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {menuItems.map((item) => (
                <button key={item.id} onClick={() => goPanel(item.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 12,
                  border: '1px solid var(--border)', background: 'var(--bg-card)',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-md)', background: item.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color: item.color,
                  }}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.title}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {item.sub}
                    </p>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          )}

          {/* ── EXCEL SINGLE ── */}
          {panel === 'excel-single' && (
            <>
              <InfoRow label="Buku"  value={`${book.kode} — ${book.judul}`} />
              <InfoRow label="Tahun" value={`TA ${year}`} />
              <InfoRow label="Baris" value={`${rows.length} baris data`} />
              <InfoRow label="Desa"  value={desaInfo.desa ? `Desa ${desaInfo.desa}` : '(belum diisi)'} />
              {rows.length === 0 && <EmptyWarning />}
              {state === 'error' && <ErrorBanner msg={errMsg} />}
              <ExportBtn
                state={state}
                onClick={handleExcelSingle}
                label={<><Download size={16}/> Download Excel</>}
                loadingLabel="Menyiapkan file..."
              />
            </>
          )}

          {/* ── EXCEL ALL ── */}
          {panel === 'excel-all' && (
            <>
              <InfoRow label="Buku"  value="A1, A2, A3, A4, A5, A6 (6 sheet)" />
              <InfoRow label="Tahun" value={`TA ${year}`} />
              <InfoRow label="Desa"  value={desaInfo.desa ? `Desa ${desaInfo.desa}` : '(belum diisi)'} />
              <div style={{
                marginTop: 12, padding: '10px 12px', borderRadius: 'var(--radius-md)',
                background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
                fontSize: 12, color: 'var(--accent)',
              }}>
                Semua 6 buku akan diekspor ke 1 file Excel dengan 6 sheet.
              </div>
              {state === 'error' && <ErrorBanner msg={errMsg} />}
              <ExportBtn
                state={state}
                onClick={handleExcelAll}
                disabled={!allRows}
                label={<><Download size={16}/> Download Excel Semua Buku</>}
                loadingLabel="Memuat semua buku..."
              />
            </>
          )}

          {/* ── PDF ── */}
          {panel === 'pdf' && (
            <>
              <InfoRow label="Buku"   value={`${book.kode} — ${book.judul}`} />
              <InfoRow label="Tahun"  value={`TA ${year}`} />
              <InfoRow label="Baris"  value={`${rows.length} baris data`} />
              <InfoRow label="Format" value="Landscape A4" />
              {rows.length === 0 && <EmptyWarning />}
              {state === 'error' && <ErrorBanner msg={errMsg} />}
              <ExportBtn
                state={state}
                onClick={handlePDF}
                label={<><FileText size={16}/> Download PDF</>}
                loadingLabel="Membuat PDF..."
              />
            </>
          )}

          {/* ── BACKUP ── */}
          {panel === 'backup' && (
            <>
              <InfoRow label="Sumber" value={`data/TA${year} + desaInfo`} />
              <InfoRow label="Format" value="JSON (.json)" />
              <div style={{
                marginTop: 12, padding: '10px 12px', borderRadius: 'var(--radius-md)',
                background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
                fontSize: 12, color: 'var(--accent)',
              }}>
                File backup berisi seluruh data tabel dan info desa. Simpan di tempat aman.
              </div>
              {state === 'error' && <ErrorBanner msg={errMsg} />}
              <ExportBtn
                state={state}
                onClick={handleBackup}
                label={<><DatabaseBackup size={16}/> Download Backup JSON</>}
                loadingLabel="Mengambil data RTDB..."
                doneLabel="Backup Berhasil!"
              />
            </>
          )}

          {/* ── RESTORE ── */}
          {panel === 'restore' && (
            <>
              <div style={{
                padding: '10px 12px', borderRadius: 'var(--radius-md)',
                background: 'var(--warning-subtle)', border: '1px solid var(--warning-border)',
                fontSize: 12, color: 'var(--warning)',
                display: 'flex', gap: 8, alignItems: 'flex-start',
              }}>
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  Restore akan <strong>menimpa</strong> data tabel TA {year} dan info desa.
                  Proses ini tidak bisa dibatalkan.
                </span>
              </div>
              <InfoRow label="Target" value={`data/TA${year}/tableData`} />
              <InfoRow label="Format" value="JSON dari Backup BuRegDes" />

              {state === 'done' && restoreInfo && (
                <div style={{
                  marginTop: 12, padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  background: 'var(--success-subtle)', border: '1px solid var(--success-border)',
                  fontSize: 12, color: 'var(--success)',
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                }}>
                  <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{restoreInfo}</span>
                </div>
              )}
              {state === 'error' && <ErrorBanner msg={errMsg} />}

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleRestoreFile}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={state === 'loading'}
                style={{
                  width: '100%', marginTop: 14, padding: '12px 16px',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--warning-border)',
                  background: 'var(--warning-subtle)',
                  color: state === 'loading' ? 'var(--text-muted)' : 'var(--warning)',
                  fontSize: 14, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: state === 'loading' ? 'not-allowed' : 'pointer',
                  opacity: state === 'loading' ? 0.72 : 1,
                }}
              >
                {state === 'loading' ? 'Memproses file...' : <><Upload size={16}/> Pilih File Backup (.json)</>}
              </button>
            </>
          )}

        </div>
      </div>
    </>
  )
}

// ── Helper components ─────────────────────────

function EmptyWarning() {
  return (
    <div style={{
      marginTop: 12, padding: '10px 12px', borderRadius: 'var(--radius-md)',
      background: 'var(--warning-subtle)', border: '1px solid var(--warning-border)',
      fontSize: 12, color: 'var(--warning)',
    }}>
      Buku ini belum memiliki data. File akan kosong.
    </div>
  )
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div style={{
      marginTop: 12, padding: '10px 12px', borderRadius: 'var(--radius-md)',
      background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)',
      fontSize: 12, color: 'var(--danger)',
    }}>
      {msg}
    </div>
  )
}

function ExportBtn({
  state, onClick, label, loadingLabel, doneLabel, disabled,
}: {
  state: ExportState
  onClick: () => void
  label: React.ReactNode
  loadingLabel: string
  doneLabel?: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={state === 'loading' || state === 'done' || disabled}
      style={{
        width: '100%', marginTop: 14, padding: '12px 16px',
        borderRadius: 'var(--radius-md)', border: 'none',
        background: state === 'done' ? 'var(--success)' : 'var(--accent)',
        color: '#fff', fontSize: 14, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        cursor: state === 'loading' || state === 'done' || disabled ? 'not-allowed' : 'pointer',
        opacity: state === 'loading' || disabled ? 0.75 : 1,
        transition: 'background 200ms',
      }}
    >
      {state === 'done'
        ? <><CheckCircle2 size={16} /> {doneLabel ?? 'Berhasil!'}</>
        : state === 'loading'
        ? loadingLabel
        : label}
    </button>
  )
}
