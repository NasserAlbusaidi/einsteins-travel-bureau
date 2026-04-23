/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        paper: {
          DEFAULT: '#f1e6ce',
          light: '#f8f0dc',
          dark: '#e2d1a9',
          darker: '#c9b584',
        },
        ink: {
          DEFAULT: '#1a2332',
          light: '#425066',
          softer: '#6c7a8f',
          faint: '#9ba7b8',
        },
        terracotta: {
          DEFAULT: '#b5482d',
          dark: '#8e3620',
          light: '#d46a4c',
        },
        olive: {
          DEFAULT: '#6b7043',
          dark: '#4e5230',
          light: '#8a8f5c',
        },
        mustard: {
          DEFAULT: '#c89f4a',
          dark: '#a07d2e',
        },
        stamp: {
          red: '#a92525',
          blue: '#2c4c7c',
          green: '#3c6447',
        },
      },
      boxShadow: {
        ticket: '0 1px 0 rgba(26,35,50,0.08), 0 8px 24px -12px rgba(26,35,50,0.18)',
        stamp: '0 1px 0 rgba(26,35,50,0.08)',
      },
      backgroundImage: {
        'paper-grain':
          "radial-gradient(rgba(139,115,78,0.08) 1px, transparent 1px), radial-gradient(rgba(139,115,78,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grain': '14px 14px, 20px 20px',
      },
    },
  },
  plugins: [],
}
