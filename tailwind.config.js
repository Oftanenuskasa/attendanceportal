/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}", // Ensure this includes your components
  ],
  theme: {
    extend: {
      colors: {
        primary: "#003366", // Deep blue for trust and professionalism
        secondary: "#4B4F54", // Neutral medium gray for secondary elements
        accent: "#D1B000", // Gold for accents
        background: "#F9FAFB", // Light background for a clean look
        text: "#333333", // Dark text color for readability
        darkBackground: "#1A202C", // Darker background for dark mode
        lightGray: "#E5E7EB", // Light gray for borders and backgrounds
        muted: "#6B7280", // Muted gray for less important text
      },
    },
  },
  plugins: [],
};
