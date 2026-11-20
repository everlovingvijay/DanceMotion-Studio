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
        studio: {
          bg: '#0a0a0c',
          panel: '#121217',
          card: '#181820',
          border: '#242430',
          hover: '#2a2a38',
          accent: '#6366f1',
          accentHover: '#4f46e5',
          silhouette: '#888888',
          pureBlack: '#000000',
        }
      }
    },
  },
  plugins: [],
}
