module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a8a',
          dark: '#172554',
          light: '#3b82f6',
        },
        accent: {
          DEFAULT: '#22c55e',
          dark: '#16a34a',
          light: '#4ade80',
        },
        dark: {
          DEFAULT: '#374151',
          light: '#4b5563',
          lighter: '#6b7280',
        },
      },
    },
  },
  plugins: [],
};
