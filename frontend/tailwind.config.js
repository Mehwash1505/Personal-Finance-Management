/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'primary': '#3B82F6', // A vibrant, trustworthy blue
        'primary-hover': '#2563EB',
        'secondary': '#10B981', // A clear green for income/success
        'danger': '#EF4444', // A sharp red for expenses/logout
        'background': '#0D1117', // Deep space charcoal
        'surface': '#161B22', // Lighter gray for cards
        'surface-dark': '#2a2a3e', 
        'border': '#30363d',
        'text-light': '#E6EDF3',
        'text-muted': '#7d8590',
      },
    },
  },
  plugins: [],
};