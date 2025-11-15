/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0ea5e9", // Голубой акцент (можно поменять на фирменный)
        dark: "#111827",
        light: "#f9fafb",
      },
    },
  },
  plugins: [],
};
