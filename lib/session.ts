// ─────────────────────────────────────────────
// BuRegDes Next — Session Utility
// Mirror logika auth.js lama (localStorage brUser)
// ─────────────────────────────────────────────

import { SessionData } from '@/types'

const KEY = 'brUser'

export function saveSession(data: Partial<SessionData> & { email: string; username: string }, password?: string): void {
  const existing = loadSession()
  const payload: SessionData = {
    email:    data.email,
    username: data.username,
    savedPwd: existing?.savedPwd,
  }
  if (password) {
    payload.savedPwd = btoa(unescape(encodeURIComponent(password)))
  }
  localStorage.setItem(KEY, JSON.stringify(payload))
}

export function loadSession(): SessionData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getSavedPassword(session: SessionData | null): string {
  if (!session?.savedPwd) return ''
  try {
    return decodeURIComponent(escape(atob(session.savedPwd)))
  } catch {
    return ''
  }
}

export function clearSession(): void {
  // JANGAN hapus session — supaya setelah logout masih bisa "Lanjutkan"
  // Ini sengaja tidak melakukan apa-apa, konsisten dengan auth.js lama
}

export function getTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return (localStorage.getItem('brTheme') as 'dark' | 'light') || 'dark'
}

export function setTheme(theme: 'dark' | 'light'): void {
  localStorage.setItem('brTheme', theme)
}
