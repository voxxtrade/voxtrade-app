import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        obsidian: {
          DEFAULT: "#0D0F12",
          surface: "#14171C",
          border: "#0D0F12",
          subtle: "#1C2026",
        },
        alabaster: {
          DEFAULT: "#FAF8F5",
          subtle: "#F3EFEA",
          card: "#FFFFFF",
        },
        jade: {
          DEFAULT: "#059669",
          400: "#34D399",
          500: "#10B981",
        },
        lapis: {
          DEFAULT: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
        },
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px #0D0F12",
        "brutal-sm": "2px 2px 0px 0px #0D0F12",
        "brutal-md": "6px 6px 0px 0px #0D0F12",
        "brutal-lg": "8px 8px 0px 0px #0D0F12",
        "brutal-xl": "12px 12px 0px 0px #0D0F12",
        "brutal-amber": "6px 6px 0px 0px #D97706",
        "brutal-white": "6px 6px 0px 0px #FFFFFF",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "sound-wave": {
          "0%, 100%": { height: "6px" },
          "50%": { height: "34px" },
        },
      },
      animation: {
        marquee: "marquee 24s linear infinite",
        "sound-wave-fast": "sound-wave 0.4s ease-in-out infinite alternate",
        "sound-wave-slow": "sound-wave 0.85s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};
export default config;

