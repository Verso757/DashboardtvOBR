/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        yaqui: {
          red: '#DC2626',
          dark: '#0f172a',
          card: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
