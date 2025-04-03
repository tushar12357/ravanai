/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B2C',
          light: '#FF8F59',
          dark: '#E85A1F',
        },
        accent: {
          DEFAULT: '#FFD700',
          light: '#FFE44D',
          dark: '#FFA500',
        },
      },
      boxShadow: {
        'glow': '0 0 30px rgba(255, 107, 44, 0.4)',
        'glass': '0 16px 32px rgba(255, 107, 44, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
        'float': '0 24px 48px rgba(255, 107, 44, 0.3), 0 12px 24px rgba(255, 107, 44, 0.2)',
        'inner-glow': 'inset 0 2px 4px rgba(255, 107, 44, 0.1)',
        'premium': '0 20px 40px rgba(255, 107, 44, 0.2), 0 8px 16px rgba(255, 107, 44, 0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        glow: {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 0.6, transform: 'scale(1.2)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
  ],
}