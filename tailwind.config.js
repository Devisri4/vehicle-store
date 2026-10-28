import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Cool blue-grey neutrals sit better next to navy than Tailwind's default warm greys
        gray: colors.slate,
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
          950: '#001a3d',
        },
        accent: { DEFAULT: '#f39c12', dark: '#e67e22' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        'card-hover': '0 16px 32px -12px rgb(15 23 42 / 0.18), 0 4px 8px -4px rgb(15 23 42 / 0.06)',
      },
    },
  },
  plugins: [],
};
