/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          deep: '#0b1726',
          DEFAULT: '#14263f',
          light: '#1e3a5f',
          lighter: '#2a4a7a',
          pale: '#3a527a',
        },
        beige: {
          bg: '#f7f3ec',
          surface: '#f0ead6',
          card: '#e9e1cd',
          border: '#d4c7a8',
          soft: '#efe6d1',
        },
        gold: {
          DEFAULT: '#d4a373',
          hover: '#c28e5a',
          soft: '#e8d4b5',
        },
        'text-deep': '#0b1726',
        'text-muted': '#6b7280',
        'text-surface': '#374151',
        'bg-surface': '#f0ead6',
        'bg-soft': '#efe6d1',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '14px',
        lg: '20px',
        pill: '9999px',
      },
      minHeight: {
        '44': '44px',
        '40': '40px',
        '56': '56px',
      },
      scale: {
        '97': '0.97',
      },
      boxShadow: {
        'shadow-md': '0 8px 24px -6px rgba(11, 23, 38, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
