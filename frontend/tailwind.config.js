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
        flipkart: {
          blue: {
            DEFAULT: '#2874f0',
            dark: '#1e59bc',
            light: '#f1f3f6',
          },
          orange: {
            DEFAULT: '#fb641b',
            dark: '#e04e0a',
          },
          yellow: {
            DEFAULT: '#ffc200',
            dark: '#dca700',
          },
          darkBg: '#121212',
          darkCard: '#1e1e1e',
        }
      },
      boxShadow: {
        'nav': '0 2px 4px 0 rgba(0,0,0,.08)',
        'card': '0 2px 8px 0 rgba(0,0,0,.06)',
        'product': '0 4px 16px 0 rgba(0,0,0,.08)',
      }
    },
  },
  plugins: [],
}
