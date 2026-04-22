'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — AppContext
// Global state: activeBook, activeYear, isOnline, toast
// ─────────────────────────────────────────────

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import { db } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'
import { BOOKS, YEARS, DEFAULT_YEAR } from '@/constants/books'
import type { BookDef, ToastMessage } from '@/types'

interface AppContextValue {
  activeBook: BookDef
  setActiveBook: (book: BookDef) => void
  activeYear: string
  setActiveYear: (year: string) => void
  isOnline: boolean
  toast: ToastMessage | null
  showToast: (msg: Omit<ToastMessage, 'id'>) => void
  dismissToast: () => void
  searchQuery: string
  setSearchQuery: (q: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeBook, setActiveBook] = useState<BookDef>(BOOKS[0])
  const [activeYear, setActiveYear] = useState<string>(DEFAULT_YEAR)
  const [isOnline, setIsOnline]     = useState(true)
  const [toast, setToast]           = useState<ToastMessage | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const toastTimer                  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Firebase connection monitor
  useEffect(() => {
    const connRef = ref(db, '.info/connected')
    const unsub = onValue(connRef, (snap) => {
      setIsOnline(snap.val() === true)
    })
    return () => unsub()
  }, [])

  const showToast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    const id = Date.now().toString()
    setToast({ ...msg, id })
    toastTimer.current = setTimeout(() => setToast(null), msg.duration ?? 3000)
  }, [])

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(null)
  }, [])

  return (
    <AppContext.Provider value={{
      activeBook, setActiveBook,
      activeYear, setActiveYear,
      isOnline,
      toast, showToast, dismissToast,
      searchQuery, setSearchQuery,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
