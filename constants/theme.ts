// Design system constants for consistent theming

export const Colors = {
  // Primary gradient colors
  primary: {
    start: '#6366F1', // Indigo
    middle: '#8B5CF6', // Purple
    end: '#EC4899', // Pink
  },
  // Accent colors
  accent: {
    green: '#10B981',
    blue: '#3B82F6',
    purple: '#A855F7',
    pink: '#EC4899',
    orange: '#F59E0B',
    red: '#EF4444',
  },
  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    black: '#000000',
  },
  // Status colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  // Background
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    dark: '#111827',
  },
};

export const Gradients = {
  primary: ['#6366F1', '#8B5CF6', '#EC4899'] as const,
  success: ['#10B981', '#059669'] as const,
  blue: ['#3B82F6', '#2563EB'] as const,
  purple: ['#A855F7', '#9333EA'] as const,
  sunset: ['#F59E0B', '#EF4444', '#EC4899'] as const,
  ocean: ['#06B6D4', '#3B82F6', '#8B5CF6'] as const,
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

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
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
