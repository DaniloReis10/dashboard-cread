const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Habilita o modo noturno baseado em classe
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        inter: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'ifce-green-primary': '#2f9e41',
        'ifce-green-dark': '#247a33',
        'ifce-gray-light': '#f5f5f5',
        'ifce-gray-medium': '#e0e0e0',
        'ifce-gray-dark': '#424242',

        // Cores para o Modo Noturno
        'dark-bg': '#1a202c',       // Fundo principal
        'dark-card': '#2d3748',      // Fundo dos cards
        'dark-border': '#4a5568',    // Bordas
        'dark-text-primary': '#edf2f7',// Texto principal
        'dark-text-secondary': '#a0aec0',// Texto secundário
      },
    },
  },
  plugins: [],
}