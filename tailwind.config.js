/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "hsl(215 75% 22%)",
        accent: "hsl(0 75% 48%)",
        reserve: "hsl(38 70% 88%)",
        background: "hsl(210 20% 98%)",
      },
      boxShadow: {
        soft: "0 8px 28px rgba(2, 6, 23, 0.08)",
      },
      minHeight: {
        tap: "44px",
      },
    },
  },
  plugins: [],
};
