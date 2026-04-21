// ─────────────────────────────────────────────
// BuRegDes Next — lib/backupRestore.ts
// Backup: download snapshot RTDB → JSON
// Restore: upload JSON → tulis ulang ke RTDB
// ─────────────────────────────────────────────

import { ref, get, set } from 'firebase/database'
import { database }       from '@/lib/firebase'

// ── BACKUP ───────────────────────────────────

/**
 * Download snapshot `data/{year}` + `desaInfo` ke file JSON lokal.
 * File: BuRegDes_backup_{year}_{timestamp}.json
 */
export async function backupJSON(year: string): Promise<void> {
  // Ambil data tahun + desaInfo secara paralel
  const [snapData, snapDesa] = await Promise.all([
    get(ref(database, `data/${year}`)),
    get(ref(database, 'desaInfo')),
  ])

  const payload = {
    _meta: {
      version:  1,
      year,
      exportedAt: new Date().toISOString(),
      source:  'BuRegDes Next',
    },
    desaInfo: snapDesa.exists() ? snapDesa.val() : {},
    data:     snapData.exists() ? snapData.val()  : {},
  }

  const jsonStr = JSON.stringify(payload, null, 2)
  const blob    = new Blob([jsonStr], { type: 'application/json' })
  const url     = URL.createObjectURL(blob)

  // Buat link download & klik otomatis
  const now     = new Date()
  const ts      = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}`
  const link    = document.createElement('a')
  link.href     = url
  link.download = `BuRegDes_backup_TA${year}_${ts}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ── RESTORE ──────────────────────────────────

export interface RestoreResult {
  year:      string
  booksRestored: string[]
  desaInfo:  boolean
}

/**
 * Baca file JSON backup → tulis ulang ke RTDB.
 * Hanya menulis `data/{year}/tableData` dan `desaInfo`.
 * Tidak menyentuh path lain (sheetLocks, masterHash, history, dll).
 */
export async function restoreJSON(file: File, year: string): Promise<RestoreResult> {
  const text    = await file.text()
  const payload = JSON.parse(text) as {
    _meta?:   { version?: number; year?: string }
    desaInfo?: Record<string, string>
    data?:    {
      tableData?: Record<string, unknown[]>
      [key: string]: unknown
    }
  }

  const result: RestoreResult = {
    year,
    booksRestored: [],
    desaInfo: false,
  }

  // ── Tulis tableData ──────────────────────────
  const tableData = payload.data?.tableData
  if (tableData && typeof tableData === 'object') {
    for (const [bookId, rows] of Object.entries(tableData)) {
      if (Array.isArray(rows)) {
        await set(ref(database, `data/${year}/tableData/${bookId}`), rows)
        result.booksRestored.push(bookId)
      }
    }
  }

  // ── Tulis desaInfo ───────────────────────────
  if (payload.desaInfo && typeof payload.desaInfo === 'object') {
    await set(ref(database, 'desaInfo'), payload.desaInfo)
    result.desaInfo = true
  }

  return result
}
