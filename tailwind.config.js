/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          dark: '#0c0d10',
          panel: '#14161b',
          surface: '#1c1f26',
          border: 'rgba(255, 255, 255, 0.08)',
          accent: '#e63946',
          brass: '#c48b52',
          muted: '#8e929b'
        }
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
