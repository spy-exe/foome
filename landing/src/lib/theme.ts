export const theme = {
  colors: {
    brand: '#E8452C',
    brandDark: '#C23525',
    brandLight: '#FFF0EE',
    brandBorder: '#FBD0CB',

    ink: '#17172B',
    ink2: '#4A4A6A',
    ink3: '#9494B2',
    ink4: '#C8C8DC',

    bg: '#F5F5FA',
    surface: '#FFFFFF',
    border: '#E8E8F0',

    amber: '#FF9B3D',
    amberLight: '#FFF4E8',
    teal: '#00BE99',
    tealLight: '#E6FAF6',
  },

  darkColors: {
    brand: '#E8452C',
    brandDark: '#C23525',
    brandLight: '#2A1513',
    brandBorder: '#4A2020',

    ink: '#F0F0F7',
    ink2: '#C8C8DC',
    ink3: '#9494B2',
    ink4: '#6A6A82',

    bg: '#12121A',
    surface: '#1E1E2A',
    border: '#2A2A3A',

    amber: '#FF9B3D',
    amberLight: '#2A2018',
    teal: '#00BE99',
    tealLight: '#182A24',
  },
} as const;

export type ThemeColors = typeof theme.colors;
