// ─────────────────────────────────────────────
// BuRegDes Next — lib/exportExcel.ts
// Export tabel buku register ke file .xlsx
// Menggunakan SheetJS (xlsx) — install: npm i xlsx
// ─────────────────────────────────────────────

import * as XLSX from 'xlsx'
import type { BookDef, BookRow, DesaInfo } from '@/types'

// Format tanggal yyyy-mm-dd → dd/mm/yyyy untuk display Excel
function fmtDate(val: string | number | undefined): string {
  if (!val) return ''
  const s = String(val)
  // Jika format ISO yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-')
    return `${d}/${m}/${y}`
  }
  return s
}

export interface ExportOptions {
  book: BookDef
  rows: BookRow[]
  desaInfo: DesaInfo
  year: string
}

export function exportExcel({ book, rows, desaInfo, year }: ExportOptions): void {
  const wb = XLSX.utils.book_new()

  // ── Susun data sheet ─────────────────────────
  const sheetData: (string | number)[][] = []

  // Baris 1: Judul buku
  sheetData.push([`${book.kode} — ${book.judul}`])

  // Baris 2: Info desa
  const desaLine = [
    desaInfo.desa ? `Desa ${desaInfo.desa}` : '',
    desaInfo.kecamatan ? `Kec. ${desaInfo.kecamatan}` : '',
    desaInfo.kabupaten ? `Kab. ${desaInfo.kabupaten}` : '',
    desaInfo.provinsi ? `Prov. ${desaInfo.provinsi}` : '',
  ]
    .filter(Boolean)
    .join(' · ')

  sheetData.push([desaLine || 'Desa (belum diisi)'])

  // Baris 3: Tahun anggaran
  sheetData.push([`Tahun Anggaran ${year}`])

  // Baris 4: Kosong
  sheetData.push([''])

  // Baris 5: Header kolom
  const headerRow = book.cols.map((c) => c.l)
  sheetData.push(headerRow)

  // Baris data
  if (rows.length === 0) {
    // Baris kosong placeholder
    sheetData.push(book.cols.map(() => ''))
  } else {
    rows.forEach((row) => {
      const dataRow = book.cols.map((col) => {
        const val = row[col.k]
        if (col.type === 'date') return fmtDate(val)
        if (col.type === 'number') return val !== undefined ? Number(val) : ''
        return val !== undefined ? String(val) : ''
      })
      sheetData.push(dataRow)
    })
  }

  // Baris footer: tanggal cetak
  sheetData.push([''])
  const now = new Date()
  const tglCetak = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${now.getFullYear()}`
  sheetData.push([`Dicetak: ${tglCetak}`])

  // ── Buat worksheet ───────────────────────────
  const ws = XLSX.utils.aoa_to_sheet(sheetData)

  const colCount = book.cols.length
  const headerRowIndex = 4 // 0-based, baris ke-5

  // ── Column widths ────────────────────────────
  ws['!cols'] = book.cols.map((col) => ({
    wch: col.w
      ? Math.round(col.w / 7)        // konversi px → karakter approx
      : col.type === 'text'
      ? 30
      : 16,
  }))

  // ── Merge cells untuk baris judul/desa/tahun ─
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } }, // judul buku
    { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } }, // info desa
    { s: { r: 2, c: 0 }, e: { r: 2, c: colCount - 1 } }, // tahun
    // footer
    {
      s: { r: sheetData.length - 1, c: 0 },
      e: { r: sheetData.length - 1, c: colCount - 1 },
    },
  ]

  // ── Style cells via !ref (SheetJS CE tidak support rich styling) ──
  // Kita set tipe data number untuk kolom number
  rows.forEach((row, rowIdx) => {
    book.cols.forEach((col, colIdx) => {
      if (col.type === 'number') {
        const cellAddr = XLSX.utils.encode_cell({
          r: headerRowIndex + 1 + rowIdx,
          c: colIdx,
        })
        if (ws[cellAddr]) {
          ws[cellAddr].t = 'n'
        }
      }
    })
  })

  // ── Nama sheet: kode buku ────────────────────
  const sheetName = book.kode.replace(/\./g, '-') // A.1 → A-1 (Excel restriction)
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // ── Nama file ────────────────────────────────
  const desaNama = desaInfo.desa
    ? desaInfo.desa.replace(/\s+/g, '_').toLowerCase()
    : 'desa'
  const fileName = `BuRegDes_${desaNama}_${book.kode.replace(/\./g, '')}_TA${year}.xlsx`

  // ── Download ─────────────────────────────────
  XLSX.writeFile(wb, fileName)
}

// ─────────────────────────────────────────────
// Export SEMUA buku (A1–A6) dalam 1 file — 6 sheet
// ─────────────────────────────────────────────

export interface ExportAllOptions {
  allRows:  Record<string, BookRow[]>   // key: bookId ('A1'–'A6')
  books:    BookDef[]                   // array of all BookDef (BOOKS constant)
  desaInfo: DesaInfo
  year:     string
}

export function exportAllBooks({ allRows, books, desaInfo, year }: ExportAllOptions): void {
  const wb = XLSX.utils.book_new()

  const desaLine = [
    desaInfo.desa       ? `Desa ${desaInfo.desa}`      : '',
    desaInfo.kecamatan  ? `Kec. ${desaInfo.kecamatan}` : '',
    desaInfo.kabupaten  ? `Kab. ${desaInfo.kabupaten}` : '',
    desaInfo.provinsi   ? `Prov. ${desaInfo.provinsi}` : '',
  ].filter(Boolean).join(' · ')

  for (const book of books) {
    const rows = allRows[book.id] ?? []
    const sheetData: (string | number)[][] = []

    // Baris 1–4: meta
    sheetData.push([`${book.kode} — ${book.judul}`])
    sheetData.push([desaLine || 'Desa (belum diisi)'])
    sheetData.push([`Tahun Anggaran ${year}`])
    sheetData.push([''])

    // Header kolom
    sheetData.push(book.cols.map((c) => c.l))

    // Data rows
    if (rows.length === 0) {
      sheetData.push(book.cols.map(() => ''))
    } else {
      rows.forEach((row) => {
        sheetData.push(
          book.cols.map((col) => {
            const val = row[col.k]
            if (col.type === 'date')   return fmtDate(val)
            if (col.type === 'number') return val !== undefined ? Number(val) : ''
            return val !== undefined ? String(val) : ''
          })
        )
      })
    }

    // Footer
    sheetData.push([''])
    const now = new Date()
    const tgl = `${now.getDate().toString().padStart(2,'0')}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getFullYear()}`
    sheetData.push([`Dicetak: ${tgl}`])

    const ws = XLSX.utils.aoa_to_sheet(sheetData)
    const colCount = book.cols.length

    ws['!cols'] = book.cols.map((col) => ({
      wch: col.w ? Math.round(col.w / 7) : col.type === 'text' ? 30 : 16,
    }))

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: colCount - 1 } },
      { s: { r: sheetData.length - 1, c: 0 }, e: { r: sheetData.length - 1, c: colCount - 1 } },
    ]

    // Set tipe numerik
    rows.forEach((row, rowIdx) => {
      book.cols.forEach((col, colIdx) => {
        if (col.type === 'number') {
          const cellAddr = XLSX.utils.encode_cell({ r: 5 + rowIdx, c: colIdx })
          if (ws[cellAddr]) ws[cellAddr].t = 'n'
        }
      })
    })

    const sheetName = book.kode.replace(/\./g, '-') // A.1 → A-1
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  }

  // ── Nama file ────────────────────────────────
  const desaNama = desaInfo.desa
    ? desaInfo.desa.replace(/\s+/g, '_').toLowerCase()
    : 'desa'
  const fileName = `BuRegDes_${desaNama}_SemuaBuku_TA${year}.xlsx`

  XLSX.writeFile(wb, fileName)
}
