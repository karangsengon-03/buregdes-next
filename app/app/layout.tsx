'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — App Layout (Session 2)
// Auth guard + layout shell
// ─────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AppProvider } from '@/contexts/AppContext'
import { Sidebar }   from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header }    from '@/components/layout/Header'
import { Toast }     from '@/components/ui/Toast'

function AppShell({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  const router     = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'form' || status === 'session') {
      router.replace('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: 'var(--bg-app)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '2.5px solid var(--accent)',
            borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Memuat…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (status !== 'authenticated') return null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        overflow: 'hidden',
        background: 'var(--bg-app)',
      }}
    >
      {/* Stripe top */}
      <div
        style={{
          height: 4,
          flexShrink: 0,
          background: 'linear-gradient(90deg, #F59E0B, #EF4444, #10B981, #3B82F6)',
        }}
      />

      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* Scrollable content */}
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-app)' }}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Toast */}
      <Toast />
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppShell>{children}</AppShell>
    </AppProvider>
  )
}
