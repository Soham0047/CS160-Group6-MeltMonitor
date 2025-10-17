/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // Tells Tailwind where to look for classes
  ],
  theme: {
    extend: {},  // Where you customize colors, fonts, spacing, etc.
  },
  plugins: [],  // Where you add Tailwind plugins
}