export const F = {
  regular:   'Inter_400Regular',
  medium:    'Inter_500Medium',
  semibold:  'Inter_600SemiBold',
  bold:      'Inter_700Bold',
  headingSm: 'Poppins_600SemiBold',
  heading:   'Poppins_700Bold',
  headingLg: 'Poppins_800ExtraBold',
  mono:      'JetBrainsMono_400Regular',
  monoMedium:'JetBrainsMono_500Medium',
  monoBold:  'JetBrainsMono_700Bold',

  // Novos aliases
  ui:           'Inter_400Regular',
  uiMedium:     'Inter_500Medium',
  uiSemi:       'Inter_600SemiBold',
  uiBold:       'Inter_700Bold',
  body:         'Inter_400Regular',
  bodyMedium:   'Inter_500Medium',
  bodySemi:     'Inter_600SemiBold',
  bodyBold:     'Inter_700Bold',
};

export const C = {
  // Brand
  brand:        '#E8452C',
  brandDark:    '#C73520',
  brandLight:   '#FFF0ED',

  // Base neutra
  ink:          '#0A0A0A',
  inkMid:       '#3D3D3D',
  inkLight:     '#8A8A8A',

  // Midnight (dark accents / headers)
  midnight:     '#1A1A2E',
  midnightMid:  '#2D2D4E',
  midnightLight:'#E8E8F0',

  // Surfaces
  white:        '#FFFFFF',
  offWhite:     '#F5F5F0',
  surface:      '#FFFFFF',
  surfaceAlt:   '#F0F0EB',
  border:       '#E8E8E4',
  borderDark:   '#D0D0CC',

  // Semânticas
  success:      '#16A34A',
  successLight: '#DCFCE7',
  warning:      '#D97706',
  warningLight: '#FEF3C7',
  error:        '#DC2626',
  errorLight:   '#FEE2E2',
  info:         '#2563EB',
  infoLight:    '#EFF6FF',

  // ── Backward-compatible aliases ──
  brandBorder:  '#FFF0ED',
  ink2:         '#3D3D3D',
  ink3:         '#8A8A8A',
  ink4:         '#E8E8F0',
  bg:           '#F5F5F0',
  amber:        '#D97706',
  amberLight:   '#FEF3C7',
  teal:         '#16A34A',
  tealLight:    '#DCFCE7',
  midnightSurface: '#2D2D4E',
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
export const S = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48,
};

// Backward-compatible alias
export const SPACING = S;

// Typography presets (spread via ...TYPE.key)
export const TYPE = {
  hero:    { fontSize: 32, lineHeight: 40, fontFamily: F.bold },
  h1:      { fontSize: 26, lineHeight: 34, fontFamily: F.bold },
  h2:      { fontSize: 22, lineHeight: 30, fontFamily: F.semibold, letterSpacing: -0.5 },
  h3:      { fontSize: 18, lineHeight: 26, fontFamily: F.semibold },
  h4:      { fontSize: 16, lineHeight: 24, fontFamily: F.medium },
  body:    { fontSize: 15, lineHeight: 23, fontFamily: F.regular },
  bodyS:   { fontSize: 14, lineHeight: 21, fontFamily: F.regular },
  caption: { fontSize: 12, lineHeight: 18, fontFamily: F.regular },
  badge:   { fontSize: 10, lineHeight: 14, fontFamily: F.monoBold, letterSpacing: 0.5 },
  rating:  { fontSize: 12, lineHeight: 16, fontFamily: F.monoBold },
  price:   { fontSize: 18, lineHeight: 24, fontFamily: F.monoBold },
  priceS:  { fontSize: 14, lineHeight: 20, fontFamily: F.monoBold },
  time:    { fontSize: 12, lineHeight: 16, fontFamily: F.mono },
};

// Border radius system
export const R = {
  sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, full: 9999,
};

// Backward-compatible alias
export const RADIUS = R;

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
