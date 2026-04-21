'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — usePresence hook (Session 8 Fixed)
// Multi-user presence via RTDB .info/connected
// Path: /presence/{uid} → { name, uid, online, lastSeen }
// Rules: ".read": "auth != null", ".write": "auth != null"
// ─────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { database, auth } from '@/lib/firebase'
import {
  ref,
  onValue,
  onDisconnect,
  serverTimestamp,
  set,
  remove,
} from 'firebase/database'

export interface OnlineUser {
  uid:      string
  name:     string
  online:   boolean
  lastSeen: number | null
}

interface UsePresenceReturn {
  onlineUsers: OnlineUser[]
  myUid:       string | null
  count:       number
}

export function usePresence(): UsePresenceReturn {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [myUid, setMyUid]             = useState<string | null>(null)

  useEffect(() => {
    const currentUser = auth.currentUser
    if (!currentUser) return

    const uid  = currentUser.uid
    const name = currentUser.displayName
      || currentUser.email?.split('@')[0]
      || 'Pengguna'

    setMyUid(uid)

    const connectedRef  = ref(database, '.info/connected')
    const myPresenceRef = ref(database, `presence/${uid}`)

    // Saat connect → tulis presence, saat disconnect → hapus otomatis
    const unsubConnected = onValue(connectedRef, snap => {
      if (!snap.val()) return
      onDisconnect(myPresenceRef).remove()
      set(myPresenceRef, {
        name,
        uid,
        online:   true,
        lastSeen: serverTimestamp(),
      })
    })

    // Listen semua user yang online
    const presenceRootRef = ref(database, 'presence')
    const unsubPresence   = onValue(presenceRootRef, snap => {
      if (!snap.exists()) {
        setOnlineUsers([])
        return
      }
      const data  = snap.val() as Record<string, OnlineUser>
      const users = Object.values(data).filter(u => u.online)
      setOnlineUsers(users)
    })

    return () => {
      // Firebase v10: onValue() returns unsubscribe fn — panggil langsung
      unsubConnected()
      unsubPresence()
      remove(myPresenceRef).catch(() => {/* silent */})
    }
  }, [])

  return { onlineUsers, myUid, count: onlineUsers.length }
}
