// ─────────────────────────────────────────────
// BuRegDes Next — Types (Fixed)
// ─────────────────────────────────────────────

export type ColumnType = 'text' | 'number' | 'date' | 'mono'

export interface BookColumn {
  k:    string        // key / field name
  l:    string        // label
  w?:   number        // width px
  ro?:  boolean       // read-only
  type?: ColumnType   // tipe data
}

// Alias — useSearch menggunakan ColDef
export type ColDef = BookColumn

export interface BookDef {
  id:        string        // 'A1'–'A6' — dipakai untuk RTDB path (tanpa titik)
  kode:      string        // 'A.1'–'A.6' — dipakai untuk display
  judul:     string
  shortName?: string
  group?:    string
  cols:      BookColumn[]
}

export interface BookRow {
  _id?: string                             // array index sebagai string ('0','1','2',...)
  no:   string | number                   // nomor urut (bisa string dari RTDB lama)
  [key: string]: string | number | undefined
}

export interface DesaInfo {
  desa:       string
  kecamatan:  string
  kabupaten:  string
  provinsi:   string
  tahun:      string
}

// ── Session 5: Search ────────────────────────
export interface HighlightPart {
  text:      string
  highlight: boolean
}

// ── Session 8: History ───────────────────────
export interface HistoryEntry {
  ts:       number
  user:     string
  bookId:   string
  rowNo:    string | number
  field:    string
  oldVal:   string | number | null
  newVal:   string | number | null
}

export interface PresenceUser {
  uid:      string
  name:     string
  online:   boolean
  lastSeen: number | null
}

export interface SessionData {
  email:     string
  username:  string
  savedPwd?: string
}

export type Theme    = 'dark' | 'light'
export type ViewMode = 'table' | 'card'

// ── Layout ───────────────────────────────────
export interface ToastMessage {
  id:       string
  message:  string
  variant?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}
