'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — useBookData (Fixed)
// Firebase RTDB listener + CRUD
// Path: data/{year}/tableData/{bookId}
// RTDB tableData: array (index '0','1','2',...) — bukan push key
// ─────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/firebase'
import {
  ref,
  onValue,
  set,
  update,
  get,
} from 'firebase/database'
import type { BookRow } from '@/types'

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

interface UseBookDataReturn {
  rows:       BookRow[]
  status:     LoadStatus
  error:      string
  addRow:     (data: Omit<BookRow, 'no' | '_id'>) => Promise<void>
  updateCell: (rowId: string, field: string, value: string | number) => Promise<void>
  deleteRow:  (rowId: string) => Promise<void>
}

export function useBookData(bookId: string, year: string): UseBookDataReturn {
  const [rows,   setRows]   = useState<BookRow[]>([])
  const [status, setStatus] = useState<LoadStatus>('idle')
  const [error,  setError]  = useState('')

  const rtdbPath = `data/${year}/tableData/${bookId}`

  useEffect(() => {
    if (!bookId || !year) return

    setStatus('loading')
    setRows([])
    setError('')

    const dataRef = ref(db, rtdbPath)

    const unsub = onValue(
      dataRef,
      (snap) => {
        if (!snap.exists()) {
          setRows([])
          setStatus('ready')
          return
        }

        const raw = snap.val() as Record<string, Record<string, string | number>>
        // RTDB array: keys = '0','1','2',...
        const parsed: BookRow[] = Object.entries(raw)
          .map(([idx, val]) => ({ ...val, _id: idx } as BookRow))
          .sort((a, b) => Number(a.no) - Number(b.no))

        setRows(parsed)
        setStatus('ready')
      },
      (err) => {
        console.error('RTDB error:', err)
        setError(err.message)
        setStatus('error')
      }
    )

    return () => unsub()
  }, [bookId, year])

  // ── Tambah baris baru ──────────────────────
  const addRow = useCallback(
    async (data: Omit<BookRow, 'no' | '_id'>) => {
      const dataRef = ref(db, rtdbPath)
      const snap    = await get(dataRef)

      const arr = snap.exists()
        ? (snap.val() as unknown[])
        : []
      const nextIndex = arr.length
      const nextNo    = String(nextIndex + 1)   // no = '1'-based string

      const newRowRef = ref(db, `${rtdbPath}/${nextIndex}`)
      await set(newRowRef, { ...data, no: nextNo })
    },
    [rtdbPath]
  )

  // ── Update satu cell ───────────────────────
  const updateCell = useCallback(
    async (rowId: string, field: string, value: string | number) => {
      const rowRef = ref(db, `${rtdbPath}/${rowId}`)
      await update(rowRef, { [field]: value })
    },
    [rtdbPath]
  )

  // ── Hapus baris + compact array ────────────
  const deleteRow = useCallback(
    async (rowId: string) => {
      const dataRef = ref(db, rtdbPath)
      const snap    = await get(dataRef)
      if (!snap.exists()) return

      const arr = snap.val() as Record<string, Record<string, string | number>>
      const remaining = Object.entries(arr)
        .filter(([idx]) => idx !== rowId)
        .sort(([a], [b]) => Number(a) - Number(b))

      // Tulis ulang array yang sudah dikompakkan
      const newArr: Record<string, Record<string, string | number>> = {}
      remaining.forEach(([, row], i) => {
        newArr[i] = { ...row, no: String(i + 1) }
      })

      await set(dataRef, newArr)
    },
    [rtdbPath]
  )

  return { rows, status, error, addRow, updateCell, deleteRow }
}
