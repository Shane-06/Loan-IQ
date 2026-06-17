/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        hdfc: {
          blue: {
            DEFAULT: '#8b5cf6', // Premium Purple
            light: '#a78bfa',   // Bright Purple Accent
            dark: '#6d28d9',    // Deep Royal Purple
            glow: '#c4b5fd',    // Electric Purple Glow
          },
          red: {
            DEFAULT: '#f43f5e', // Premium Rose Red
            light: '#fb7185',   // Coral Pink Accent
            dark: '#be123c',    // Deep Crimson
          },
          gray: {
            50: '#f9fafb',      // Slate White
            100: '#f3f4f6',     // Cool Light Gray
            200: '#e5e7eb',     // Cool Border Gray
            300: '#9ca3af',     // Muted Slate Text
            800: '#1f2937',     // Dark Panel Gray
            900: '#111827',     // Obsidian Card Backdrop
            950: '#030712',     // Deep Obsidian Dark Mode Background
          }
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'pulse-subtle': {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.85',
            transform: 'scale(1.02)',
          },
        }
      }
    },
  },
  plugins: [],
}
