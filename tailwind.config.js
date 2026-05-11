export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6C5CE7",
        secondary: "#00F5D4",
        dark: "#0f0f1a",
        glass: "rgba(255,255,255,0.05)",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.25)",
        neon: "0 0 15px rgba(108,92,231,0.7)",
      },
      borderRadius: {
        xl2: "1.5rem",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};