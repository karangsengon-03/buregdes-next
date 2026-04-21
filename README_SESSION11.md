# BuRegDes Next — Session 11 Briefing

**Project:** BuRegDes Next — Buku Register Administrasi Desa  
**Repo:** karangsengon-03/buregdes-next  
**Stack:** Next.js 16.2.4 App Router · TypeScript · Tailwind CSS · lucide-react · Firebase v10  
**Font:** Plus Jakarta Sans + JetBrains Mono  
**Target:** Mobile-first · Dark mode default  
**Deploy:** Vercel (auto dari GitHub push)

---

## Status Setelah Sesi 10

`npx tsc --noEmit` → 0 error  
`npm run build` → ✅ sukses 0 error

### Yang selesai di Sesi 10 — Export & Backup System:

| File | Keterangan |
|------|------------|
| `lib/exportPDF.ts` | Baru — export PDF landscape A4 per buku aktif (jsPDF + autoTable) |
| `lib/backupRestore.ts` | Baru — backup JSON download dari RTDB + restore JSON upload ke RTDB |
| `lib/exportExcel.ts` | Upgrade — tambah `exportAllBooks` (6 sheet, semua buku A1–A6) |
| `components/ui/ExportModal.tsx` | Upgrade total — bottom-sheet multi-panel: 5 opsi (Excel buku ini, Excel semua, PDF, Backup, Restore) |

### Dependency baru di Session 10:
```json
"jspdf": "^2.5.1",
"jspdf-autotable": "^3.8.2"
```

---

## RTDB Struktur (Referensi)

```
Root keys: data, desaInfo, history, masterHash, sheetLocks, tableData (legacy)

data/{year}/tableData/{bookId}  → ARRAY of rows
  bookId: 'A1','A2','A3','A4','A5','A6' (TANPA titik)

desaInfo  → ROOT level
  { desa, kecamatan, kabupaten, provinsi, tahun }
```

---

## Fix yang Sudah Ada (Jangan Diulang)

| # | File | Fix |
|---|------|-----|
| 1 | `lib/firebase.ts` | `export const database = db` |
| 2 | `constants/books.ts` | `id: 'A1'` tanpa titik |
| 3 | `package.json` | `"xlsx": "^0.18.5"` |
| 4 | `hooks/useDesaInfo.ts` | Path `'desaInfo'` root level |
| 5 | `hooks/useBookData.ts` | Array RTDB pattern |
| 6 | `hooks/useSettings.ts` | `availableYears: string[]` |
| 7 | `lib/exportExcel.ts` | `exportExcel` + `exportAllBooks` |
| 8 | `types/index.ts` | `HighlightPart`, `ColDef`, `BookRow.no: string\|number` |
| 9 | `hooks/usePresence.ts` | Firebase v10 unsub pattern |
| 10 | `hooks/useHistory.ts` | Firebase v10 unsub pattern |
| 11 | `components/ui/HistoryDrawer.tsx` | Hapus unused `User` import |
| 12 | `ExportModal.tsx` + `settings/page.tsx` | `year: string` (bukan number) |
| 13 | `hooks/useLock.ts` | Lock system — Session 9 |
| 14 | `components/ui/LockModal.tsx` | Lock modal — Session 9 |
| 15 | `lib/exportPDF.ts` | PDF export — Session 10 |
| 16 | `lib/backupRestore.ts` | Backup/Restore JSON — Session 10 |
| 17 | `components/ui/ExportModal.tsx` | Multi-panel export modal — Session 10 |

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

## Instruksi untuk Sesi 11

```
Project: BuRegDes Next — Buku Register Administrasi Desa
Repo: karangsengon-03/buregdes-next
Stack: Next.js 16.2.4 App Router, TypeScript strict, Tailwind CSS, lucide-react, Firebase v10
Target: Mobile-first, dark mode default

SETELAH EXTRACT:
1. npm install
2. npx tsc --noEmit (verifikasi 0 error sebelum mulai)

JANGAN ubah:
- Lock system (useLock, LockModal) — sudah benar
- Export system (exportExcel, exportPDF, backupRestore, ExportModal) — sudah benar
- RTDB paths — sudah benar semua
- bookId format 'A1'–'A6' tanpa titik
- Hash function di useLock (kompatibel versi lama)
```
