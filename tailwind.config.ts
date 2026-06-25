import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0a0f0a',
          800: '#0d140d',
          750: '#0e160d',
          700: '#10180f',
          650: '#121b12',
          600: '#141e15',
          500: '#1c1812',
          400: '#2a2418',
        },
        void: { 900: '#1a1422', 800: '#241b30' },
        gold: {
          DEFAULT: '#cda45e',
          50: '#f9efd6',
          100: '#efe0a0',
          150: '#f0bd72',
          200: '#e8d3a1',
          300: '#d9d3c2',
          500: '#cda45e',
          700: '#a8823f',
        },
        jade: {
          200: '#a9bba4',
          300: '#9fb09b',
          400: '#8ba888',
          500: '#7d9079',
          600: '#6f8a6d',
          700: '#5e7a5d',
          800: '#3e4f3c',
        },
        ember: {
          200: '#f0a98e',
          500: '#d97757',
          700: '#e0654e',
        },
        spirit: {
          200: '#cdbcff',
          300: '#c2a6ee',
          400: '#a986d8',
          500: '#a78bfa',
          600: '#9b86b8',
        },
        azure: {
          300: '#7fbce8',
          400: '#9ec9e8',
          600: '#6aa3c4',
          700: '#5b9bd1',
        },
        leaf: { 400: '#6fae6e', 500: '#8fc98c' },
        blood: { 500: '#8a2f2f' },
      },
      fontFamily: {
        serif: ['Noto Serif', 'Noto Serif Vietnamese', 'Georgia', 'serif'],
        body: ['Be Vietnam Pro', 'system-ui', 'sans-serif'],
        story: ['var(--font-story)', 'Noto Serif', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glow-gold': '0 0 14px rgba(205, 164, 94, 0.18) inset',
        'glow-gold-outer': '0 0 26px rgba(205, 164, 94, 0.55)',
        'glow-spirit': '0 0 14px rgba(167, 139, 250, 0.6)',
        'glow-ember': '0 0 24px rgba(224, 101, 78, 0.85)',
        'inset-deep': 'inset 0 2px 8px rgba(0, 0, 0, 0.6)',
      },
      backgroundImage: {
        'gradient-ink': 'linear-gradient(176deg, #0a0f0a 0%, #0d140d 55%, #0a0f0a 100%)',
        'gradient-gold': 'linear-gradient(180deg, #e8d3a1, #cda45e)',
        'gradient-jade': 'linear-gradient(135deg, #8ba888 0%, #5e7a5d 100%)',
      },
      keyframes: {
        // UI animations
        'tt-rise': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'tt-drift': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-9px)' },
        },
        'tt-pulse': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        'tt-shimmer': {
          '0%': { backgroundPosition: '-180% 0' },
          '100%': { backgroundPosition: '180% 0' },
        },
        // Combat
        'm-pop': {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(.7)' },
          '14%': { opacity: '1', transform: 'translateY(-2px) scale(1.18)' },
          '34%': { opacity: '1', transform: 'translateY(-18px) scale(1)' },
          '54%': { opacity: '0', transform: 'translateY(-32px) scale(.95)' },
          '100%': { opacity: '0' },
        },
        'm-glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(224, 101, 78, .25)',
            borderColor: 'rgba(224, 101, 78, .35)',
          },
          '50%': {
            boxShadow: '0 0 24px rgba(224, 101, 78, .85)',
            borderColor: 'rgba(224, 101, 78, .95)',
          },
        },
        'm-ring': {
          '0%': { transform: 'scale(.2)', opacity: '.95' },
          '70%': { opacity: '.22' },
          '100%': { transform: 'scale(2.6)', opacity: '0' },
        },
        'm-bolt': {
          '0%, 100%': { opacity: '0', transform: 'scaleY(0)' },
          '5%': { opacity: '1', transform: 'scaleY(1)' },
          '26%': { opacity: '.7', transform: 'scaleY(1)' },
          '34%': { opacity: '0', transform: 'scaleY(1)' },
        },
      },
      animation: {
        'tt-rise': 'tt-rise 0.6s ease-out both',
        'tt-drift': 'tt-drift 3s ease-in-out infinite',
        'tt-pulse': 'tt-pulse 2.5s ease-in-out infinite',
        'tt-shimmer': 'tt-shimmer 2.6s linear infinite',
        'm-pop': 'm-pop 2.6s cubic-bezier(.34,1.56,.64,1) infinite',
        'm-glow': 'm-glow 2.4s ease-in-out infinite',
        'm-ring': 'm-ring 2.2s ease-out infinite',
        'm-bolt': 'm-bolt 3.4s ease-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
