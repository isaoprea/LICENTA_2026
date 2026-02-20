/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // SCHIMBĂ ACEASTĂ LINIE:
  darkMode: 'class', // <--- Aceasta îi spune lui Tailwind: "Ignoră Google/Windows, uită-te la clasa .dark"
  theme: {
    extend: {},
  },
  plugins: [],
}