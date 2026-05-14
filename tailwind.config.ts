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
        kooqs: {
          red: "#DC1A17",
          "red-dark": "#B01512",
          "red-light": "#FF3330",
          orange: "#F97316",
          "orange-dark": "#EA6C0A",
          dark: "#0A0A0A",
          card: "#111111",
          "card-hover": "#161616",
          border: "#222222",
          muted: "#2A2A2A",
          text: "#CCCCCC",
          "text-dim": "#888888",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "flame-gradient": "linear-gradient(135deg, #DC1A17 0%, #F97316 100%)",
        "dark-gradient": "linear-gradient(180deg, #111111 0%, #0A0A0A 100%)",
      },
      animation: {
        "pulse-red": "pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
      keyframes: {
        "pulse-red": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
