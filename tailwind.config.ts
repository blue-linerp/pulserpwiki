import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0b0d",
        panel: "#111114",
        panel2: "#17171c",
        line: "rgba(255,255,255,0.08)",
        muted: "#a1a1aa",
        crimson: "#991b1b",
        pulse: {
          50: "#fef2f2",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Rubik'", "Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(220,38,38,0.4), 0 8px 24px -8px rgba(220,38,38,0.45)",
        panel: "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px -16px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(1200px 400px at 50% -10%, rgba(220,38,38,0.15), transparent 60%), linear-gradient(180deg, #0b0b0d 0%, #0b0b0d 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
