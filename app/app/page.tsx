'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

export default function AppPage() {
  const { status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === 'form' || status === 'session') {
      router.replace('/login')
    }
  }, [status, router])

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-app)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <Loader2
        size={28}
        style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }}
      />
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
        Memuat aplikasi...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
