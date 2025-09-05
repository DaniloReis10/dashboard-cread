/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'ifce-primary': '#008037', // A standard green for IFCE
        'ifce-dark': '#004d21',   // A darker shade
      },
    },
  },
  plugins: [],
}

