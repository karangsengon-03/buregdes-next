'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — PrintModal (Session 7)
// Bottom-sheet: pilih scope cetak, preview info,
// lalu inject print area + trigger window.print()
// ─────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { Printer, X, FileText, Filter, Check, AlertTriangle } from 'lucide-react'
import { useDesaInfo } from '@/hooks/useDesaInfo'
import { usePrint } from '@/hooks/usePrint'
import type { BookDef, BookRow } from '@/types'

interface PrintModalProps {
  open:      boolean
  book:      BookDef
  rows:      BookRow[]           // semua baris
  filtered:  BookRow[]           // baris hasil filter (bisa sama dengan rows)
  year:      string | number
  isFiltering: boolean           // apakah search sedang aktif
  onClose:   () => void
}

export function PrintModal({
  open,
  book,
  rows,
  filtered,
  year,
  isFiltering,
  onClose,
}: PrintModalProps) {
  const { desaInfo }    = useDesaInfo()
  const { triggerPrint } = usePrint()

  type Scope = 'all' | 'filtered'
  const [scope, setScope] = useState<Scope>('all')

  // Reset scope ke 'all' setiap buka modal
  useEffect(() => {
    if (open) setScope(isFiltering ? 'filtered' : 'all')
  }, [open, isFiltering])

  // Baris yang akan dicetak sesuai scope
  const targetRows = scope === 'filtered' ? filtered : rows

  // ── Build print HTML ──────────────────────
  const buildPrintContent = useCallback(() => {
    const desaNama    = desaInfo.desa       || '—'
    const kecamatan   = desaInfo.kecamatan  || '—'
    const kabupaten   = desaInfo.kabupaten  || '—'
    const provinsi    = desaInfo.provinsi   || '—'
    const tahunDesa   = desaInfo.tahun      || year

    // Header kolom
    const headerCells = book.cols
      .map(col => `<th>${col.l}</th>`)
      .join('')

    // Baris data
    const bodyRows = targetRows.map((row, idx) => {
      const cells = book.cols.map(col => {
        const val = row[col.k]
        const display = (val !== undefined && val !== null && val !== '')
          ? String(val) : ''
        return `<td class="${col.type === 'mono' ? 'mono' : ''}">${display}</td>`
      }).join('')
      return `<tr class="${idx % 2 === 1 ? 'alt' : ''}">${cells}</tr>`
    }).join('')

    return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${book.kode} — ${book.judul} TA ${year}</title>
  <style>
    /* ── Reset & base ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif;
      font-size: 10pt;
      color: #111;
      background: #fff;
      padding: 16mm 16mm 12mm;
    }

    /* ── Kop surat ── */
    .kop {
      text-align: center;
      border-bottom: 3px double #111;
      padding-bottom: 8pt;
      margin-bottom: 12pt;
    }
    .kop .instansi {
      font-size: 9pt;
      color: #444;
      margin-bottom: 2pt;
    }
    .kop .judul-buku {
      font-size: 13pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .kop .sub-judul {
      font-size: 9pt;
      color: #555;
      margin-top: 2pt;
    }

    /* ── Meta info ── */
    .meta {
      display: flex;
      gap: 24pt;
      margin-bottom: 10pt;
      font-size: 9pt;
      color: #333;
    }
    .meta-item { display: flex; flex-direction: column; gap: 1pt; }
    .meta-label { font-weight: 700; font-size: 7.5pt; text-transform: uppercase;
                  letter-spacing: 0.06em; color: #666; }
    .meta-value { font-weight: 600; }

    /* ── Tabel ── */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      page-break-inside: auto;
    }
    thead { display: table-header-group; }
    th {
      background: #1a2e4a;
      color: #fff;
      padding: 6pt 8pt;
      text-align: left;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: 1px solid #0f1e30;
    }
    td {
      padding: 5pt 8pt;
      border: 1px solid #cbd5e1;
      vertical-align: top;
      word-break: break-word;
      line-height: 1.4;
    }
    tr.alt td { background: #f8fafc; }
    td.mono {
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      font-size: 8.5pt;
    }

    /* ── Footer ── */
    .footer {
      margin-top: 10pt;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 8pt;
      color: #666;
      border-top: 1px solid #cbd5e1;
      padding-top: 6pt;
    }
    .ttd-area {
      text-align: center;
      min-width: 100pt;
    }
    .ttd-area .ttd-label { margin-bottom: 42pt; font-weight: 600; color: #333; }
    .ttd-area .ttd-name  { border-top: 1px solid #333; padding-top: 3pt;
                           font-weight: 700; font-size: 9pt; color: #111; }
    .ttd-area .ttd-nip   { font-size: 8pt; color: #555; }

    /* ── Print-specific ── */
    @media print {
      body { padding: 0; }
      @page { margin: 16mm 16mm 12mm; size: A4 portrait; }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; }
      .no-print { display: none !important; }
    }

    /* ── Watermark scope info ── */
    .badge-scope {
      display: inline-block;
      padding: 1pt 6pt;
      border-radius: 4pt;
      font-size: 7.5pt;
      font-weight: 700;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      margin-left: 6pt;
      vertical-align: middle;
    }
  </style>
</head>
<body>

  <!-- Kop surat -->
  <div class="kop">
    <div class="instansi">
      Desa ${desaNama}, Kec. ${kecamatan}, Kab. ${kabupaten}, Prov. ${provinsi}
    </div>
    <div class="judul-buku">${book.judul}</div>
    <div class="sub-judul">
      ${book.kode} &mdash; Tahun Anggaran ${tahunDesa}
      ${scope === 'filtered' ? `<span class="badge-scope">Data Terfilter</span>` : ''}
    </div>
  </div>

  <!-- Meta info -->
  <div class="meta">
    <div class="meta-item">
      <span class="meta-label">Desa</span>
      <span class="meta-value">${desaNama}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Kecamatan</span>
      <span class="meta-value">${kecamatan}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Kabupaten</span>
      <span class="meta-value">${kabupaten}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Jumlah Data</span>
      <span class="meta-value">${targetRows.length} baris</span>
    </div>
  </div>

  <!-- Tabel -->
  <table>
    <thead>
      <tr>${headerCells}</tr>
    </thead>
    <tbody>${bodyRows}</tbody>
  </table>

  <!-- Footer -->
  <div class="footer">
    <div>
      Dicetak via BuRegDes Next &bull;
      ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
    </div>
    <div class="ttd-area">
      <div class="ttd-label">Mengetahui,<br/>Kepala Desa ${desaNama}</div>
      <div class="ttd-name">_____________________</div>
      <div class="ttd-nip">NIP. ___________________</div>
    </div>
  </div>

</body>
</html>`
  }, [book, targetRows, desaInfo, scope, year])

  // ── Handle cetak ──────────────────────────
  const handlePrint = useCallback(() => {
    const html = buildPrintContent()

    // Buka window print baru agar tidak mengganggu app utama
    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) {
      // Fallback jika popup diblokir: inject ke iframe tersembunyi
      const iframe = document.createElement('iframe')
      iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none'
      document.body.appendChild(iframe)
      iframe.contentDocument!.open()
      iframe.contentDocument!.write(html)
      iframe.contentDocument!.close()
      iframe.contentWindow!.focus()
      iframe.contentWindow!.print()
      setTimeout(() => document.body.removeChild(iframe), 2000)
      onClose()
      return
    }

    win.document.open()
    win.document.write(html)
    win.document.close()
    win.focus()

    // Tunggu konten render lalu auto-print
    win.onload = () => {
      win.print()
      // Tutup tab preview setelah print dialog selesai
      win.onafterprint = () => win.close()
    }

    onClose()
  }, [buildPrintContent, onClose])

  if (!open) return null

  // ── UI ────────────────────────────────────
  const scopeOptions: { value: Scope; label: string; desc: string; count: number; icon: React.ReactNode }[] = [
    {
      value: 'all',
      label: 'Semua Baris',
      desc: 'Cetak seluruh data buku ini',
      count: rows.length,
      icon: <FileText size={16} />,
    },
    ...(isFiltering
      ? [{
          value: 'filtered' as Scope,
          label: 'Hasil Filter Saja',
          desc: 'Hanya baris yang sesuai pencarian',
          count: filtered.length,
          icon: <Filter size={16} />,
        }]
      : []),
  ]

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 40,
          animation: 'fadeIn 180ms ease',
        }}
      />

      {/* Bottom-sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          background: 'var(--bg-elevated)',
          borderRadius: '18px 18px 0 0',
          padding: '0 0 env(safe-area-inset-bottom)',
          zIndex: 50,
          animation: 'slideUp 220ms ease',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 16px 12px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(59,130,246,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Printer size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Cetak Buku
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                {book.kode} &middot; TA {year}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none',
              background: 'var(--bg-card)',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px' }}>

          {/* Scope selector */}
          <p style={{
            fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            margin: '0 0 10px',
          }}>
            Data yang dicetak
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {scopeOptions.map(opt => {
              const isActive = scope === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setScope(opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                    border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                    background: isActive ? 'var(--accent-subtle)' : 'var(--bg-card)',
                    transition: 'all 150ms',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    background: isActive ? 'var(--accent)' : 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                  }}>
                    {opt.icon}
                  </div>

                  {/* Label + desc */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13, fontWeight: 700,
                      color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                      margin: 0,
                    }}>
                      {opt.label}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                      {opt.desc}
                    </p>
                  </div>

                  {/* Count badge */}
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                    padding: '2px 8px', borderRadius: 6,
                    background: isActive ? 'rgba(59,130,246,0.18)' : 'var(--bg-elevated)',
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    flexShrink: 0,
                  }}>
                    {opt.count}
                  </span>

                  {/* Checkmark */}
                  {isActive && (
                    <Check size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Info desa preview */}
          {desaInfo.desa && (
            <div style={{
              padding: '10px 12px', borderRadius: 10,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              marginBottom: 16,
            }}>
              <p style={{
                fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px',
              }}>
                Kop Surat
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                Desa {desaInfo.desa}, Kec. {desaInfo.kecamatan}
                <br />
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  Kab. {desaInfo.kabupaten} · Prov. {desaInfo.provinsi}
                </span>
              </p>
            </div>
          )}

          {!desaInfo.desa && (
            <div style={{
              padding: '10px 12px', borderRadius: 10,
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.25)',
              marginBottom: 16,
            }}>
              <p style={{ fontSize: 12, color: 'var(--warning)', margin: 0, lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                Info Desa belum diisi — kop surat akan kosong.
                <br />
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  Lengkapi di menu Pengaturan.
                </span>
              </p>
            </div>
          )}

          {/* Tombol cetak */}
          <button
            onClick={handlePrint}
            disabled={targetRows.length === 0}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              border: 'none',
              background: targetRows.length === 0 ? 'var(--border)' : 'var(--accent)',
              color: targetRows.length === 0 ? 'var(--text-muted)' : '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: targetRows.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 150ms',
            }}
            onMouseEnter={e => {
              if (targetRows.length > 0)
                e.currentTarget.style.background = 'var(--accent-hover)'
            }}
            onMouseLeave={e => {
              if (targetRows.length > 0)
                e.currentTarget.style.background = 'var(--accent)'
            }}
          >
            <Printer size={16} />
            {targetRows.length === 0
              ? 'Tidak ada data untuk dicetak'
              : `Cetak ${targetRows.length} Baris`
            }
          </button>

          <p style={{
            fontSize: 10, color: 'var(--text-muted)', textAlign: 'center',
            margin: '10px 0 0',
            lineHeight: 1.5,
          }}>
            Akan membuka tab baru dengan tampilan siap cetak (A4 portrait)
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </>
  )
}
