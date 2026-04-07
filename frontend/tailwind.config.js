/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Default UI font: Latin + Traditional Chinese friendly
        sans: ["Inter", "Noto Sans TC", "system-ui", "sans-serif"],
        // Keep existing utility (`font-inter`) but improve Chinese fallback
        inter: ["Inter", "Noto Sans TC", "system-ui", "sans-serif"],
        // Optional: use for big headings if desired
        display: ["Clash Display", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

