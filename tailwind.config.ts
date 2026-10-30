import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tp: {
          DEFAULT: "#10b981", // Emerald 500
          light: "#d1fae5",
          dark: "#065f46",
          glow: "rgba(16, 185, 129, 0.25)",
        },
        sl: {
          DEFAULT: "#f43f5e", // Rose 500
          light: "#ffe4e6",
          dark: "#881337",
          glow: "rgba(244, 63, 94, 0.25)",
        },
        be: {
          DEFAULT: "#6b7280", // Gray 500
          light: "#f3f4f6",
          dark: "#374151",
        },
        brand: {
          50: "#f0fdf4",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
      },
    },
  },
  plugins: [],
};
export default config;
