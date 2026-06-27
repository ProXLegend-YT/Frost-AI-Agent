import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        agent: {
          bg: '#080810',
          surface: '#12121e',
          card: '#1a1a2e',
          border: '#2a2a40',
          accent: '#7c3aed',
          'accent-light': '#a855f7',
          'accent-glow': '#7c3aed33',
          text: '#e2e8f0',
          muted: '#64748b',
        }
      },
      animation: {
        'bounce-dot': 'bounce 1s infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 5px #7c3aed44' }, '50%': { boxShadow: '0 0 20px #7c3aed88' } },
      }
    },
  },
  plugins: [],
}
export default config
