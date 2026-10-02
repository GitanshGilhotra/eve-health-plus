/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        // EVE Health+ Design Tokens
        "eve-bg":      "#060a14",
        "eve-surface": "#0b1121",
        "eve-teal":    "#0ea5e9",
        "eve-violet":  "#8b5cf6",
        "eve-emerald": "#10b981",
      },
      animation: {
        "float":         "float 22s ease-in-out infinite alternate",
        "pulse-subtle":  "pulseSubtle 3s ease-in-out infinite",
        "fade-in":       "fadeIn 0.15s ease",
        "slide-up":      "slideUp 0.25s ease",
      },
      keyframes: {
        float: {
          "0%":   { transform: "translate(0,0) scale(1)" },
          "50%":  { transform: "translate(30px,-20px) scale(1.05)" },
          "100%": { transform: "translate(-20px,15px) scale(0.97)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.6" },
        },
        fadeIn: {
          "from": { opacity: "0", transform: "translateY(-6px)" },
          "to":   { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "from": { opacity: "0", transform: "translateY(12px)" },
          "to":   { opacity: "1", transform: "translateY(0)" },
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backdropBlur: {
        "3xl": "64px",
      },
    },
  },
  plugins: [],
};
