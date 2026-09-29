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
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        brand: {
          purple: '#7c3aed',
          violet: '#8b5cf6',
          indigo: '#6366f1',
          blue: '#3b82f6',
          green: '#10b981',
          emerald: '#059669',
          teal: '#14b8a6',
          orange: '#f97316',
          pink: '#ec4899',
          rose: '#f43f5e',
        },
        dark: {
          bg: '#0f172a',
          surface: '#1e293b',
          card: '#1e293b',
          border: '#334155',
          text: '#f1f5f9',
          muted: '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'gradient': 'gradientBG 6s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideInRight: { '0%': { transform: 'translateX(20px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        gradientBG: { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        glow: { '0%': { boxShadow: '0 0 5px rgba(124,58,237,0.4)' }, '100%': { boxShadow: '0 0 20px rgba(124,58,237,0.8)' } },
      },
      backgroundSize: { '200%': '200% 200%' },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(124,58,237,0.3)',
        'glow': '0 0 20px rgba(124,58,237,0.4)',
        'glow-lg': '0 0 40px rgba(124,58,237,0.5)',
        'glow-green': '0 0 20px rgba(16,185,129,0.4)',
        'glow-blue': '0 0 20px rgba(59,130,246,0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.12)',
        'card-dark': '0 4px 24px rgba(0,0,0,0.4)',
      }
    },
  },
  plugins: [],
}
