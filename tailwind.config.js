/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "artifact-bg": "#2E1A0F", 
        "artifact-card": "#EBDAB5", 
        "artifact-border": "#4A2E1B", 
        "artifact-blue": "#3A5A7B", 
        "artifact-green": "#5B6F3A", 
        "artifact-gold": "#E6BA39", 
        "artifact-passport": "#B58554", 
        "artifact-tab": "#E19B2D", 
        
        "museum-gold": "#FAD48E", 
        "museum-brown": "#1A0F0A", 
      },
      fontFamily: {
        daruma: ['"Darumadrop One"', "sans-serif"],
        hind: ['"Hind Kochi"', "sans-serif"],
        imfell: ['"IM FELL Great Primer SC"', "serif"],
        serif: ['"Times New Roman"', "serif"],
        neohellenic: ['"GFS Neohellenic"', "sans-serif"],
        arial: ["Arial", "Helvetica", "sans-serif"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scan: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(210px)' }, // move line upd own
        }
      },
      animation: {
        "fade-in-up": "fade-in-up 0.3s ease-out",
        "scan": "scan 3s ease-in-out infinite", // 3 second continuous loop
      },
    },
  },
  plugins: [],
};