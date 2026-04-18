import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display': ['22px', { lineHeight: '1.2', fontWeight: '800' }],
        'h1':      ['18px', { lineHeight: '1.3', fontWeight: '700' }],
        'h2':      ['15px', { lineHeight: '1.4', fontWeight: '600' }],
        'body':    ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
        'caption': ['11px', { lineHeight: '1.3', fontWeight: '500' }],
        'mono-sm': ['13px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      colors: {
        // Dark mode palette
        'bg-app':       '#0D1B2A',
        'bg-card':      '#1B2B3E',
        'bg-sidebar':   '#0A1628',
        'bg-elevated':  '#243447',
        // Accent
        'accent':       '#3B82F6',
        'accent-hover': '#2563EB',
        // Text
        'text-primary':   '#F1F5F9',
        'text-secondary': '#94A3B8',
        'text-muted':     '#475569',
        'text-accent':    '#93C5FD',
        // Border
        'br-default':  '#1E3A5F',
        'br-focus':    '#3B82F6',
        // Status
        'success':  '#10B981',
        'warning':  '#F59E0B',
        'danger':   '#EF4444',
      },
      boxShadow: {
        'card':    '0 8px 32px rgba(0,0,0,0.45)',
        'sidebar': '4px 0 20px rgba(0,0,0,0.4)',
        'modal':   '0 20px 60px rgba(0,0,0,0.5)',
        'sm-dark': '0 2px 8px rgba(0,0,0,0.3)',
      },
      animation: {
        'fade-up':   'fadeUp 0.4s ease-out',
        'fade-in':   'fadeIn 0.3s ease-out',
        'slide-up':  'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
        'spin-slow': 'spin 1.2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px) scale(0.97)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
