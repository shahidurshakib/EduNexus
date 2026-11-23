/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#eef1f7',
          100: '#d7ddec',
          200: '#aeb9d6',
          300: '#8391b9',
          400: '#5c6a99',
          500: '#3d4a78',
          600: '#2b3760',
          700: '#1f2a4a',
          800: '#151d36',
          900: '#0d1224',
          950: '#080b17',
        },
        gold: {
          50: '#fbf5e8',
          100: '#f3e2b9',
          200: '#eacd86',
          300: '#e0b854',
          400: '#d9a441',
          500: '#c48f2e',
          600: '#9c7124',
          700: '#74531a',
          800: '#4d3711',
          900: '#271c08',
        },
        moss: {
          50: '#e9f4f1',
          100: '#c3e1da',
          200: '#98cdc0',
          300: '#6bb8a5',
          400: '#48a58e',
          500: '#2f8f82',
          600: '#25776c',
          700: '#1c5e55',
          800: '#13453f',
          900: '#0a2c28',
        },
        paper: '#f7f5f0',
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(13,18,36,0.06), 0 8px 24px -8px rgba(13,18,36,0.12)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        growBar: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease-out both',
        'fade-in': 'fadeIn 0.9s ease-out both',
        'float-slow': 'floatSlow 5s ease-in-out infinite',
        'grow-bar': 'growBar 1s ease-out both',
      },
    },
  },
  plugins: [],
}
