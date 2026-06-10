import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0E1B2A",
        ink: "#172033",
        gold: "#F3A71B",
        green: "#16A34A",
      },
      boxShadow: {
        soft: "0 24px 70px rgba(14,27,42,0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
