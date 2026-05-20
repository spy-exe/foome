import type { Config } from 'tailwindcss';
import { theme } from './src/lib/theme';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: theme.colors.brand,
          dark: theme.colors.brandDark,
          light: theme.colors.brandLight,
          border: theme.colors.brandBorder,
        },
        ink: {
          DEFAULT: theme.colors.ink,
          2: theme.colors.ink2,
          3: theme.colors.ink3,
          4: theme.colors.ink4,
        },
        surface: {
          bg: theme.colors.bg,
          DEFAULT: theme.colors.surface,
          border: theme.colors.border,
        },
        accent: {
          amber: theme.colors.amber,
          'amber-light': theme.colors.amberLight,
          teal: theme.colors.teal,
          'teal-light': theme.colors.tealLight,
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '28px',
        full: '9999px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        shimmer: 'shimmer 2s infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.7' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
