import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#FF6B4A",
      },
      fontFamily: {
        archivo: ["Archivo", "sans-serif"],
        grotesk: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      boxShadow: {
        "accent-glow": "0 0 32px rgba(255, 107, 74, 0.18)",
        "accent-glow-md": "0 0 48px rgba(255, 107, 74, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
