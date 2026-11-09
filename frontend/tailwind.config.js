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
        navy: {
          950: '#070b14',
          900: '#0b1329',
          850: '#101a38',
          800: '#16224d',
          700: '#1f3066',
        },
        electric: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        neon: {
          purple: '#a855f7',
          pink: '#ec4899',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b'
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0b1329 0%, #16224d 50%, #2e1065 100%)',
      }
    },
  },
  plugins: [],
}
