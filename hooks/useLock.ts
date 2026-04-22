'use client'
// BuRegDes Next — useLock (Session 18 — Fixed)
//
// Fix: lock() sekarang simpan ke RTDB agar persisten lintas sesi
// Fix: unlockedSession persisten via sessionStorage (survive page refresh dalam tab sama)

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/firebase'
import { ref, onValue, set, get } from 'firebase/database'

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
  [key: string]: boolean
}

interface UseLockReturn {
  isGlobalLocked:  boolean
  hasPin:          boolean
  hasMasterHash:   boolean
  lockedRows:      LockedRows
  unlockedSession: boolean
  setPin:          (pin: string) => Promise<void>
  unlock:          (pin: string) => boolean
  lock:            () => Promise<void>
  toggleRowLock:   (bookId: string, ri: number, year: string) => Promise<void>
  isRowLocked:     (bookId: string, ri: number) => boolean
  verifyMaster:    (pwd: string) => Promise<boolean>
  setMasterHash:   (pwd: string) => Promise<void>
}

const SESSION_KEY = 'br_unlocked'

export function useLock(activeYear: string): UseLockReturn {
  const [sheetLock,      setSheetLock]      = useState<SheetLock>({ locked: false })
  const [lockedRows,     setLockedRows]     = useState<LockedRows>({})
  const [masterHash,     setMasterHashState] = useState<number | null>(null)

  // unlockedSession: baca dari sessionStorage agar survive refresh dalam tab yang sama
  const [unlockedSession, setUnlockedSessionState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem(SESSION_KEY) === '1'
  })

  const setUnlockedSession = (v: boolean) => {
    setUnlockedSessionState(v)
    if (typeof window !== 'undefined') {
      if (v) sessionStorage.setItem(SESSION_KEY, '1')
      else   sessionStorage.removeItem(SESSION_KEY)
    }
  }

  // Subscribe sheetLocks/globalLock
  useEffect(() => {
    const r = ref(db, 'sheetLocks/globalLock')
    const unsub = onValue(r, snap => {
      const v = snap.val()
      if (v) setSheetLock(v)
      else   setSheetLock({ locked: false })
    })
    return () => unsub()
  }, [])

  // Subscribe lockedRows
  useEffect(() => {
    const r = ref(db, `data/${activeYear}/lockedRows`)
    const unsub = onValue(r, snap => {
      setLockedRows(snap.val() || {})
    })
    return () => unsub()
  }, [activeYear])

  // Subscribe masterHash
  useEffect(() => {
    const r = ref(db, 'masterHash')
    const unsub = onValue(r, snap => {
      const v = snap.val()
      setMasterHashState(typeof v === 'number' ? v : null)
    })
    return () => unsub()
  }, [])

  // Set PIN baru → simpan ke RTDB dengan locked: true
  const setPin = useCallback(async (pin: string) => {
    const pinHash = simpleHash(pin)
    await set(ref(db, 'sheetLocks/globalLock'), { locked: true, pinHash })
    setUnlockedSession(true) // setelah set PIN, sesi ini unlock
  }, [])

  // Unlock dengan PIN
  const unlock = useCallback((pin: string): boolean => {
    if (!sheetLock.pinHash) return false
    const ok = simpleHash(pin) === sheetLock.pinHash
    if (ok) setUnlockedSession(true)
    return ok
  }, [sheetLock.pinHash])

  // Lock kembali — simpan locked:true ke RTDB agar persisten
  const lock = useCallback(async () => {
    // Pastikan RTDB tahu status locked (pinHash sudah ada, hanya update locked)
    const snap = await get(ref(db, 'sheetLocks/globalLock'))
    const current: SheetLock = snap.val() || {}
    await set(ref(db, 'sheetLocks/globalLock'), {
      ...current,
      locked: true,
    })
    setUnlockedSession(false)
  }, [])

  // Toggle row lock
  const toggleRowLock = useCallback(async (bookId: string, ri: number, year: string) => {
    const key  = `${bookId}__${ri}`
    const path = ref(db, `data/${year}/lockedRows`)
    const snap = await get(path)
    const current: LockedRows = snap.val() || {}
    if (current[key]) delete current[key]
    else current[key] = true
    await set(path, Object.keys(current).length > 0 ? current : null)
  }, [])

  const isRowLocked = useCallback((bookId: string, ri: number): boolean => {
    return !!lockedRows[`${bookId}__${ri}`]
  }, [lockedRows])

  const verifyMaster = useCallback(async (pwd: string): Promise<boolean> => {
    if (masterHash === null) return false
    return simpleHash(pwd) === masterHash
  }, [masterHash])

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
