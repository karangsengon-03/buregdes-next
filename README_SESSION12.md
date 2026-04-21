# BuRegDes Next — Session 12 Briefing

**Project:** BuRegDes Next — Buku Register Administrasi Desa
**Repo:** karangsengon-03/buregdes-next
**Stack:** Next.js 16.2.4 App Router · TypeScript · Tailwind CSS · lucide-react · Firebase v10
**Font:** Plus Jakarta Sans + JetBrains Mono
**Target:** Mobile-first · Dark mode default
**Deploy:** Vercel (auto dari GitHub push)

---

## Status Setelah Sesi 11

`npx tsc --noEmit` → 0 error
`npm run build` → ✅ sukses 0 error

### Yang selesai di Sesi 11 — Completion Sprint:

| File | Keterangan |
|------|------------|
| `app/app/page.tsx` | Ditulis ulang — Card View lengkap + Table/Card toggle + CardEditModal (bottom sheet) + viewMode persist localStorage |
| `public/sw.js` | Baru — Service Worker network-first + fallback cache, PWA offline support |
| `app/layout.tsx` | Tambah SW registration script inline |
| `components/ui/LockModal.tsx` | Tambah mode `'change-master'` — ganti master password (verifikasi lama → set baru → konfirmasi) |
| `app/app/settings/page.tsx` | `openMasterSetup` fix: pakai `'change-master'` jika sudah punya master, `'master'` jika belum |
| `AGENTS.md` | Dihapus (file debug, bukan bagian app) |
| `CLAUDE.md` | Dihapus (file debug, bukan bagian app) |

### Semua 4 Perbedaan dari Rencana Awal Sudah Diselesaikan:
- ✅ Card View (fitur yang hilang dari versi lama)
- ✅ Service Worker / PWA offline
- ✅ Ganti Master Password yang benar (flow verifikasi lama)
- ✅ AGENTS.md + CLAUDE.md dihapus

---

## Fitur Lengkap Apps (Semua Sudah Ada)

| Fitur | Status | Session |
|-------|--------|---------|
| Login premium mobile-first | ✅ | S1 |
| Sidebar + Header + BottomNav | ✅ | S2 |
| 6 Buku Register (A1–A6) | ✅ | S2–3 |
| Inline edit tabel + RTDB sync | ✅ | S3 |
| **Card View + toggle Table/Card** | ✅ | **S11** |
| Search / filter realtime | ✅ | S6 |
| Lock system (PIN + row lock) | ✅ | S9 |
| Set / Ganti PIN | ✅ | S9 |
| Set Master Password | ✅ | S9 |
| **Ganti Master Password (verifikasi lama)** | ✅ | **S11** |
| Riwayat edit per buku | ✅ | S8 |
| Edit Info Desa | ✅ | S7 |
| Presence (siapa online) | ✅ | S8 |
| Multi-year selector | ✅ | S7 |
| Dark / Light theme | ✅ | S6 |
| Export Excel (per buku + semua) | ✅ | S10 |
| Export PDF (landscape A4) | ✅ | S10 |
| Print | ✅ | S7 |
| Backup / Restore JSON | ✅ | S10 |
| PWA manifest + icons | ✅ | S5 |
| **Service Worker / PWA offline** | ✅ | **S11** |
| Deploy Vercel auto dari GitHub | ✅ | S1 |

---

## RTDB Struktur (Referensi — Jangan Diubah)

```
Root keys: data, desaInfo, history, masterHash, sheetLocks, tableData (legacy)

data/{year}/tableData/{bookId}  → ARRAY of rows
  bookId: 'A1','A2','A3','A4','A5','A6' (TANPA titik)

desaInfo  → ROOT level
  { desa, kecamatan, kabupaten, provinsi, tahun }

history/{bookId}/{ri}/{pushId}  → ROOT level

presence/{uid}  → ROOT level

masterHash  → ROOT level (string hash)

sheetLocks/{year}/{bookId}  → ROOT level
```

---

## Fix yang Sudah Ada (Jangan Diulang)

| # | File | Fix |
|---|------|-----|
| 1 | `lib/firebase.ts` | `export const database = db` |
| 2 | `constants/books.ts` | `id: 'A1'` tanpa titik |
| 3 | `package.json` | `"xlsx": "^0.18.5"`, `"jspdf": "^2.5.1"`, `"jspdf-autotable": "^3.8.2"` |
| 4 | `hooks/useDesaInfo.ts` | Path `'desaInfo'` root level |
| 5 | `hooks/useBookData.ts` | Array RTDB pattern |
| 6 | `hooks/useSettings.ts` | `availableYears: string[]` |
| 7 | `lib/exportExcel.ts` | `exportExcel` + `exportAllBooks` |
| 8 | `types/index.ts` | `HighlightPart`, `ColDef`, `BookRow.no: string\|number` |
| 9 | `hooks/usePresence.ts` | Firebase v10 unsub pattern |
| 10 | `hooks/useHistory.ts` | Firebase v10 unsub pattern |
| 11 | `hooks/useLock.ts` | Lock system — S9 |
| 12 | `components/ui/LockModal.tsx` | + mode `'change-master'` — S11 |
| 13 | `lib/exportPDF.ts` | PDF export — S10 |
| 14 | `lib/backupRestore.ts` | Backup/Restore JSON — S10 |
| 15 | `app/app/page.tsx` | Card View + toggle + CardEditModal — S11 |
| 16 | `public/sw.js` | Service Worker network-first — S11 |
| 17 | `app/layout.tsx` | SW registration + theme init |

---

## Hooks API Final (Referensi)

```typescript
useApp()
  → { activeBook, setActiveBook, activeYear: string, setActiveYear, isOnline, showToast }

useBookData(bookId: string, year: string)
  → { rows, status, error, addRow, updateCell, deleteRow }

useLock(activeYear: string)
  → { isGlobalLocked, hasPin, hasMasterHash, lockedRows, unlockedSession,
      setPin, unlock, lock, toggleRowLock, isRowLocked, verifyMaster, setMasterHash }

useDesaInfo()
  → { desaInfo, status, updateDesaInfo }

useSearch(rows, cols)
  → { query, setQuery, clearQuery, filteredResults, totalRows, isFiltering, highlightText }

useSettings()
  → { desaInfo, desaStatus, updateDesaInfo, isDesaComplete,
      activeYear: string, availableYears: string[], setActiveYear,
      isOnline, showToast }

usePrint()
  → { triggerPrint(options?) }

usePresence()
  → { onlineUsers, myUid, count }

useHistory(bookId: string)
  → { entries, status, logEdit }
```

---

## Component Props Final (Referensi)

```typescript
ExportModal:    { open, book: BookDef, rows: BookRow[], year: string, onClose }
PrintModal:     { open, book, rows, filtered, year, isFiltering, onClose }
LockModal:      { open, mode: LockModalMode, hasMasterHash, onClose, onSetPin, onUnlock, onVerifyMaster, onSetMaster }
              // mode: 'set' | 'unlock' | 'change' | 'master' | 'change-master'
HistoryDrawer:  { open, entries, status, bookName, onClose }
PresenceBadge:  { users, myUid }
AddRowModal:    { open, cols, onClose, onAdd }
ConfirmDialog:  { open, title, message, confirmLabel, onConfirm, onCancel, loading }
SearchBar:      { query, onQueryChange, onClear, resultCount, totalCount, isFiltering }
```

---

## Design Tokens (Referensi)

```css
--bg-app:        #0D1B2A
--bg-card:       #1B2B3E
--bg-elevated:   #243447
--bg-input:      #1B2B3E
--accent:        #3B82F6
--accent-hover:  #2563EB
--accent-subtle: rgba(59,130,246,0.12)
--text-primary:  #F1F5F9
--text-secondary:#94A3B8
--text-muted:    #475569
--border:        #1E3A5F
--border-focus:  #3B82F6
--success:       #10B981
--danger:        #EF4444
--warning:       #F59E0B
```

---

## Instruksi untuk Sesi 12

```
Project: BuRegDes Next — Buku Register Administrasi Desa
Repo: karangsengon-03/buregdes-next
Stack: Next.js 16.2.4 App Router, TypeScript strict, Tailwind CSS, lucide-react, Firebase v10
Target: Mobile-first, dark mode default

SETELAH EXTRACT:
1. npm install
2. npx tsc --noEmit (verifikasi 0 error sebelum mulai)

JANGAN ubah:
- Semua RTDB paths — sudah benar semua
- bookId format 'A1'–'A6' tanpa titik
- Hash function di useLock (kompatibel versi lama)
- Lock system, Export system, Card View — sudah final
```

> **Catatan untuk sesi 12:** Semua fitur dari rencana awal sudah selesai di sesi 11.
> Sesi 12 bisa digunakan untuk bug fixes, polish UI tambahan, atau fitur baru
> jika ada permintaan dari pengguna (Angga). Tidak ada backlog yang tertunda.
