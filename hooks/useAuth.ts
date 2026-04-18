'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — useAuth Hook
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { saveSession, loadSession, getSavedPassword } from '@/lib/session'

export type AuthStatus = 'loading' | 'session' | 'form' | 'authenticated'

interface AuthError {
  code: string
  message: string
}

function friendlyError(code: string): string {
  const map: Record<string, string> = {
    'auth/user-not-found':         'Email atau password salah!',
    'auth/wrong-password':         'Email atau password salah!',
    'auth/invalid-credential':     'Email atau password salah!',
    'auth/too-many-requests':      'Terlalu banyak percobaan, coba lagi nanti.',
    'auth/network-request-failed': 'Gagal terhubung. Periksa koneksi internet.',
    'auth/invalid-email':          'Format email tidak valid.',
  }
  return map[code] || 'Gagal masuk. Silakan coba lagi.'
}

export function useAuth() {
  const [user, setUser]         = useState<User | null>(null)
  const [status, setStatus]     = useState<AuthStatus>('loading')
  const [error, setError]       = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const session = loadSession()
        const username = firebaseUser.displayName || session?.username || firebaseUser.email!.split('@')[0]
        saveSession({ email: firebaseUser.email!, username })
        setUser(firebaseUser)
        setStatus('authenticated')
      } else {
        const session = loadSession()
        if (session) {
          setStatus('session')
        } else {
          setStatus('form')
        }
      }
    })
    return () => unsub()
  }, [])

  const login = async (email: string, password: string) => {
    setError('')
    setIsLoading(true)
    try {
      await setPersistence(auth, browserLocalPersistence)
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const username = cred.user.displayName || email.split('@')[0]
      saveSession({ email, username }, password)
    } catch (e: unknown) {
      const err = e as AuthError
      setError(friendlyError(err.code))
    } finally {
      setIsLoading(false)
    }
  }

  const lanjut = async () => {
    const session = loadSession()
    if (!session) { setStatus('form'); return }

    // Jika Firebase user masih aktif
    if (auth.currentUser) {
      setStatus('authenticated')
      return
    }

    // Coba auto-login dengan saved credentials
    const savedPwd = getSavedPassword(session)
    if (session.email && savedPwd) {
      setIsLoading(true)
      try {
        await setPersistence(auth, browserLocalPersistence)
        const cred = await signInWithEmailAndPassword(auth, session.email, savedPwd)
        const username = cred.user.displayName || session.username || session.email.split('@')[0]
        saveSession({ email: session.email, username }, savedPwd)
      } catch {
        setStatus('form')
      } finally {
        setIsLoading(false)
      }
      return
    }

    // Tidak ada saved pwd → tampilkan form
    setStatus('form')
  }

  const gantiAkun = () => {
    setError('')
    setStatus('form')
  }

  const logout = async () => {
    await signOut(auth)
    // Session sengaja tidak dihapus — untuk "Lanjutkan" setelah logout
    setUser(null)
    setStatus('session')
  }

  return { user, status, error, isLoading, login, lanjut, gantiAkun, logout }
}
