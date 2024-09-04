/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {},
      fontFamily: {
        body: ['dos-vga', 'sans-serif'],
        heading: ['ppmondwest', 'sans-serif'],
        pixel: ['pixel-script', 'sans-serif'],
        console: ['broken-console', 'sans-serif'],
        chicago: ['chicago-flf', 'sans-serif'],
        neuebit: ['ppneuebit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
