'use client'
// ─────────────────────────────────────────────
// BuRegDes Next — /app/settings page (Session 6)
// Halaman Pengaturan: Info Desa + Tahun Aktif + Tentang
// ─────────────────────────────────────────────

import { useState, useCallback, useEffect } from 'react'
import {
  MapPin, CheckCircle2, AlertTriangle, ChevronDown,
  Info, Wifi, Building2, Save,
  ChevronRight, ShieldCheck, KeyRound} from 'lucide-react'
import { useSettings, APP_VERSION, APP_NAME, APP_DESC } from '@/hooks/useSettings'
import { useLock } from '@/hooks/useLock'
import { LockModal } from '@/components/ui/LockModal'
import type { LockModalMode } from '@/components/ui/LockModal'

// ── Section wrapper ───────────────────────────
function Section({
  icon,
  title,
  subtitle,
  badge,
  children}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: 14,
        border: '1px solid var(--border)',
        overflow: 'hidden',
        marginBottom: 12}}
    >
      {/* Section header */}
      <div
        style={{
          padding: '14px 16px 10px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10}}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: 'var(--accent-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0}}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            {title}
          </p>
          {subtitle && (
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
              {subtitle}
            </p>
          )}
        </div>
        {badge}
      </div>

      {/* Section content */}
      <div style={{ padding: '14px 16px' }}>
        {children}
      </div>
    </div>
  )
}

// ── Field row (label + input) ─────────────────
function FieldRow({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label
        style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 5}}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '9px 12px',
          borderRadius: 9,
          border: '1.5px solid var(--border)',
          background: disabled ? 'var(--bg-app)' : 'var(--bg-input)',
          color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
          fontSize: 13,
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 150ms',
          cursor: disabled ? 'not-allowed' : 'text'}}
        onFocus={e => {
          if (!disabled) e.currentTarget.style.borderColor = 'var(--border-focus)'
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = 'var(--border)'
        }}
      />
    </div>
  )
}

// ── Year selector button ──────────────────────
function YearButton({
  year,
  active,
  onClick}: {
  year: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '10px 4px',
        borderRadius: 9,
        border: active ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
        background: active ? 'var(--accent-subtle)' : 'var(--bg-input)',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
        cursor: 'pointer',
        transition: 'all 150ms'}}
    >
      {year}
    </button>
  )
}

// ── Info row (label + value, read-only) ───────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '9px 0',
        borderBottom: '1px solid var(--border)'}}
    >
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      <span
        style={{
          fontSize: 12,
          fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
          color: 'var(--text-secondary)',
          fontWeight: 600}}
      >
        {value}
      </span>
    </div>
  )
}

// ── Main Settings page ────────────────────────
export default function SettingsPage() {
  const {
    desaInfo,
    desaStatus,
    updateDesaInfo,
    isDesaComplete,
    activeYear,
    availableYears,
    setActiveYear,
    showToast} = useSettings()

  const {
    hasPin, hasMasterHash, isGlobalLocked,
    setPin, unlock, verifyMaster, setMasterHash} = useLock(activeYear)

  const [lockOpen, setLockOpen] = useState(false)
  const [lockMode, setLockMode] = useState<LockModalMode>('set')

  const openMasterSetup = useCallback(() => {
    setLockMode(hasMasterHash ? 'change-master' : 'master')
    setLockOpen(true)
  }, [hasMasterHash])

  const openChangePIN = useCallback(() => {
    setLockMode(hasPin ? 'change' : 'set')
    setLockOpen(true)
  }, [hasPin])

  // Local draft state untuk Info Desa
  const [draft, setDraft] = useState({
    desa:       desaInfo.desa       ?? '',
    kecamatan:  desaInfo.kecamatan  ?? '',
    kabupaten:  desaInfo.kabupaten  ?? '',
    provinsi:   desaInfo.provinsi   ?? '',
    tahun:      desaInfo.tahun      ?? ''})
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty]   = useState(false)

  // Sync draft saat data pertama kali masuk dari RTDB
  useEffect(() => {
    if (desaStatus === 'ready' && !dirty) {
      setDraft({
        desa:      desaInfo.desa       ?? '',
        kecamatan: desaInfo.kecamatan  ?? '',
        kabupaten: desaInfo.kabupaten  ?? '',
        provinsi:  desaInfo.provinsi   ?? '',
        tahun:     desaInfo.tahun      ?? ''})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desaStatus])

  const setField = useCallback((field: string, value: string) => {
    setDraft(prev => ({ ...prev, [field]: value }))
    setDirty(true)
  }, [])

  const handleSaveDesa = useCallback(async () => {
    if (!draft.desa.trim()) {
      showToast({ message: 'Nama desa tidak boleh kosong', variant: 'error' })
      return
    }
    setSaving(true)
    try {
      await updateDesaInfo(draft)
      showToast({ message: 'Info desa berhasil disimpan', variant: 'success' })
      setDirty(false)
    } catch {
      showToast({ message: 'Gagal menyimpan info desa', variant: 'error' })
    } finally {
      setSaving(false)
    }
  }, [draft, updateDesaInfo, showToast])

  const handleYearChange = useCallback(
    (year: string) => {
      setActiveYear(year)
      showToast({
        message: `Tahun aktif: ${year}`,
        variant: 'success',
        duration: 1500})
    },
    [setActiveYear, showToast]
  )

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch'}}
    >
      {/* Page header */}
      <div
        style={{
          padding: '16px 16px 0',
          marginBottom: 16}}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'}}
        >
          Pengaturan
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
          Konfigurasi aplikasi BuRegDes Next
        </p>
      </div>

      <div style={{ padding: '0 12px 24px' }}>

        {/* ── Section: Info Desa ─────────────── */}
        <Section
          icon={<MapPin size={16} style={{ color: 'var(--accent)' }} />}
          title="Info Desa"
          subtitle="Identitas desa untuk header laporan & export"
          badge={
            isDesaComplete ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  borderRadius: 8,
                  background: 'rgba(16,185,129,0.12)',
                  color: 'var(--success)',
                  fontSize: 10,
                  fontWeight: 700}}
              >
                <CheckCircle2 size={11} />
                Lengkap
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  borderRadius: 8,
                  background: 'rgba(245,158,11,0.12)',
                  color: 'var(--warning)',
                  fontSize: 10,
                  fontWeight: 700}}
              >
                <AlertTriangle size={11} />
                Belum lengkap
              </div>
            )
          }
        >
          {desaStatus === 'loading' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[100, 80, 70, 60, 50].map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: 38,
                    borderRadius: 9,
                    background: 'var(--border)',
                    width: `${w}%`,
                    animation: 'pulse 1.4s ease-in-out infinite'}}
                />
              ))}
              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
            </div>
          ) : (
            <>
              <FieldRow
                label="Nama Desa"
                value={draft.desa}
                onChange={v => setField('desa', v)}
                placeholder="cth. Karang Sengon"
              />
              <FieldRow
                label="Kecamatan"
                value={draft.kecamatan}
                onChange={v => setField('kecamatan', v)}
                placeholder="cth. Sumberjambe"
              />
              <FieldRow
                label="Kabupaten"
                value={draft.kabupaten}
                onChange={v => setField('kabupaten', v)}
                placeholder="cth. Jember"
              />
              <FieldRow
                label="Provinsi"
                value={draft.provinsi}
                onChange={v => setField('provinsi', v)}
                placeholder="cth. Jawa Timur"
              />
              <FieldRow
                label="Tahun (untuk header)"
                value={draft.tahun}
                onChange={v => setField('tahun', v)}
                placeholder="cth. 2025"
              />

                            {/* Save button */}
              <button
                onClick={handleSaveDesa}
                disabled={saving || !dirty}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: dirty ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: dirty ? '#fff' : 'var(--text-muted)',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: dirty ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  transition: 'background 150ms, color 150ms',
                  opacity: saving ? 0.7 : 1}}
                onMouseEnter={e => {
                  if (dirty && !saving) e.currentTarget.style.background = 'var(--accent-hover)'
                }}
                onMouseLeave={e => {
                  if (dirty) e.currentTarget.style.background = 'var(--accent)'
                }}
              >
                <Save size={14} />
                {saving ? 'Menyimpan...' : dirty ? 'Simpan Info Desa' : 'Tersimpan'}
              </button>
            </>
          )}
        </Section>

                {/* ── Section: Keamanan ──────────────── */}
        <Section
          icon={<ShieldCheck size={16} style={{ color: 'var(--warning)' }} />}
          title="Keamanan"
        >
          {/* PIN kunci buku */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px' }}>
                PIN Kunci Buku
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                {hasPin ? (isGlobalLocked ? 'Buku sedang terkunci' : 'PIN aktif — buku tidak terkunci') : 'Belum ada PIN'}
              </p>
            </div>
            <button
              onClick={openChangePIN}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600,
                border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)', cursor: 'pointer', flexShrink: 0}}
            >
              <KeyRound size={13} />
              {hasPin ? 'Ganti PIN' : 'Set PIN'}
            </button>
          </div>
          {/* Master password */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px' }}>
                Master Password
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                {hasMasterHash ? 'Sudah diset — dipakai jika lupa PIN' : 'Belum diset — direkomendasikan'}
              </p>
            </div>
            <button
              onClick={openMasterSetup}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600,
                border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)', cursor: 'pointer', flexShrink: 0}}
            >
              <ShieldCheck size={13} />
              {hasMasterHash ? 'Ganti' : 'Set'}
            </button>
          </div>
        </Section>

        {/* ── Section: Tentang Aplikasi ──────── */}
        <Section
          icon={<Info size={16} style={{ color: 'var(--accent)' }} />}
          title="Tentang Aplikasi"
        >
          {/* App identity */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '4px 0 14px',
              borderBottom: '1px solid var(--border)',
              marginBottom: 4}}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'var(--accent-subtle)',
                border: '1.5px solid var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0}}
            >
              <Building2 size={22} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                {APP_NAME}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {APP_DESC}
              </p>
            </div>
          </div>

          <InfoRow label="Versi" value={`v${APP_VERSION}`} />
          <InfoRow label="Stack" value="Next.js · Firebase · TypeScript" />
          <InfoRow label="Deploy" value="Vercel · Auto" />

                  </Section>

      </div>

      {/* LockModal — Session 9 */}
      <LockModal
        open={lockOpen}
        mode={lockMode}
        hasMasterHash={hasMasterHash}
        onClose={() => setLockOpen(false)}
        onSetPin={setPin}
        onUnlock={unlock}
        onVerifyMaster={verifyMaster}
        onSetMaster={setMasterHash}
      />
    </div>
  )
}
