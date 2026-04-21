'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — useHistory hook (Session 8 Fixed)
//
// RTDB Path (SESUAI STRUKTUR AKTUAL):
//   /history/{bookId}   ← ROOT level, bukan di bawah /data/{year}
//   Setiap entry: array of objects per baris (ri = row index)
//
// Schema entry yang SUDAH ADA di RTDB:
//   { bookId, colLabel, key, newVal, ri, ts, user }
//   ├ bookId:   string       → 'A1', 'A6', dll
//   ├ colLabel: string       → label kolom (e.g. 'NOMOR')
//   ├ key:      string       → field key (e.g. 'nomor')
//   ├ newVal:   any          → nilai baru setelah edit
//   ├ ri:       number       → row index (posisi baris di array)
//   ├ ts:       number       → timestamp ms
//   └ user:     string       → display name user
//
// Hook ini membaca & menulis dengan schema yang sama agar
// kompatibel dengan history yang sudah ada di RTDB.
// ─────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react'
import { database, auth } from '@/lib/firebase'
import {
  ref,
  query,
  limitToLast,
  onValue,
  push,
  serverTimestamp,
} from 'firebase/database'

// Schema sesuai data aktual di RTDB
export interface HistoryEntry {
  _pushKey: string       // Firebase push key (key dari object entry)
  bookId:   string       // 'A1', 'A6', dll
  colLabel: string       // Label kolom: 'NOMOR SURAT', 'TENTANG', dll
  key:      string       // Field key: 'nomor', 'tentang', dll
  newVal:   string | number | null
  ri:       number       // Row index
  ts:       number       // Timestamp ms
  user:     string       // Nama user
}

interface LogEditParams {
  bookId:   string
  ri:       number       // row index (posisi di array)
  key:      string       // field key
  colLabel: string       // label kolom yang tampil di history drawer
  newVal:   string | number | null
}

interface UseHistoryReturn {
  entries:  HistoryEntry[]
  status:   'idle' | 'loading' | 'ready'
  logEdit:  (params: LogEditParams) => Promise<void>
}

// Ambil max 60 entry terbaru (limitToLast pada array RTDB = 60 row-group terakhir)
const LIMIT = 60

export function useHistory(bookId: string): UseHistoryReturn {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'ready'>('idle')

  useEffect(() => {
    if (!bookId) return
    setStatus('loading')

    // Path: /history/{bookId} — ROOT level
    const histRef = ref(database, `history/${bookId}`)
    const q       = query(histRef, limitToLast(LIMIT))

    const unsub = onValue(q, snap => {
      if (!snap.exists()) {
        setEntries([])
        setStatus('ready')
        return
      }

      // Data: array of objects, setiap element = satu "group baris"
      // Di dalam tiap group: object keyed by push key → entry
      const raw = snap.val()
      const result: HistoryEntry[] = []

      // raw bisa array atau object (RTDB kadang collapse array)
      const groups: Array<Record<string, Omit<HistoryEntry, '_pushKey'>>> =
        Array.isArray(raw) ? raw : Object.values(raw)

      for (const group of groups) {
        if (!group || typeof group !== 'object') continue
        for (const [pushKey, entry] of Object.entries(group)) {
          if (!entry || typeof entry !== 'object') continue
          result.push({
            _pushKey: pushKey,
            bookId:   (entry as HistoryEntry).bookId   ?? bookId,
            colLabel: (entry as HistoryEntry).colLabel  ?? '',
            key:      (entry as HistoryEntry).key       ?? '',
            newVal:   (entry as HistoryEntry).newVal    ?? null,
            ri:       (entry as HistoryEntry).ri        ?? 0,
            ts:       (entry as HistoryEntry).ts        ?? 0,
            user:     (entry as HistoryEntry).user      ?? 'Pengguna',
          })
        }
      }

      // Sort terbaru dulu
      result.sort((a, b) => b.ts - a.ts)
      setEntries(result.slice(0, 100))   // tampilkan max 100 entry
      setStatus('ready')
    }, () => {
      setStatus('ready')
    })

    return () => unsub()  // Firebase v10: onValue() returns unsubscribe fn
  }, [bookId])

  // Log satu perubahan — schema sama dengan yang sudah ada di RTDB
  const logEdit = useCallback(async (params: LogEditParams) => {
    const user = auth.currentUser
    if (!user) return

    const userName = user.displayName
      || user.email?.split('@')[0]
      || 'Pengguna'

    // Path: /history/{bookId}/{ri}  ← push ke index baris yang sesuai
    // Ini mengikuti pola yang sudah ada: history[bookId][ri][pushKey] = entry
    const rowRef = ref(database, `history/${params.bookId}/${params.ri}`)
    await push(rowRef, {
      bookId:   params.bookId,
      colLabel: params.colLabel,
      key:      params.key,
      newVal:   params.newVal ?? null,
      ri:       params.ri,
      ts:       serverTimestamp(),
      user:     userName,
    })
  }, [])

  return { entries, status, logEdit }
}
