/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#b9e6fd",
        secondary: "#d7f2fb",
      },
      fontFamily: {
        sans: ["Zain", "Roboto", "sans-serif"],
      },
    },
  },
  safelist: ["bg-primary", "bg-secondary"],
  plugins: [],
};
