import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}", // Added lib folder to content paths
  ],
  theme: {
    extend: {
      // Ensure no conflicting theme colors are blocking Tailwind utilities
    },
  },
  plugins: [],
};
export default config;
