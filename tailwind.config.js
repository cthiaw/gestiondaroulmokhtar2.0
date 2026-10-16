/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Vert de l'école : couleur principale de l'interface
        brand: {
          50: '#ecfdf3',
          100: '#d1fae1',
          200: '#a6f3c7',
          300: '#6be6a6',
          400: '#30cf80',
          500: '#0fb566',
          600: '#059352',
          700: '#067545',
          800: '#0a5c39',
          900: '#0a4b30',
          950: '#032a1a',
        },
        // Doré : accent discret
        accent: {
          50: '#fffaeb',
          100: '#fef0c7',
          400: '#f5b83d',
          500: '#e99a14',
          600: '#c9760d',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(16 24 40 / 0.05), 0 1px 3px 0 rgb(16 24 40 / 0.06)',
      },
    },
  },
  plugins: [],
};
