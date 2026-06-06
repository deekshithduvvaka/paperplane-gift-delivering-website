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
        // Custom Harmonious logistics theme colors (Sky blue / slate / indigo details)
        brand: {
          50: '#f4f6fb',
          100: '#e9edf7',
          200: '#cbd5ee',
          300: '#9cb0de',
          400: '#6885ca',
          500: '#4663b6',
          600: '#344b9a',
          700: '#2a3b7c',
          800: '#233064',
          900: '#1b244d',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
