/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#080c14',
          card: '#0d1527',
          cardHover: '#131f37',
          border: '#1e293b',
          borderGlow: '#06b6d4',
          primary: '#06b6d4',
          primaryGlow: 'rgba(6, 182, 212, 0.25)',
          accent: '#10b981',
          danger: '#ef4444',
          warning: '#f59e0b',
          muted: '#64748b',
          text: '#f8fafc',
          subtext: '#94a3b8'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'cyber-glow': '0 0 25px -5px rgba(6, 182, 212, 0.3)',
        'danger-glow': '0 0 25px -5px rgba(239, 68, 68, 0.3)',
        'success-glow': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
