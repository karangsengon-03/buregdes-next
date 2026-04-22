# BuRegDes Next — Session 14 Briefing

**Project:** BuRegDes Next — Buku Register Administrasi Desa  
**Repo:** karangsengon-03/buregdes-next  
**Stack:** Next.js · TypeScript · Tailwind CSS · lucide-react · Firebase v10  
**Deploy:** Vercel (auto dari GitHub push)

---

## Status Setelah Session 13

`npx tsc --noEmit` → 0 error  
`npm run build` → ✅ (perlu diverifikasi)

### Yang selesai di Session 13:

| File | Perubahan |
|------|-----------|
| `app/app/layout.tsx` | Hapus BottomNav, `main` overflow:hidden agar tabel scroll terkontrol |
| `components/layout/Sidebar.tsx` | + Year selector dropdown, + Settings link, + versi app di header |
| `components/layout/Header.tsx` | Hapus year selector (pindah ke sidebar), lebih bersih |
| `app/globals.css` | Tambah `--data-text` dan `--data-mono` vars (kontras lansia, dark+light) |
| `app/app/page.tsx` | Data cell pakai CSS vars `--data-text`/`--data-mono` bukan hardcoded amber |
| `components/ui/Toast.tsx` | Posisi bottom dari 72px → 16px (tidak ada BottomNav) |
| `constants/books.ts` | A.5: tambah kolom Dari + Ket. / A.6: tambah kolom Kepada + Ket. |
| `types/index.ts` | Tambah ColGroup interface + colGroups?: di BookDef |

### Arsitektur Navigasi Setelah Session 13:
```
Header (48px)       — Hamburger | Kode Buku + Judul | Koneksi | Tema
Sidebar (hamburger) — BuRegDes v1.0.0 | Year Selector | A1-A6 books | Pengaturan | User | Logout
Main (flex:1)       — overflow:hidden → children scroll sendiri (tabel H+V, settings V)
[TIDAK ADA BottomNav]
```

### Warna teks data cell:
```css
Dark mode: --data-text: #F5A623  (amber warm)
           --data-mono: #FBBF24  (amber terang, untuk nomor/kode)
Light mode: --data-text: #1A3C5E (navy gelap)
            --data-mono: #1D4ED8 (biru gelap)
```

---

## Fix yang Sudah Ada (Jangan Diulang)

| # | File | Fix |
|---|------|-----|
| 1–17 | (session 1–11) | Lihat README_SESSION11.md |
| 18 | `app/app/page.tsx` | Format tabel 2-baris header (nomor kolom), sub-header 2 baris |
| 19 | `constants/books.ts` | Kolom Kepada/Dari/Ket di A5-A6 |
| 20 | `types/index.ts` | ColGroup + colGroups optional |
| 21 | `app/app/layout.tsx` | Hapus BottomNav, main overflow:hidden |
| 22 | `components/layout/Sidebar.tsx` | Year selector + Settings link + versi |
| 23 | `components/layout/Header.tsx` | Hapus year selector |
| 24 | `app/globals.css` | --data-text / --data-mono CSS vars |
| 25 | `components/ui/Toast.tsx` | bottom: 16px |

---

## RTDB Struktur
```
data/{year}/tableData/{bookId}  → ARRAY of rows
  bookId: 'A1','A2','A3','A4','A5','A6' (TANPA titik)
desaInfo  → ROOT level
history, masterHash, sheetLocks
```

## Jangan Ubah:
- Lock system (useLock, LockModal)
- Export system (exportExcel, exportPDF, backupRestore, ExportModal)
- RTDB paths
- bookId format 'A1'–'A6' tanpa titik
- Hash function di useLock
