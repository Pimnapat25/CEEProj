/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fresh: {
          50:  '#f0faf4',
          100: '#d6f0e0',
          200: '#aedfc4',
          300: '#7dcba4',
          400: '#4fb884',
          500: '#2ea06a',
          600: '#1f7d52',
        },
      },
    },
  },
  plugins: [],
}
