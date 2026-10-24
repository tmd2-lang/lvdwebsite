/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF9F6',
        primaryDark: '#4A3F35',
        accent: '#C4886B',
        accentHover: '#A06850',
        textLight: '#4A3F35',
        textDark: '#FAF8F5',
        mutedText: '#8C7E73',
        subtleBorder: '#E5E0DA',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Lato"', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      },
    },
  },
  plugins: [],
}
