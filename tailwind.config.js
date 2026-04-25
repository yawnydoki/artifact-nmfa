/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "artifact-bg": "#2E1A0F", // Dark brown background
        "artifact-card": "#EBDAB5", // Light beige for cards
        "artifact-border": "#4A2E1B", // Darker brown for card borders/text
        "artifact-blue": "#3A5A7B", // Quiz background
        "artifact-green": "#5B6F3A", // Map background
        "artifact-gold": "#E6BA39", // Gold badges/buttons
        "artifact-passport": "#B58554", // warm brown background for the passport
        "artifact-tab": "#E19B2D", // orange/yellow active tab color
      },
      fontFamily: {
        daruma: ['"Darumadrop One"', "sans-serif"],
        neohellenic: ['"GFS Neohellenic"', "sans-serif"],
        hind: ['"Hind Kochi"', "sans-serif"],
        imfell: ['"IM FELL Great Primer SC"', "serif"],
        arial: ["Arial", "sans-serif"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
