'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — LockModal (Session 9)
//
// Mode:
//   'set'    → set PIN baru (belum ada PIN)
//   'unlock' → masukkan PIN untuk buka kunci
//   'change' → ganti PIN (butuh master password dulu)
//   'master' → set master password (belum ada)
// ─────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react'
import { Lock, Unlock, KeyRound, ShieldCheck, Eye, EyeOff, X } from 'lucide-react'

export type LockModalMode = 'set' | 'unlock' | 'change' | 'master' | 'change-master'

interface LockModalProps {
  open:          boolean
  mode:          LockModalMode
  hasMasterHash: boolean
  onClose:       () => void
  onSetPin:      (pin: string) => Promise<void>
  onUnlock:      (pin: string) => boolean
  onVerifyMaster:(pwd: string) => Promise<boolean>
  onSetMaster:   (pwd: string) => Promise<void>
}

export function LockModal({
  open, mode, hasMasterHash,
  onClose, onSetPin, onUnlock, onVerifyMaster, onSetMaster,
}: LockModalProps) {
  const [step,       setStep]       = useState<'pin' | 'confirm' | 'master' | 'newpin'>('pin')
  const [pinVal,     setPinVal]     = useState('')
  const [confirmVal, setConfirmVal] = useState('')
  const [pwdVal,     setPwdVal]     = useState('')
  const [showPin,    setShowPin]    = useState(false)
  const [showPwd,    setShowPwd]    = useState(false)
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset state setiap kali modal dibuka
  useEffect(() => {
    if (!open) return
    setStep(
      mode === 'change' ? 'master'
      : mode === 'change-master' ? 'master'
      : mode === 'master' ? 'pin'
      : 'pin'
    )
    setPinVal(''); setConfirmVal(''); setPwdVal('')
    setShowPin(false); setShowPwd(false)
    setError(''); setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 80)
  }, [open, mode])

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  // ── Submit logic per mode/step ─────────────
  const handleSubmit = useCallback(async () => {
    setError('')

    // --- Mode: set PIN baru ---
    if (mode === 'set') {
      if (step === 'pin') {
        if (pinVal.length < 4) { setError('PIN minimal 4 angka'); return }
        if (!/^\d+$/.test(pinVal)) { setError('PIN hanya boleh angka'); return }
        setStep('confirm')
        setConfirmVal('')
        setTimeout(() => inputRef.current?.focus(), 50)
        return
      }
      if (step === 'confirm') {
        if (confirmVal !== pinVal) { setError('PIN tidak cocok, coba lagi'); setConfirmVal(''); return }
        setLoading(true)
        try { await onSetPin(pinVal); onClose() }
        catch { setError('Gagal menyimpan PIN') }
        finally { setLoading(false) }
        return
      }
    }

    // --- Mode: unlock ---
    if (mode === 'unlock') {
      if (pinVal.length < 4) { setError('Masukkan PIN terlebih dahulu'); return }
      const ok = onUnlock(pinVal)
      if (ok) { onClose() }
      else    { setError('PIN salah'); setPinVal('') }
      return
    }

    // --- Mode: change PIN (butuh master dulu) ---
    if (mode === 'change') {
      if (step === 'master') {
        if (!pwdVal) { setError('Masukkan master password'); return }
        setLoading(true)
        const ok = await onVerifyMaster(pwdVal)
        setLoading(false)
        if (!ok) { setError('Master password salah'); setPwdVal(''); return }
        setStep('newpin'); setPinVal(''); setError('')
        setTimeout(() => inputRef.current?.focus(), 50)
        return
      }
      if (step === 'newpin') {
        if (step === 'newpin' && confirmVal === '') {
          // Belum konfirmasi
          if (pinVal.length < 4) { setError('PIN minimal 4 angka'); return }
          if (!/^\d+$/.test(pinVal)) { setError('PIN hanya boleh angka'); return }
          setStep('confirm')
          setTimeout(() => inputRef.current?.focus(), 50)
          return
        }
      }
      if (step === 'confirm') {
        if (confirmVal !== pinVal) { setError('PIN tidak cocok'); setConfirmVal(''); return }
        setLoading(true)
        try { await onSetPin(pinVal); onClose() }
        catch { setError('Gagal menyimpan PIN') }
        finally { setLoading(false) }
        return
      }
    }

    // --- Mode: set master password ---
    if (mode === 'master') {
      if (step === 'pin') {
        if (pwdVal.length < 4) { setError('Master password minimal 4 karakter'); return }
        setStep('confirm'); setConfirmVal('')
        setTimeout(() => inputRef.current?.focus(), 50)
        return
      }
      if (step === 'confirm') {
        if (confirmVal !== pwdVal) { setError('Password tidak cocok'); setConfirmVal(''); return }
        setLoading(true)
        try { await onSetMaster(pwdVal); onClose() }
        catch { setError('Gagal menyimpan master password') }
        finally { setLoading(false) }
        return
      }
    }

    // --- Mode: ganti master password (verifikasi lama → set baru) ---
    if (mode === 'change-master') {
      if (step === 'master') {
        if (!pwdVal) { setError('Masukkan master password lama'); return }
        setLoading(true)
        const ok = await onVerifyMaster(pwdVal)
        setLoading(false)
        if (!ok) { setError('Master password salah'); setPwdVal(''); return }
        setStep('pin'); setPwdVal(''); setConfirmVal(''); setError('')
        setTimeout(() => inputRef.current?.focus(), 50)
        return
      }
      if (step === 'pin') {
        if (pwdVal.length < 4) { setError('Master password baru minimal 4 karakter'); return }
        setStep('confirm'); setConfirmVal('')
        setTimeout(() => inputRef.current?.focus(), 50)
        return
      }
      if (step === 'confirm') {
        if (confirmVal !== pwdVal) { setError('Password tidak cocok'); setConfirmVal(''); return }
        setLoading(true)
        try { await onSetMaster(pwdVal); onClose() }
        catch { setError('Gagal menyimpan master password') }
        finally { setLoading(false) }
        return
      }
    }
  }, [mode, step, pinVal, confirmVal, pwdVal, onSetPin, onUnlock, onVerifyMaster, onSetMaster, onClose])

  if (!open) return null

  // ── Konfigurasi tampilan per mode/step ──────
  const cfg = {
    set: {
      icon:  <Lock size={22} style={{ color: 'var(--accent)' }} />,
      title: step === 'confirm' ? 'Konfirmasi PIN' : 'Buat PIN Baru',
      desc:  step === 'confirm'
        ? 'Masukkan ulang PIN untuk konfirmasi.'
        : 'Buat PIN 4–6 angka. Berlaku untuk mengunci semua buku.',
    },
    unlock: {
      icon:  <Unlock size={22} style={{ color: 'var(--success)' }} />,
      title: 'Masukkan PIN',
      desc:  'Masukkan PIN untuk membuka kunci semua buku di sesi ini.',
    },
    change: {
      icon:  <KeyRound size={22} style={{ color: 'var(--warning)' }} />,
      title: step === 'master' ? 'Verifikasi Master Password'
           : step === 'newpin' || step === 'pin' ? 'PIN Baru'
           : 'Konfirmasi PIN Baru',
      desc:  step === 'master'
        ? 'Masukkan master password untuk mengganti PIN.'
        : step === 'newpin' || step === 'pin'
        ? 'Buat PIN baru 4–6 angka.'
        : 'Masukkan ulang PIN baru untuk konfirmasi.',
    },
    master: {
      icon:  <ShieldCheck size={22} style={{ color: 'var(--warning)' }} />,
      title: step === 'confirm' ? 'Konfirmasi Master Password' : 'Set Master Password',
      desc:  step === 'confirm'
        ? 'Masukkan ulang master password untuk konfirmasi.'
        : 'Master password digunakan untuk mengganti PIN jika lupa. Simpan dengan aman.',
    },
    'change-master': {
      icon:  <ShieldCheck size={22} style={{ color: 'var(--warning)' }} />,
      title: step === 'master' ? 'Verifikasi Master Lama'
           : step === 'pin'    ? 'Master Password Baru'
           :                     'Konfirmasi Master Baru',
      desc:  step === 'master'
        ? 'Masukkan master password lama untuk verifikasi.'
        : step === 'pin'
        ? 'Buat master password baru (minimal 4 karakter).'
        : 'Masukkan ulang master password baru untuk konfirmasi.',
    },
  }[mode]

  const isPasswordField = mode === 'master' || mode === 'change-master' || (mode === 'change' && step === 'master')
  const isMasterStep    = (mode === 'change' && step === 'master') || (mode === 'change-master' && step === 'master')

  const inputValue = (isMasterStep || (mode === 'change-master' && (step === 'pin' || step === 'confirm'))) ? (step === 'confirm' ? confirmVal : pwdVal)
    : mode === 'master' ? (step === 'confirm' ? confirmVal : pwdVal)
    : step === 'confirm' ? confirmVal
    : (mode === 'change' && step === 'master') ? pwdVal
    : pinVal

  const setInputValue = (v: string) => {
    if (mode === 'change-master') {
      step === 'confirm' ? setConfirmVal(v) : setPwdVal(v)
      return
    }
    if (isMasterStep) { setPwdVal(v); return }
    if (mode === 'master') { step === 'confirm' ? setConfirmVal(v) : setPwdVal(v); return }
    if (step === 'confirm') { setConfirmVal(v); return }
    // PIN: angka saja
    if (!/^\d*$/.test(v)) return
    setPinVal(v)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKey}
        style={{
          width: '100%', maxWidth: 480,
          background: 'var(--bg-elevated)',
          borderRadius: '20px 20px 0 0',
          padding: '24px 20px 32px',
        }}
      >
        {/* Handle bar */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'var(--border)', margin: '0 auto 20px',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'var(--bg-card)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {cfg.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              {cfg.title}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {cfg.desc}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Input */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <input
            ref={inputRef}
            type={isPasswordField ? (showPwd ? 'text' : 'password')
                : (showPin ? 'text' : 'password')}
            inputMode={isPasswordField ? 'text' : 'numeric'}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
            placeholder={isPasswordField ? 'Master password...' : 'Masukkan PIN (angka)...'}
            maxLength={isPasswordField ? 50 : 6}
            style={{
              width: '100%', padding: '14px 44px 14px 16px',
              borderRadius: 12, fontSize: 20,
              letterSpacing: inputValue ? 6 : 0,
              border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border-focus)'}`,
              background: 'var(--bg-input)', color: 'var(--text-primary)',
              outline: 'none', boxSizing: 'border-box',
              textAlign: 'center',
            }}
          />
          <button
            type="button"
            onClick={() => isPasswordField ? setShowPwd(v => !v) : setShowPin(v => !v)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 4,
            }}
          >
            {(isPasswordField ? showPwd : showPin) ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p style={{ fontSize: 12, color: 'var(--danger)', margin: '0 0 12px', textAlign: 'center' }}>
            {error}
          </p>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !inputValue}
          style={{
            width: '100%', padding: '14px',
            borderRadius: 12, fontSize: 14, fontWeight: 700,
            background: loading || !inputValue ? 'var(--bg-card)' : 'var(--accent)',
            color: loading || !inputValue ? 'var(--text-muted)' : '#fff',
            border: 'none', cursor: loading || !inputValue ? 'not-allowed' : 'pointer',
            marginTop: error ? 0 : 12,
            transition: 'background 150ms',
          }}
        >
          {loading ? 'Menyimpan...'
            : mode === 'unlock' ? 'Buka Kunci'
            : step === 'confirm' ? 'Konfirmasi & Simpan'
            : 'Lanjut'}
        </button>

        {/* Link ganti PIN (hanya saat mode unlock) */}
        {mode === 'unlock' && (
          <p style={{ textAlign: 'center', margin: '12px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
            Lupa PIN? Hubungi admin untuk reset via master password.
          </p>
        )}
      </div>
    </div>
  )
}
