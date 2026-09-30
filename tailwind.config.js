/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#0c0d0d',
          900: '#141515',
          800: '#1A1C1D',
          700: '#2A2C2E',
        },
        platinum: {
          100: '#F5F5F5',
          200: '#E3E3E3',
          300: '#CFCFD2',
          400: '#8E9093',
        },
      },
      fontFamily: {
        display: ['var(--font-cinzel)', 'Cinzel', 'serif'],
        serif: ['var(--font-cinzel)', 'Cinzel', 'serif'],
        sans: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
