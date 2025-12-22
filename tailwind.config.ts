import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2rem",
        "2xl": "2.75rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
        "3xl": "1680px",
      },
    },
    extend: {
      screens: {
        "3xl": "1680px",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "haiti-navy": "rgb(var(--haiti-navy-rgb) / <alpha-value>)",
        "haiti-ink": "rgb(var(--haiti-ink-rgb) / <alpha-value>)",
        "haiti-sky": "rgb(var(--haiti-sky-rgb) / <alpha-value>)",
        "haiti-coral": "rgb(var(--haiti-coral-rgb) / <alpha-value>)",
        "haiti-foam": "rgb(var(--haiti-foam-rgb) / <alpha-value>)",
        "haiti-sand": "rgb(var(--haiti-sand-rgb) / <alpha-value>)",
      },
      boxShadow: {
        card: "0 18px 45px rgba(17, 34, 52, 0.07)",
      },
      backgroundImage: {
        "haiti-gradient":
          "linear-gradient(135deg, rgba(92,184,216,0.18), rgba(12,50,87,0.08))",
      },
    },
  },
  plugins: [typography],
} satisfies Config;
