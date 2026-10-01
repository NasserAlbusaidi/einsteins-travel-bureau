/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
        sans: ['"Jost Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // The night sky the whole bureau sits in.
        night: {
          950: '#05070f',
          900: '#090d20',
          850: '#0d1330',
          800: '#121a3c',
          700: '#1b2550',
          600: '#2a3567',
          500: '#3e4a83',
        },
        // Card stock for tickets and posters.
        cream: {
          DEFAULT: '#f4ead4',
          50: '#fbf6ea',
          200: '#eadcbb',
          300: '#dcc89c',
        },
        // Deco brass: brand chrome, rules, ornaments.
        gold: {
          DEFAULT: '#e3b04b',
          300: '#f3d38a',
          600: '#b88a2c',
          700: '#8c6820',
        },
        // Colour semantics used everywhere: coral is YOU, teal is HOME.
        you: {
          DEFAULT: '#ff7b54',
          300: '#ffa384',
          600: '#e0582f',
          700: '#b2401c',
        },
        home: {
          DEFAULT: '#4fd1c5',
          300: '#8be6dc',
          600: '#22a094',
          700: '#126b62',
        },
        mist: {
          100: '#dde1f2',
          200: '#c3c9e6',
          300: '#a3abd3',
          400: '#8690bf',
          500: '#646e9f',
        },
        ink: {
          DEFAULT: '#161a33',
          2: '#41465f',
          3: '#6a6e86',
        },
        alarm: '#ff5d5d',
        go: '#7ddc9a',
      },
      boxShadow: {
        ticket: '0 1px 0 rgba(255,255,255,0.4) inset, 0 30px 60px -20px rgba(0,0,0,0.65), 0 12px 24px -12px rgba(0,0,0,0.5)',
        glow: '0 0 0 1px rgba(227,176,75,0.35), 0 0 40px -8px rgba(227,176,75,0.35)',
        panel: '0 30px 60px -30px rgba(0,0,0,0.7)',
      },
      letterSpacing: {
        deco: '0.32em',
      },
    },
  },
  plugins: [],
}
