'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — useLock (Session 9)
//
// Mengelola 3 path RTDB:
//   sheetLocks/globalLock  → { locked, pinHash }  (global, semua buku)
//   data/{year}/lockedRows → { "A1__0": true, ... } (per tahun)
//   masterHash             → number (hash master password)
//
// Versi lama pakai simpleHash(str) = sum of charCode * position.
// Kita port hash yang sama agar kompatibel dengan PIN/master yang
// sudah tersimpan di RTDB.
// ─────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/firebase'
import { ref, onValue, set, get } from 'firebase/database'

// ── Hash kompatibel dengan versi lama ─────────
export function simpleHash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h + str.charCodeAt(i) * (i + 1)) & 0xffffffff
  }
  return h
}

interface SheetLock {
  locked:   boolean
  pinHash?: number
}

interface LockedRows {
  [key: string]: boolean   // "A1__0": true
}

interface UseLockReturn {
  // State
  isGlobalLocked:  boolean
  hasPin:          boolean
  hasMasterHash:   boolean
  lockedRows:      LockedRows
  unlockedSession: boolean   // true = user sudah unlock di sesi ini

  // Actions
  setPin:          (pin: string) => Promise<void>
  unlock:          (pin: string) => boolean          // returns true jika pin benar
  lock:            () => Promise<void>
  toggleRowLock:   (bookId: string, ri: number, year: string) => Promise<void>
  isRowLocked:     (bookId: string, ri: number) => boolean
  verifyMaster:    (pwd: string) => Promise<boolean>
  setMasterHash:   (pwd: string) => Promise<void>
}

export function useLock(activeYear: string): UseLockReturn {
  const [sheetLock,       setSheetLock]       = useState<SheetLock>({ locked: false })
  const [lockedRows,      setLockedRows]       = useState<LockedRows>({})
  const [masterHash,      setMasterHashState]  = useState<number | null>(null)
  const [unlockedSession, setUnlockedSession]  = useState(false)

  // ── Subscribe sheetLocks/globalLock (global) ──
  useEffect(() => {
    const r = ref(db, 'sheetLocks/globalLock')
    const unsub = onValue(r, snap => {
      const v = snap.val()
      if (v) setSheetLock(v)
      else   setSheetLock({ locked: false })
    })
    return () => unsub()
  }, [])

  // ── Subscribe lockedRows (per tahun) ──────────
  useEffect(() => {
    const r = ref(db, `data/${activeYear}/lockedRows`)
    const unsub = onValue(r, snap => {
      setLockedRows(snap.val() || {})
    })
    return () => unsub()
  }, [activeYear])

  // ── Subscribe masterHash (global) ─────────────
  useEffect(() => {
    const r = ref(db, 'masterHash')
    const unsub = onValue(r, snap => {
      const v = snap.val()
      setMasterHashState(typeof v === 'number' ? v : null)
    })
    return () => unsub()
  }, [])

  // ── Set PIN (simpan ke RTDB + aktifkan lock) ──
  const setPin = useCallback(async (pin: string) => {
    const pinHash = simpleHash(pin)
    await set(ref(db, 'sheetLocks/globalLock'), { locked: true, pinHash })
    setUnlockedSession(true)   // setelah set PIN, langsung unlock sesi ini
  }, [])

  // ── Unlock dengan PIN ─────────────────────────
  const unlock = useCallback((pin: string): boolean => {
    if (!sheetLock.pinHash) return false
    const ok = simpleHash(pin) === sheetLock.pinHash
    if (ok) setUnlockedSession(true)
    return ok
  }, [sheetLock.pinHash])

  // ── Lock kembali ──────────────────────────────
  const lock = useCallback(async () => {
    setUnlockedSession(false)
    // Tidak ubah pinHash, hanya reset sesi — locked state sudah di RTDB
  }, [])

  // ── Toggle row lock ───────────────────────────
  const toggleRowLock = useCallback(async (bookId: string, ri: number, year: string) => {
    const key  = `${bookId}__${ri}`
    const path = ref(db, `data/${year}/lockedRows`)
    // Baca fresh dari RTDB sebelum toggle (hindari race condition)
    const snap = await get(path)
    const current: LockedRows = snap.val() || {}
    if (current[key]) {
      delete current[key]
    } else {
      current[key] = true
    }
    await set(path, Object.keys(current).length > 0 ? current : null)
  }, [])

  // ── Cek apakah baris terkunci ─────────────────
  const isRowLocked = useCallback((bookId: string, ri: number): boolean => {
    return !!lockedRows[`${bookId}__${ri}`]
  }, [lockedRows])

  // ── Verifikasi master password ─────────────────
  const verifyMaster = useCallback(async (pwd: string): Promise<boolean> => {
    if (masterHash === null) return false
    return simpleHash(pwd) === masterHash
  }, [masterHash])

  // ── Simpan master password baru ───────────────
  const setMasterHashFn = useCallback(async (pwd: string) => {
    await set(ref(db, 'masterHash'), simpleHash(pwd))
  }, [])

  return {
    isGlobalLocked:  sheetLock.locked && !unlockedSession,
    hasPin:          !!sheetLock.pinHash,
    hasMasterHash:   masterHash !== null,
    lockedRows,
    unlockedSession,
    setPin,
    unlock,
    lock,
    toggleRowLock,
    isRowLocked,
    verifyMaster,
    setMasterHash: setMasterHashFn,
  }
}
