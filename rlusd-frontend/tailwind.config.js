module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: {
          DEFAULT: "#ED0000", // Red - #ED0000
          light: "#FFF8F8", // Lightest red tint
        },
        secondary: {
          pink: "#DE2F6E", // Pink - #DE2F6E
          blue: "#3FA2E9", // Blue - #3FA2E9
          purple: "#450F7A", // Purple - #450F7A
        },
        neutral: {
          white: "#F8F8FA", // Off-white - #F8F8FA
          gray: "#777990", // Gray - #777990
          black: "#141415", // Black - #141415
        },
      },
    },
  },
  plugins: [],
};
