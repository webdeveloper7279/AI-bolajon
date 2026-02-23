import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      colors: {
        navy: {
          950: "#0a0f1a",
          900: "#0f1729",
          800: "#152238",
          700: "#1a2d47",
        },
        accent: {
          blue: "#3b82f6",
          teal: "#14b8a6",
          yellow: "#fbbf24",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
        glow: "0 0 40px rgba(59, 130, 246, 0.15), 0 0 80px rgba(20, 184, 166, 0.08)",
        "glow-strong": "0 0 60px rgba(59, 130, 246, 0.25)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
