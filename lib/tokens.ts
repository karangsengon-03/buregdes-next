// ─────────────────────────────────────────────
// BuRegDes Next — Design Tokens
// ─────────────────────────────────────────────

export const tokens = {
  // ── Font ─────────────────────────────────────
  font: {
    sans: "'Plus Jakarta Sans', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },

  // ── Typography Scale ──────────────────────────
  type: {
    display:    { size: '22px', weight: '800', usage: 'Nama apps di login' },
    h1:         { size: '18px', weight: '700', usage: 'Judul buku aktif' },
    h2:         { size: '15px', weight: '600', usage: 'Label section, judul modal' },
    body:       { size: '14px', weight: '400', usage: 'Isi tabel, konten umum' },
    bodySmall:  { size: '12px', weight: '400', usage: 'Sub-label, meta info' },
    caption:    { size: '11px', weight: '500', usage: 'Badge, tag, kode buku' },
    mono:       { size: '13px', weight: '400', usage: 'Nomor surat, tanggal, kode' },
  },

  // ── Colors Dark ───────────────────────────────
  dark: {
    bgApp:       '#0D1B2A',
    bgCard:      '#1B2B3E',
    bgSidebar:   '#0A1628',
    bgElevated:  '#243447',
    accent:      '#3B82F6',
    accentHover: '#2563EB',
    accentSubtle:'rgba(59,130,246,0.12)',
    textPrimary: '#F1F5F9',
    textSecondary:'#94A3B8',
    textMuted:   '#475569',
    textAccent:  '#93C5FD',
    border:      '#1E3A5F',
    borderFocus: '#3B82F6',
    success:     '#10B981',
    warning:     '#F59E0B',
    danger:      '#EF4444',
  },

  // ── Colors Light ──────────────────────────────
  light: {
    bgApp:       '#F8FAFC',
    bgCard:      '#FFFFFF',
    bgSidebar:   '#1A3C5E',
    bgElevated:  '#FFFFFF',
    accent:      '#2563EB',
    accentHover: '#1A3C5E',
    accentSubtle:'rgba(37,99,235,0.08)',
    textPrimary: '#0F172A',
    textSecondary:'#475569',
    textMuted:   '#94A3B8',
    textAccent:  '#2563EB',
    border:      '#E2E8F0',
    borderFocus: '#2563EB',
    success:     '#10B981',
    warning:     '#F59E0B',
    danger:      '#EF4444',
  },
} as const
