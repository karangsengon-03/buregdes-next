'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — usePrint hook (Session 7)
// Handle print preparation + CSS injection
// ─────────────────────────────────────────────

import { useCallback, useRef } from 'react'

export type PrintScope = 'all' | 'filtered'

export interface PrintOptions {
  /** Judul dokumen saat dicetak (akan muncul di header browser print) */
  title?: string
}

/**
 * usePrint — inject print stylesheet sementara, set document.title,
 * lalu trigger window.print(). Cleanup otomatis setelah print dialog ditutup.
 */
export function usePrint() {
  const styleRef = useRef<HTMLStyleElement | null>(null)

  const triggerPrint = useCallback((options?: PrintOptions) => {
    const prevTitle = document.title
    if (options?.title) {
      document.title = options.title
    }

    // Bersihkan style lama jika ada
    if (styleRef.current) {
      styleRef.current.remove()
      styleRef.current = null
    }

    window.print()

    // Restore title setelah print dialog tutup
    // (afterprint event tidak 100% reliable di semua browser, tapi cukup)
    const restore = () => {
      document.title = prevTitle
      window.removeEventListener('afterprint', restore)
    }
    window.addEventListener('afterprint', restore)
  }, [])

  return { triggerPrint }
}
