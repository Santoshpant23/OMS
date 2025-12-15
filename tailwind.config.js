/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'success': '#10b981',
        'danger': '#ef4444',
        'warning': '#f59e0b',
        // Professional trading platform colors
        'primary': '#0066cc',
        'primary-dark': '#0052a3',
        'secondary': '#1a1a2e',
        'accent': '#00d4ff',
      }
    },
  },
  plugins: [],
}
