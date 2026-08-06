/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0d0f12", // Premium Dark Charcoal
        surface: "#141820", // Sleek Navy-Grey Card Surface
        primary: {
          DEFAULT: "#00b4d8", // Vibrant Clinical Cyan
          hover: "#0077b6",
        },
        accent: "#7209b7", // Royal Purple for micro-highlights
        muted: "#94a3b8", // Muted slate text
        success: "#10b981", // Clinical normal range green
        warning: "#f59e0b", // Mild/Moderate warning orange
        danger: "#ef4444", // Severe limitation red
        border: "#1e293b", // Slate borders
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
