export const F = {
  regular:   'Inter-Regular',
  medium:    'Inter-Medium',
  semibold:  'Inter-SemiBold',
  bold:      'Inter-Bold',
  headingSm: 'Poppins-SemiBold',
  heading:   'Poppins-Bold',
  headingLg: 'Poppins-ExtraBold',
};

export const C = {
  // Brand
  brand:        '#E8452C',
  brandDark:    '#C23525',
  brandLight:   '#FFF0EE',
  brandBorder:  '#FBD0CB',

  // Ink (text / icons)
  ink:          '#17172B',   // deep indigo-black
  ink2:         '#4A4A6A',   // secondary text
  ink3:         '#9494B2',   // placeholder / caption
  ink4:         '#C8C8DC',   // disabled / very light

  // Surfaces
  bg:           '#F5F5FA',   // warm off-white with purple hint
  surface:      '#FFFFFF',
  border:       '#E8E8F0',

  // Accents
  amber:        '#FF9B3D',   // stars, "Grátis" badge
  amberLight:   '#FFF4E8',
  teal:         '#00BE99',   // success / confirmed
  tealLight:    '#E6FAF6',
};

export const SHADOW = {
  card: {
    shadowColor: '#17172B',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  float: {
    shadowColor: '#17172B',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  sheet: {
    shadowColor: '#17172B',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
};

// Spacing system (multiples of 4)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// Border radius system
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Animation presets
export const ANIM = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Haptic presets for expo-haptics
export const HAPTIC = {
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
  success: 'success',
  warning: 'warning',
  error: 'error',
};
