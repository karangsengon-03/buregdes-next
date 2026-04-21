// ─────────────────────────────────────────────
// BuRegDes Next — BOOKS constants
// id:   'A1'–'A6'   → dipakai untuk RTDB path (tanpa titik)
// kode: 'A.1'–'A.6' → dipakai untuk display/label
// ─────────────────────────────────────────────
import type { BookDef } from '@/types'

export const BOOKS: BookDef[] = [
  {
    id: 'A1', kode: 'A.1',
    judul: 'Buku Peraturan Desa',
    shortName: 'Perdes',
    cols: [
      { k: 'no',            l: 'No',                                          w: 40,  ro: true },
      { k: 'noDitetapkan',  l: 'Nomor Ditetapkan' },
      { k: 'noDiundangkan', l: 'Nomor Diundangkan dalam Lembaran Desa' },
      { k: 'tentang',       l: 'Tentang' },
      { k: 'tglDitetapkan', l: 'Tanggal Ditetapkan',   type: 'date' },
      { k: 'tglDiundangkan',l: 'Tanggal Diundangkan',  type: 'date' },
    ],
  },
  {
    id: 'A2', kode: 'A.2',
    judul: 'Buku Peraturan Kepala Desa',
    shortName: 'Perkades',
    cols: [
      { k: 'no',            l: 'No',                                          w: 40,  ro: true },
      { k: 'noDitetapkan',  l: 'Nomor Ditetapkan' },
      { k: 'noDiundangkan', l: 'Nomor Diundangkan dalam Lembaran Desa' },
      { k: 'tentang',       l: 'Tentang' },
      { k: 'tglDitetapkan', l: 'Tanggal Ditetapkan',   type: 'date' },
      { k: 'tglDiundangkan',l: 'Tanggal Diundangkan',  type: 'date' },
    ],
  },
  {
    id: 'A3', kode: 'A.3',
    judul: 'Buku Peraturan Bersama Kepala Desa',
    shortName: 'Perberkades',
    cols: [
      { k: 'no',            l: 'No',                                          w: 40,  ro: true },
      { k: 'noDitetapkan',  l: 'Nomor Ditetapkan' },
      { k: 'noDiundangkan', l: 'Nomor Diundangkan dalam Lembaran Desa' },
      { k: 'tentang',       l: 'Tentang' },
      { k: 'tglDitetapkan', l: 'Tanggal Ditetapkan',   type: 'date' },
      { k: 'tglDiundangkan',l: 'Tanggal Diundangkan',  type: 'date' },
    ],
  },
  {
    id: 'A4', kode: 'A.4',
    judul: 'Buku Keputusan Kepala Desa',
    shortName: 'SK Kades',
    cols: [
      { k: 'no',            l: 'No',              w: 40,  ro: true },
      { k: 'noDitetapkan',  l: 'Nomor Ditetapkan' },
      { k: 'tentang',       l: 'Tentang' },
      { k: 'tglDitetapkan', l: 'Tanggal Ditetapkan', type: 'date' },
    ],
  },
  {
    id: 'A5', kode: 'A.5',
    judul: 'Buku Agenda Surat Masuk',
    shortName: 'Surat Masuk',
    cols: [
      { k: 'no',     l: 'No',      w: 40,  ro: true },
      { k: 'nomor',  l: 'Nomor',   type: 'mono' },
      { k: 'tanggal',l: 'Tanggal', type: 'date' },
      { k: 'uraian', l: 'Uraian' },
    ],
  },
  {
    id: 'A6', kode: 'A.6',
    judul: 'Buku Agenda Surat Keluar',
    shortName: 'Surat Keluar',
    cols: [
      { k: 'no',     l: 'No',      w: 40,  ro: true },
      { k: 'nomor',  l: 'Nomor',   type: 'mono' },
      { k: 'tanggal',l: 'Tanggal', type: 'date' },
      { k: 'uraian', l: 'Uraian' },
    ],
  },
]

export const YEARS = ['2023', '2024', '2025', '2026', '2027']
export const DEFAULT_YEAR = '2026'
