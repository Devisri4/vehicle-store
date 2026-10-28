/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Colours carried over from the original site
      colors: {
        brand: { DEFAULT: '#003f88', light: '#e0eafc', lighter: '#cfdef3' },
        go: { DEFAULT: '#27ae60', dark: '#1e8449' },
        accent: { DEFAULT: '#f39c12', dark: '#e67e22' },
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
