// ─────────────────────────────────────────────
// BuRegDes Next — Book Definitions
// Struktur RTDB: data/{year}/tableData/{bookId}
// ─────────────────────────────────────────────

import { BookDef } from '@/types'

export const BOOKS: BookDef[] = [
  {
    id: 'A1', kode: 'A.1', judul: 'Buku Peraturan Desa',
    cols: [
      { k: 'no',             l: 'No',                                          w: '5%',   ro: true },
      { k: 'noDitetapkan',   l: 'Nomor Ditetapkan',                            w: '15%' },
      { k: 'tglDitetapkan',  l: 'Tanggal Ditetapkan',                          w: '14%' },
      { k: 'tentang',        l: 'Tentang',                                     w: '300px' },
      { k: 'noDiundangkan',  l: 'Nomor Diundangkan dalam Lembaran Desa',       w: '13%' },
      { k: 'tglDiundangkan', l: 'Tanggal Diundangkan dalam Lembaran Desa',     w: '13%' },
      { k: 'ket',            l: 'Ket.',                                        w: '7%' },
    ],
  },
  {
    id: 'A2', kode: 'A.2', judul: 'Buku Peraturan Kepala Desa',
    cols: [
      { k: 'no',             l: 'No',                                          w: '5%',   ro: true },
      { k: 'noDitetapkan',   l: 'Nomor Ditetapkan',                            w: '15%' },
      { k: 'tglDitetapkan',  l: 'Tanggal Ditetapkan',                          w: '14%' },
      { k: 'tentang',        l: 'Tentang',                                     w: '300px' },
      { k: 'noDiundangkan',  l: 'Nomor Diundangkan dalam Berita Desa',         w: '13%' },
      { k: 'tglDiundangkan', l: 'Tanggal Diundangkan dalam Berita Desa',       w: '13%' },
      { k: 'ket',            l: 'Ket.',                                        w: '7%' },
    ],
  },
  {
    id: 'A3', kode: 'A.3', judul: 'Buku Peraturan Bersama Kepala Desa',
    cols: [
      { k: 'no',             l: 'No',                                          w: '5%',   ro: true },
      { k: 'noDitetapkan',   l: 'Nomor Ditetapkan',                            w: '15%' },
      { k: 'tglDitetapkan',  l: 'Tanggal Ditetapkan',                          w: '14%' },
      { k: 'tentang',        l: 'Tentang',                                     w: '300px' },
      { k: 'noDiundangkan',  l: 'Nomor Diundangkan dalam Berita Desa',         w: '13%' },
      { k: 'tglDiundangkan', l: 'Tanggal Diundangkan dalam Berita Desa',       w: '13%' },
      { k: 'ket',            l: 'Ket.',                                        w: '7%' },
    ],
  },
  {
    id: 'A4', kode: 'A.4', judul: 'Buku Keputusan Kepala Desa',
    cols: [
      { k: 'no',            l: 'No',                 w: '8%',   ro: true },
      { k: 'noDitetapkan',  l: 'Nomor Ditetapkan',  w: '15%' },
      { k: 'tglDitetapkan', l: 'Tanggal Ditetapkan',w: '14%' },
      { k: 'tentang',       l: 'Tentang',            w: '300px' },
      { k: 'ket',           l: 'Ket.',               w: '7%' },
    ],
  },
  {
    id: 'A5', kode: 'A.5', judul: 'Buku Agenda Surat Masuk', group: 'Surat Masuk',
    cols: [
      { k: 'no',       l: 'No',       w: '8%',   ro: true },
      { k: 'nomor',    l: 'Nomor',    w: '16%' },
      { k: 'tanggal',  l: 'Tanggal', w: '16%' },
      { k: 'pengirim', l: 'Pengirim',w: '20%' },
      { k: 'uraian',   l: 'Uraian',  w: '300px' },
      { k: 'ket',      l: 'Ket.',    w: '7%' },
    ],
  },
  {
    id: 'A6', kode: 'A.6', judul: 'Buku Agenda Surat Keluar', group: 'Surat Keluar',
    cols: [
      { k: 'no',      l: 'No',      w: '8%',   ro: true },
      { k: 'nomor',   l: 'Nomor',   w: '16%' },
      { k: 'tanggal', l: 'Tanggal', w: '16%' },
      { k: 'kepada',  l: 'Kepada',  w: '20%' },
      { k: 'uraian',  l: 'Uraian',  w: '300px' },
      { k: 'ket',     l: 'Ket.',    w: '7%' },
    ],
  },
]

export const YEARS = ['2021','2022','2023','2024','2025','2026','2027','2028','2029']

export const DEFAULT_ROWS = 10
