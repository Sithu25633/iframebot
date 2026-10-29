/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: "#0d0d0d",
        "surface-card": "#141414",
        "surface-hover": "#1f1f1f",
        border: "#262626",
        "border-light": "#333333",
        primary: {
          50: "#ffffff",
          500: "#ffffff",
          600: "#e5e5e5",
        },
        whatsapp: "#25D366",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cinema-glow": "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.08), transparent 70%)",
        "card-gradient": "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.8) 100%)",
      },
      boxShadow: {
        "glow-white": "0 0 20px -3px rgba(255, 255, 255, 0.25)",
        "glow-card": "0 10px 30px -10px rgba(0, 0, 0, 0.9)",
      }
    },
  },
  plugins: [],
};
