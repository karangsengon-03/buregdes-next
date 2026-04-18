'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Sun, Moon, LogIn, ArrowRight, RefreshCw, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { loadSession, getTheme, setTheme } from '@/lib/session'

export default function LoginPage() {
  const router  = useRouter()
  const { status, error, isLoading, login, lanjut, gantiAkun } = useAuth()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [theme,    setThemeState] = useState<'dark'|'light'>('dark')
  const [mounted,  setMounted]  = useState(false)

  // Theme init
  useEffect(() => {
    setMounted(true)
    setThemeState(getTheme())
  }, [])

  // Redirect jika sudah authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/app')
    }
  }, [status, router])

  // Prefill email saat ganti akun
  useEffect(() => {
    if (status === 'form') {
      const session = loadSession()
      if (session?.email) setEmail(session.email)
    }
  }, [status])

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setThemeState(next)
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
  }, [theme])

  const handleLogin = async () => {
    if (!email.trim() || !password) return
    await login(email.trim(), password)
  }

  const handleKeyDown = (e: React.KeyboardEvent, field: 'email'|'password') => {
    if (e.key !== 'Enter') return
    if (field === 'email') {
      document.getElementById('inp-password')?.focus()
    } else {
      handleLogin()
    }
  }

  const session = loadSession()

  if (!mounted || status === 'loading') {
    return (
      <div className="login-screen">
        <div className="login-loading">
          <div className="loading-logo-wrap">
            <div className="loading-logo-ring" />
            <span className="loading-logo-text">BR</span>
          </div>
          <p className="loading-brand-text">BuRegDes</p>
          <p className="loading-sub-text">Administrasi Desa</p>
          <Loader2 className="loading-spinner-icon" />
          <p className="loading-desa-text">Desa Karang Sengon · Kec. Klabang · Kab. Bondowoso</p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-screen">
      {/* Color stripe top */}
      <div className="stripe-bar" />

      {/* Theme toggle */}
      <button className="btn-theme-corner" onClick={toggleTheme} title="Ganti tema">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="login-wrap">

        {/* ── SESSION CARD ─────────────────── */}
        {status === 'session' && session && (
          <div className="login-card animate-fade-up">
            <div className="card-logo-wrap">
              <div className="card-logo-ring">
                <span className="card-logo-abbr">BR</span>
              </div>
            </div>

            <div className="card-brand">BuRegDes</div>
            <div className="card-brand-ver">Next · v1.0</div>
            <div className="card-sub">Buku Register Administrasi Desa</div>
            <div className="card-desa">
              Desa Karang Sengon<br />
              <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                Kec. Klabang · Kab. Bondowoso
              </span>
            </div>

            {/* Welcome banner */}
            <div className="session-banner">
              <div className="session-banner-avatar">
                {(session.username?.[0] || 'U').toUpperCase()}
              </div>
              <div className="session-banner-info">
                <div className="session-banner-hello">Selamat datang kembali</div>
                <div className="session-banner-name">{session.username || '—'}</div>
                <div className="session-banner-email">{session.email || '—'}</div>
              </div>
            </div>

            <button
              className="br-btn-primary ripple-parent"
              onClick={lanjut}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="btn-inner"><Loader2 size={16} className="spin-icon" /> Masuk...</span>
              ) : (
                <span className="btn-inner"><ArrowRight size={16} /> Lanjutkan</span>
              )}
            </button>

            <button className="br-btn-ghost ripple-parent mt-3" onClick={gantiAkun}>
              <span className="btn-inner"><RefreshCw size={14} /> Ganti Akun</span>
            </button>

            <p className="login-copy">© 2026 Pemerintah Desa Karang Sengon</p>
          </div>
        )}

        {/* ── LOGIN FORM CARD ───────────────── */}
        {status === 'form' && (
          <div className="login-card animate-fade-up">
            <div className="card-logo-wrap">
              <div className="card-logo-ring">
                <span className="card-logo-abbr">BR</span>
              </div>
            </div>

            <div className="card-brand">BuRegDes</div>
            <div className="card-brand-ver">Next · v1.0</div>
            <div className="card-sub">Buku Register Administrasi Desa</div>
            <div className="card-desa">
              Desa Karang Sengon<br />
              <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                Kec. Klabang · Kab. Bondowoso
              </span>
            </div>

            {/* Form */}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                id="inp-email"
                type="email"
                className="br-input"
                placeholder="email@desa.id"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => handleKeyDown(e, 'email')}
                autoComplete="email"
                inputMode="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <input
                  id="inp-password"
                  type={showPwd ? 'text' : 'password'}
                  className="br-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => handleKeyDown(e, 'password')}
                  autoComplete="current-password"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  className="btn-eye"
                  onClick={() => setShowPwd(p => !p)}
                  tabIndex={-1}
                  title={showPwd ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="err-box animate-fade-in">
                {error}
              </div>
            )}

            <button
              className="br-btn-primary ripple-parent"
              onClick={handleLogin}
              disabled={isLoading || !email.trim() || !password}
            >
              {isLoading ? (
                <span className="btn-inner"><Loader2 size={16} className="spin-icon" /> Memproses...</span>
              ) : (
                <span className="btn-inner"><LogIn size={16} /> Masuk</span>
              )}
            </button>

            <p className="login-hint">Hubungi admin desa untuk mendapatkan akun</p>
            <p className="login-copy">© 2026 Pemerintah Desa Karang Sengon</p>
          </div>
        )}

      </div>

      {/* Login page CSS */}
      <style jsx>{`
        .login-screen {
          min-height: 100dvh;
          background: linear-gradient(145deg, #0A1628 0%, #0D1B2A 55%, #1B2B3E 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 60px 20px 32px;
          overflow: auto;
        }
        [data-theme="light"] .login-screen {
          background: linear-gradient(145deg, #1A3C5E 0%, #2563EB 60%, #1E4D8C 100%);
        }

        /* Loading */
        .login-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .loading-logo-wrap {
          position: relative;
          width: 80px; height: 80px;
          margin-bottom: 8px;
        }
        .loading-logo-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2.5px solid transparent;
          border-top-color: #3B82F6;
          animation: spin 1s linear infinite;
        }
        .loading-logo-text {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 800;
          color: #F1F5F9;
          letter-spacing: 1px;
        }
        .loading-brand-text {
          font-size: 20px;
          font-weight: 800;
          color: #F1F5F9;
          letter-spacing: 2px;
        }
        .loading-sub-text {
          font-size: 11px;
          color: #475569;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .loading-spinner-icon {
          width: 24px; height: 24px;
          color: #3B82F6;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        .loading-desa-text {
          font-size: 11px;
          color: #475569;
          text-align: center;
        }

        /* Theme toggle */
        .btn-theme-corner {
          position: fixed;
          top: 16px;
          right: 16px;
          width: 38px; height: 38px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: #94A3B8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, color 0.2s;
          z-index: 100;
        }
        .btn-theme-corner:hover {
          background: rgba(255,255,255,0.14);
          color: #F1F5F9;
        }

        /* Wrap */
        .login-wrap {
          width: 100%;
          max-width: 400px;
        }

        /* Card */
        .login-card {
          background: var(--bg-card);
          border-radius: 20px;
          padding: 32px 24px 24px;
          box-shadow: var(--shadow-card);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* Logo */
        .card-logo-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 14px;
        }
        .card-logo-ring {
          width: 68px; height: 68px;
          border-radius: 50%;
          background: var(--accent-subtle);
          border: 2px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 4px var(--accent-subtle);
        }
        .card-logo-abbr {
          font-size: 22px;
          font-weight: 800;
          color: var(--accent);
          letter-spacing: 1px;
        }

        /* Brand */
        .card-brand {
          text-align: center;
          font-size: 20px;
          font-weight: 800;
          color: var(--accent);
          letter-spacing: 2px;
          line-height: 1;
        }
        .card-brand-ver {
          text-align: center;
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 1px;
          margin-top: 2px;
          margin-bottom: 4px;
          font-family: 'JetBrains Mono', monospace;
        }
        .card-sub {
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.3px;
        }
        .card-desa {
          text-align: center;
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 2px;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        /* Session banner */
        .session-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--accent-subtle);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 16px;
        }
        .session-banner-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: var(--accent);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .session-banner-info { flex: 1; min-width: 0; }
        .session-banner-hello {
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 1px;
        }
        .session-banner-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .session-banner-email {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: 'JetBrains Mono', monospace;
        }

        /* Form */
        .form-group { margin-bottom: 14px; }
        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .input-wrap { position: relative; }
        .btn-eye {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .btn-eye:hover { color: var(--text-primary); }

        /* Error */
        .err-box {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: #EF4444;
          margin-bottom: 14px;
        }

        /* Button helpers */
        .btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .spin-icon { animation: spin 1s linear infinite; }
        .mt-3 { margin-top: 10px; }

        /* Hint & copy */
        .login-hint {
          text-align: center;
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 14px;
        }
        .login-copy {
          text-align: center;
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 6px;
          opacity: 0.6;
        }

        /* Animations */
        .animate-fade-up {
          animation: fadeUp 0.4s ease-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
