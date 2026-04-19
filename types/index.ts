// ─────────────────────────────────────────────
// BuRegDes Next — Types
// Session 1 types TIDAK diubah, hanya tambah ToastMessage
// ─────────────────────────────────────────────

export interface BookColumn {
  k: string        // key / field name
  l: string        // label
  w: string        // width
  ro?: boolean     // read-only
}

export interface BookDef {
  id: string
  kode: string
  judul: string
  group?: string
  cols: BookColumn[]
}

export interface BookRow {
  no: string
  [key: string]: string | undefined
}

export interface DesaInfo {
  desa: string
  kecamatan: string
  kabupaten: string
  provinsi: string
  tahun: string
}

export interface HistoryEntry {
  ts: number
  user: string
  bookId: string
  bookJudul: string
  rowNo: string | number
  field: string
  oldVal: string
  newVal: string
}

export interface PresenceUser {
  username: string
  email: string
  online: boolean
  lastSeen: number
}

export interface SessionData {
  email: string
  username: string
  savedPwd?: string
}

export type Theme    = 'dark' | 'light'
export type ViewMode = 'table' | 'card'

// ── Tambahan Session 2 ────────────────────────
export interface ToastMessage {
  id: string
  message: string
  variant?: 'success' | 'error' | 'warning' | 'info'
  duration?: number   // ms, default 3000
}
