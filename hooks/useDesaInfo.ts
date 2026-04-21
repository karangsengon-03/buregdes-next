'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — useDesaInfo
// Firebase RTDB listener + update untuk info desa
// Path: desaInfo (ROOT level)
// ─────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/firebase'
import { ref, onValue, update, off } from 'firebase/database'
import type { DesaInfo } from '@/types'

export const DEFAULT_DESA_INFO: DesaInfo = {
  desa: '',
  kecamatan: '',
  kabupaten: '',
  provinsi: '',
  tahun: String(new Date().getFullYear()),
}

const RTDB_PATH = 'desaInfo'

interface UseDesaInfoReturn {
  desaInfo: DesaInfo
  status: 'idle' | 'loading' | 'ready' | 'error'
  updateDesaInfo: (data: Partial<DesaInfo>) => Promise<void>
}

export function useDesaInfo(): UseDesaInfoReturn {
  const [desaInfo, setDesaInfo] = useState<DesaInfo>(DEFAULT_DESA_INFO)
  const [status, setStatus]     = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  useEffect(() => {
    setStatus('loading')
    const infoRef = ref(db, RTDB_PATH)

    const unsub = onValue(
      infoRef,
      (snap) => {
        if (snap.exists()) {
          setDesaInfo({ ...DEFAULT_DESA_INFO, ...(snap.val() as DesaInfo) })
        } else {
          setDesaInfo(DEFAULT_DESA_INFO)
        }
        setStatus('ready')
      },
      (err) => {
        console.error('useDesaInfo error:', err)
        setStatus('error')
      }
    )

    return () => {
      off(infoRef)
      unsub()
    }
  }, [])

  const updateDesaInfo = useCallback(async (data: Partial<DesaInfo>) => {
    const infoRef = ref(db, RTDB_PATH)
    await update(infoRef, data)
  }, [])

  return { desaInfo, status, updateDesaInfo }
}
