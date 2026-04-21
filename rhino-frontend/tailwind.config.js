/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  '#fefcf7',
          100: '#fdf7ed',
          200: '#f9edd6',
          300: '#f3ddb0',
          400: '#e8c47a',
        },
        savanna: {
          950: '#0d0b08',
          900: '#1a1610',
          800: '#2a2218',
          700: '#3d3324',
        },
        ochre: {
          DEFAULT: '#c8852a',
          light:   '#e09a3a',
          dark:    '#a06820',
        },
        dust: {
          DEFAULT: '#d4c5a9',
          muted:   '#8a7d6a',
        },
        conservation: {
          DEFAULT: '#4a9e6b',
          light:   '#5ab87c',
          dark:    '#3a7e55',
        },
      },
      fontFamily: {
        sans:    ['"Nunito"', 'sans-serif'],
        display: ['"Nunito"', 'sans-serif'],
        body:    ['"Nunito"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        zoo: '1.25rem',
      },
    },
  },
  plugins: [],
}