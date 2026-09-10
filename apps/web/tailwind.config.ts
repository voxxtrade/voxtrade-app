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
        neo: {
          yellow: "#FFE600",
          pink: "#FF5470",
          purple: "#A388EE",
          cyan: "#00F0FF",
          green: "#2EE6CA",
          lime: "#B8FF01",
          orange: "#FF6B35",
          bg: "#FEF9EF",
          paper: "#FFFFFF",
          dark: "#121212",
        },
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px #000000",
        "brutal-sm": "2px 2px 0px 0px #000000",
        "brutal-md": "6px 6px 0px 0px #000000",
        "brutal-lg": "8px 8px 0px 0px #000000",
        "brutal-xl": "12px 12px 0px 0px #000000",
        "brutal-2xl": "16px 16px 0px 0px #000000",
        "brutal-reverse": "-6px 6px 0px 0px #000000",
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
          "50%": { height: "28px" },
        },
      },
      animation: {
        marquee: "marquee 22s linear infinite",
        "sound-wave-fast": "sound-wave 0.5s ease-in-out infinite alternate",
        "sound-wave-slow": "sound-wave 1.1s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};
export default config;

