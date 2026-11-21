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
        // Deep Space Obsidian Sentinel Theme Tokens (Neutral Obsidian Charcoal)
        surface: '#0f131c',
        'surface-dim': '#0a0e17',
        'surface-bright': '#31353f',
        'surface-container-lowest': '#0a0e17',
        'surface-container-low': '#181b25',
        'surface-container': '#1c1f29',
        'surface-container-high': '#262a34',
        'surface-container-highest': '#31353f',
        'surface-variant': '#31353f',
        'surface-tint': '#ef4444',
        'on-surface': '#dfe2ef',
        'on-surface-variant': '#94a3b8',
        'inverse-surface': '#dfe2ef',
        'inverse-on-surface': '#181b25',
        outline: '#334155',
        'outline-variant': '#1e293b',

        // Cyber Threat Palette (Crimson for Scam / High Risk / Threat Actions)
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

        // Telemetry & Nominal Safe Palette (Electric Emerald / Mint Green)
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

        // Compatibility alias: map indigo references to emerald
        indigo: {
          DEFAULT: '#10b981',
          container: '#059669',
          glow: 'rgba(16, 185, 129, 0.4)',
        },

        // Obsidian Core Dark Architecture (Charcoal Dark Base)
        obsidian: {
          DEFAULT: '#0f131c',
          depth: '#0a0e17',
          surface: '#181b25',
          card: '#1c1f29',
          elevated: '#262a34',
        },
        border: 'rgba(255, 255, 255, 0.08)',
        input: '#181b25',
        ring: '#10b981',
        background: '#0f131c',
        foreground: '#dfe2ef',
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
