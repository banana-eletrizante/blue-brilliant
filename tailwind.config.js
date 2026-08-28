/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          deep: '#071A2C',
          DEFAULT: '#0B2440',
          light: '#12345A',
        },
        teal: {
          DEFAULT: '#2FBE96',
          dim: '#1D9E75',
        },
        coral: '#E0653B',
        amber: '#E3A857',
        sand: {
          DEFAULT: '#EFE7D8',
          dim: '#B9C4CE',
        },
        mist: '#7FA3BE',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
