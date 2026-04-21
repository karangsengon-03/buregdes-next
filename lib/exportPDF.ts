// ─────────────────────────────────────────────
// BuRegDes Next — lib/exportPDF.ts
// Export buku register ke PDF landscape A4
// Menggunakan jsPDF + jspdf-autotable
// ─────────────────────────────────────────────

import type { BookDef, BookRow, DesaInfo } from '@/types'

export interface ExportPDFOptions {
  book:     BookDef
  rows:     BookRow[]
  year:     string
  desaInfo: DesaInfo
}

// Format tanggal yyyy-mm-dd → dd/mm/yyyy
function fmtDate(val: string | number | undefined): string {
  if (!val) return ''
  const s = String(val)
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-')
    return `${d}/${m}/${y}`
  }
  return s
}

export async function exportPDF({ book, rows, year, desaInfo }: ExportPDFOptions): Promise<void> {
  // Dynamic import agar tidak masuk bundle saat SSR
  const { jsPDF }     = await import('jspdf')
  const autoTable      = (await import('jspdf-autotable')).default

  // ── Inisiasi dokumen landscape A4 ──────────
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()   // 297mm
  const marginL = 14
  const marginR = 14
  const contentW = pageW - marginL - marginR

  // ── Header teks ─────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(`${book.kode} — ${book.judul}`, pageW / 2, 16, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  const desaLine = [
    desaInfo.desa       ? `Desa ${desaInfo.desa}`           : '',
    desaInfo.kecamatan  ? `Kec. ${desaInfo.kecamatan}`      : '',
    desaInfo.kabupaten  ? `Kab. ${desaInfo.kabupaten}`      : '',
    desaInfo.provinsi   ? `Prov. ${desaInfo.provinsi}`      : '',
  ].filter(Boolean).join('  ·  ')

  doc.text(desaLine || 'Desa (belum diisi)', pageW / 2, 22, { align: 'center' })
  doc.text(`Tahun Anggaran ${year}`, pageW / 2, 27, { align: 'center' })

  // ── Garis pemisah header ─────────────────────
  doc.setDrawColor(180, 180, 200)
  doc.setLineWidth(0.3)
  doc.line(marginL, 30, pageW - marginR, 30)

  // ── Susun data tabel ─────────────────────────
  const headers = book.cols.map((c) => c.l)

  const bodyData: (string | number)[][] = rows.length === 0
    ? [book.cols.map(() => '')]
    : rows.map((row) =>
        book.cols.map((col) => {
          const val = row[col.k]
          if (col.type === 'date')   return fmtDate(val)
          if (col.type === 'number') return val !== undefined ? Number(val) : ''
          return val !== undefined ? String(val) : ''
        })
      )

  // ── Hitung lebar kolom proporsional ──────────
  // Konversi col.w (px) → mm proporsional terhadap contentW
  const totalPx = book.cols.reduce((sum, c) => sum + (c.w ?? (c.type === 'text' ? 200 : 100)), 0)
  const colWidths = book.cols.map((c) => {
    const px = c.w ?? (c.type === 'text' ? 200 : 100)
    return (px / totalPx) * contentW
  })

  // ── autoTable ────────────────────────────────
  autoTable(doc, {
    startY: 33,
    head:   [headers],
    body:   bodyData,
    margin: { left: marginL, right: marginR },
    tableWidth: contentW,
    columnStyles: colWidths.reduce<Record<number, { cellWidth: number }>>((acc, w, i) => {
      acc[i] = { cellWidth: w }
      return acc
    }, {}),
    headStyles: {
      fillColor:  [27, 43, 62],    // --bg-card approx
      textColor:  [241, 245, 249], // --text-primary
      fontSize:   8,
      fontStyle:  'bold',
      halign:     'center',
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize:    8,
      textColor:   [50, 60, 80],
      cellPadding: 2.5,
      minCellHeight: 7,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 252],
    },
    didParseCell(data) {
      // Rata kanan untuk kolom number
      const col = book.cols[data.column.index]
      if (col?.type === 'number' && data.section === 'body') {
        data.cell.styles.halign = 'right'
      }
    },
    // Footer: nomor halaman
    didDrawPage(data) {
      const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages()
      const currentPage = data.pageNumber
      doc.setFontSize(7.5)
      doc.setTextColor(140, 140, 160)
      doc.text(
        `Halaman ${currentPage} / ${pageCount}`,
        pageW / 2,
        doc.internal.pageSize.getHeight() - 6,
        { align: 'center' }
      )
      const now = new Date()
      const tgl = `${now.getDate().toString().padStart(2,'0')}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getFullYear()}`
      doc.text(`Dicetak: ${tgl}`, marginL, doc.internal.pageSize.getHeight() - 6)
    },
  })

  // ── Nama file & download ─────────────────────
  const desaNama = desaInfo.desa
    ? desaInfo.desa.replace(/\s+/g, '_').toLowerCase()
    : 'desa'
  const fileName = `BuRegDes_${desaNama}_${book.kode.replace(/\./g, '')}_TA${year}.pdf`

  doc.save(fileName)
}
