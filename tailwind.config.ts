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
        accent: "#5E6AD2",
      },
      fontFamily: {
        archivo: ["Archivo", "sans-serif"],
        grotesk: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      boxShadow: {
        "accent-glow": "0 0 32px rgba(94, 106, 210, 0.18)",
        "accent-glow-md": "0 0 48px rgba(94, 106, 210, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
