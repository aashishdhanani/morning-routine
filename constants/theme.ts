// Terminal/Tech-themed design system

export const Colors = {
  // Terminal colors
  terminal: {
    black: '#0A0E14',      // Deep terminal black
    darkGray: '#1A1F29',   // Terminal background
    gray: '#2B3240',       // Lighter terminal gray
    green: '#00D787',      // Matrix green
    brightGreen: '#00FF9F', // Bright terminal green
    cyan: '#00D7FF',       // Terminal cyan
    amber: '#FFB454',      // Terminal amber/yellow
    red: '#FF6B6B',        // Terminal red
    blue: '#57C7FF',       // Terminal blue
  },
  // Accent colors (terminal themed)
  accent: {
    green: '#00D787',
    blue: '#57C7FF',
    purple: '#C792EA',
    pink: '#FF6AC1',
    orange: '#FFB454',
    red: '#FF6B6B',
  },
  // Neutral colors (terminal themed)
  neutral: {
    white: '#E6EDF3',      // Slightly off-white for terminals
    gray50: '#2B3240',
    gray100: '#343D4D',
    gray200: '#3E4859',
    gray300: '#4F5B70',
    gray400: '#6B7280',
    gray500: '#8B92A0',
    gray600: '#A8AEBB',
    gray700: '#C5CAD3',
    gray800: '#1A1F29',
    gray900: '#0A0E14',
    black: '#000000',
  },
  // Status colors (terminal themed)
  status: {
    success: '#00D787',
    warning: '#FFB454',
    error: '#FF6B6B',
    info: '#57C7FF',
  },
  // Background
  background: {
    primary: '#0A0E14',     // Deep black
    secondary: '#1A1F29',   // Dark gray
    dark: '#000000',
  },
};

export const Gradients = {
  primary: ['#0A0E14', '#1A1F29', '#2B3240'] as const,  // Dark terminal gradients
  success: ['#00D787', '#00A86B'] as const,
  blue: ['#57C7FF', '#3B9FD8'] as const,
  purple: ['#C792EA', '#A370D8'] as const,
  sunset: ['#FFB454', '#FF8C42'] as const,
  ocean: ['#00D7FF', '#57C7FF', '#8B92FF'] as const,
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
  // Terminal-style glows instead of shadows
  sm: {
    shadowColor: '#00D787',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#00D787',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#00D787',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#00D787',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
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
