export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        ubuntu: ["Ubuntu", "sans-serif"],
      },

      borderRadius: {
        "custom-lg": "138px",
        "custom-md": "80px",
        "custom-sm": "80px",
      },
    },
  },
  plugins: [],
};
