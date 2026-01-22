// Monochromatic design system - Clean, high contrast black & white

export const Colors = {
  // Main color palette (monochrome)
  terminal: {
    black: '#0A0A0A',      // Deep black background
    darkGray: '#1A1A1A',   // Card background
    gray: '#404040',       // Borders and dividers
    green: '#FFFFFF',      // Primary text (white)
    brightGreen: '#FFFFFF', // Completed states (white)
    cyan: '#B0B0B0',       // Secondary text
    amber: '#B0B0B0',      // Tertiary text
    red: '#E0E0E0',        // Danger/warning (light gray)
    blue: '#B0B0B0',       // Info text
  },
  // Accent colors (monochrome)
  accent: {
    green: '#FFFFFF',
    blue: '#B0B0B0',
    purple: '#808080',
    pink: '#B0B0B0',
    orange: '#B0B0B0',
    red: '#E0E0E0',
  },
  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    gray50: '#F5F5F5',
    gray100: '#E0E0E0',
    gray200: '#C0C0C0',
    gray300: '#B0B0B0',
    gray400: '#808080',
    gray500: '#606060',
    gray600: '#404040',
    gray700: '#2A2A2A',
    gray800: '#1A1A1A',
    gray900: '#0A0A0A',
    black: '#000000',
  },
  // Status colors (monochrome)
  status: {
    success: '#FFFFFF',
    warning: '#B0B0B0',
    error: '#E0E0E0',
    info: '#B0B0B0',
  },
  // Background
  background: {
    primary: '#0A0A0A',     // Deep black
    secondary: '#1A1A1A',   // Card background
    dark: '#000000',
  },
};

export const Gradients = {
  primary: ['#0A0A0A', '#1A1A1A', '#242424'] as const,  // Black to dark gray
  success: ['#FFFFFF', '#E0E0E0'] as const,
  blue: ['#B0B0B0', '#808080'] as const,
  purple: ['#808080', '#606060'] as const,
  sunset: ['#B0B0B0', '#808080'] as const,
  ocean: ['#B0B0B0', '#808080', '#606060'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 48,
};

export const FontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const FontFamilies = {
  // Terminal-style monospace fonts
  mono: 'Menlo' as const,           // iOS default monospace
  monoAndroid: 'monospace' as const, // Android monospace
};

export const Shadows = {
  // Subtle black shadows for depth
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 16,
  },
};

// Emoji icons for routine items
export const RoutineIcons = {
  pushups: '💪',
  coffee: '☕',
  water: '💧',
  calendar: '📅',
  email: '📧',
  music: '🎵',
};
