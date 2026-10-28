/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Scale built around the original site's #003f88
        brand: {
          DEFAULT: '#003f88',
          50: '#eef4ff',
          100: '#dbe7fb',
          200: '#b7cdf5',
          300: '#8aaee9',
          400: '#4f82d4',
          500: '#1d5fbf',
          600: '#0f4fa8',
          700: '#003f88',
          800: '#00336e',
          900: '#002654',
        },
        accent: { DEFAULT: '#f39c12', dark: '#e67e22' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
