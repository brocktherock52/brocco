import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', md: '2rem' },
      screens: { '2xl': '1240px' },
    },
    extend: {
      colors: {
        bg: {
          0: '#0A0A0F',
          1: '#0E0E16',
          2: '#13131D',
          3: '#1A1A26',
        },
        ink: {
          DEFAULT: '#E9EEF1',
          dim: '#A8B0BC',
          faint: '#6B7280',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          strong: 'rgba(255,255,255,0.14)',
        },
        brand: {
          DEFAULT: '#7C3AED',
          glow: '#A78BFA',
          deep: '#4C1D95',
        },
        cyan: {
          DEFAULT: '#22D3EE',
          glow: '#67E8F9',
        },
        accent: {
          gold: '#FBBF24',
          rose: '#FB7185',
          green: '#22C55E',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        serif: [
          'Newsreader',
          'ui-serif',
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'Times',
          'serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      fontSize: {
        // tighter, premium scale
        'display-2xl': ['clamp(3rem, 7vw, 5.75rem)', { lineHeight: '1.02', letterSpacing: '-0.035em', fontWeight: '700' }],
        'display-xl': ['clamp(2.5rem, 5.5vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg': ['clamp(2rem, 4vw, 3.25rem)', { lineHeight: '1.08', letterSpacing: '-0.025em', fontWeight: '700' }],
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'radial-glow':
          'radial-gradient(60% 60% at 50% 0%, rgba(124,58,237,0.18) 0%, rgba(34,211,238,0.10) 35%, transparent 70%)',
        'brand-gradient':
          'linear-gradient(135deg, #A78BFA 0%, #22D3EE 60%, #67E8F9 100%)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(124,58,237,0.35), 0 8px 30px rgba(124,58,237,0.25), 0 30px 80px rgba(34,211,238,0.10)',
        glow2: '0 10px 40px -10px rgba(124,58,237,0.55)',
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 30px 60px -30px rgba(0,0,0,0.6)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        shine: 'shine 2.5s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
