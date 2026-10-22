/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pink: {
          DEFAULT: "var(--pink)",
          deep: "var(--pink-deep)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          deep: "var(--gold-deep)",
        },
        cream: "var(--cream)",
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
        },
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Outfit", "system-ui", "sans-serif"],
        script: ["Great Vibes", "cursive"],
      },
      boxShadow: {
        soft: "0 12px 40px rgba(58, 43, 46, 0.08)",
        gold: "0 8px 24px rgba(201, 162, 75, 0.22)",
      },
      backgroundImage: {
        "floral-fade":
          "radial-gradient(1200px 400px at 10% -10%, rgba(248, 215, 224, 0.9), transparent), radial-gradient(900px 400px at 100% 0%, rgba(201, 162, 75, 0.12), transparent)",
      },
    },
  },
  plugins: [],
};
