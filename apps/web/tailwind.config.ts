/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Deep Space Obsidian Sentinel Theme Tokens
        surface: '#050b14',
        'surface-dim': '#020617',
        'surface-bright': '#1e293b',
        'surface-container-lowest': '#020617',
        'surface-container-low': '#0a101f',
        'surface-container': '#0f172a',
        'surface-container-high': '#1e293b',
        'surface-container-highest': '#334155',
        'surface-variant': '#1e293b',
        'surface-tint': '#6366f1',
        'on-surface': '#f8fafc',
        'on-surface-variant': '#94a3b8',
        'inverse-surface': '#f8fafc',
        'inverse-on-surface': '#0f172a',
        outline: '#334155',
        'outline-variant': '#1e293b',

        // Cyber Threat Palette (Crimson for Scam / High Risk)
        primary: {
          DEFAULT: '#ef4444',
          container: '#dc2626',
          fixed: '#fee2e2',
          'fixed-dim': '#fca5a5',
        },
        'on-primary': '#ffffff',
        'on-primary-container': '#ffffff',
        'primary-container': '#ef4444',
        'primary-fixed': '#fee2e2',
        'primary-fixed-dim': '#fca5a5',
        'on-primary-fixed': '#7f1d1d',
        'on-primary-fixed-variant': '#991b1b',
        'inverse-primary': '#f87171',

        // Telemetry & Nominal Safe Palette (Electric Emerald)
        secondary: {
          DEFAULT: '#10b981',
          container: '#059669',
          fixed: '#d1fae5',
          'fixed-dim': '#6ee7b7',
        },
        'on-secondary': '#ffffff',
        'secondary-container': '#059669',
        'on-secondary-container': '#ffffff',
        'secondary-fixed': '#d1fae5',
        'secondary-fixed-dim': '#6ee7b7',
        'on-secondary-fixed': '#064e3b',
        'on-secondary-fixed-variant': '#065f46',

        // Caution & Suspicious Palette (Radiant Amber)
        tertiary: {
          DEFAULT: '#f59e0b',
          container: '#d97706',
          fixed: '#fef3c7',
          'fixed-dim': '#fcd34d',
        },
        'on-tertiary': '#ffffff',
        'tertiary-container': '#d97706',
        'on-tertiary-container': '#ffffff',
        'tertiary-fixed': '#fef3c7',
        'tertiary-fixed-dim': '#fcd34d',
        'on-tertiary-fixed': '#78350f',
        'on-tertiary-fixed-variant': '#92400e',

        // Error & Emergency Alert Palette
        error: {
          DEFAULT: '#f43f5e',
          container: '#e11d48',
        },
        'error-container': '#e11d48',
        'on-error': '#ffffff',
        'on-error-container': '#ffffff',

        // Electric Indigo & Cyber Accent
        indigo: {
          DEFAULT: '#6366f1',
          container: '#4f46e5',
          glow: 'rgba(99, 102, 241, 0.4)',
        },

        // Obsidian Core Dark Architecture
        obsidian: {
          DEFAULT: '#050b14',
          depth: '#020617',
          surface: '#0a101f',
          card: '#0f172a',
          elevated: '#1e293b',
        },
        border: 'rgba(255, 255, 255, 0.08)',
        input: '#0f172a',
        ring: '#6366f1',
        background: '#050b14',
        foreground: '#f8fafc',
      },
      fontFamily: {
        headline: ['"Space Grotesk"', 'sans-serif'],
        'headline-xl': ['"Space Grotesk"', 'sans-serif'],
        'headline-lg': ['"Space Grotesk"', 'sans-serif'],
        'headline-md': ['"Space Grotesk"', 'sans-serif'],
        body: ['Geist', 'Inter', 'sans-serif'],
        'body-lg': ['Geist', 'Inter', 'sans-serif'],
        'body-md': ['Geist', 'Inter', 'sans-serif'],
        'body-sm': ['Geist', 'Inter', 'sans-serif'],
        code: ['"JetBrains Mono"', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
        'code-telemetry': ['"JetBrains Mono"', 'monospace'],
        'label-lg': ['"JetBrains Mono"', 'monospace'],
        'label-md': ['"JetBrains Mono"', 'monospace'],
        'label-sm': ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
