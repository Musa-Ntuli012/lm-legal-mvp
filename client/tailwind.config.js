/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light theme
        canvas: '#F7F3EC',
        raised: '#FDFBF7',
        sunken: '#E9E1CD',
        'text-deep': '#0B1726',
        'text-secondary': '#3E4A5A',
        'text-muted': '#566170',
        'text-brass': '#7A5A1E',
        primary: '#14263F',
        'border-control': '#8A8577',
        error: '#A32A2A',
        success: '#1F6B4A',
        warning: '#8A5A00',
        // Dark theme
        'dark-canvas': '#0B1017',
        'dark-raised': '#111823',
        'dark-sunken': '#172130',
        'dark-text': '#ECE7DB',
        'dark-secondary': '#B4B0A4',
        'dark-muted': '#8E8B80',
        'dark-brass': '#C8A56A',
        'dark-primary': '#C8A56A',
        'dark-border': '#6F7886',
        'dark-error': '#F08A8A',
        'dark-success': '#6CCBA0',
        'dark-warning': '#E3B35A',
      },
      fontFamily: {
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display': ['34px', { letterSpacing: '-0.02em', fontWeight: '700' }],
        'title': ['22px', { fontWeight: '600' }],
        'body': ['17px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption-14': ['14px', { fontWeight: '400' }],
        'caption-13': ['13px', { fontWeight: '400' }],
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
        '95': '0.95',
      },
      boxShadow: {
        'shadow-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'shadow-md': '0 8px 24px -6px rgba(11, 23, 38, 0.12)',
        'focus-ring': '0 0 0 2px #7A5A1E, 0 0 0 4px #F7F3EC',
      },
      spacing: {
        '16': '64px', // 16px gutters
      },
      animation: {
        'fade-in': 'fadeIn 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in': 'slideIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'cross-fade': 'crossFade 200ms ease-in-out',
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
        crossFade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
    darkMode: 'class',
  },
  plugins: [],
};
