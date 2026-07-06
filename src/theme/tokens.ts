export type ThemeName = 'light' | 'dark';

export const radii = {
  xs: 8,
  sm: 14,
  md: 20,
  lg: 28,
  xl: 36,
  pill: 999,
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fonts = {
  display: 'Quicksand_700Bold',
  displayMedium: 'Quicksand_600SemiBold',
  body: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemiBold: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
};

// The creature's own palette stays constant across themes — it is the one
// piece of magic that never changes, like a night-light that's always warm.
export const creatureGradient = ['#8B7CFF', '#C77DFB', '#FF9AD5'] as const;
export const creatureGlow = '#B58CFF';

const auroraDark = ['#7C6CFF', '#B26DE8', '#FF9FDA'] as const;
const auroraLight = ['#8B7CFF', '#C77DFB', '#FF9AD5'] as const;

export interface Theme {
  name: ThemeName;
  bg: readonly [string, string, string];
  bgFlat: string;
  surface: string;
  surfaceStrong: string;
  border: string;
  borderStrong: string;
  aurora: readonly [string, string, string];
  accent: string;
  accentSoft: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  success: string;
  warning: string;
  danger: string;
  shadow: string;
  glowOpacity: number;
}

export const darkTheme: Theme = {
  name: 'dark',
  bg: ['#0A0618', '#150B2E', '#1C1140'] as const,
  bgFlat: '#0B0620',
  surface: 'rgba(255,255,255,0.055)',
  surfaceStrong: 'rgba(255,255,255,0.09)',
  border: 'rgba(255,255,255,0.12)',
  borderStrong: 'rgba(255,255,255,0.2)',
  aurora: auroraDark,
  accent: '#B58CFF',
  accentSoft: 'rgba(181,140,255,0.18)',
  textPrimary: '#F6F3FF',
  textSecondary: 'rgba(246,243,255,0.62)',
  textTertiary: 'rgba(246,243,255,0.38)',
  success: '#7CE0C0',
  warning: '#FFC98B',
  danger: '#FF9B9B',
  shadow: '#000000',
  glowOpacity: 0.5,
};

export const lightTheme: Theme = {
  name: 'light',
  bg: ['#F4F1FC', '#EFE9FB', '#F7F1FA'] as const,
  bgFlat: '#F4F1FC',
  surface: 'rgba(255,255,255,0.6)',
  surfaceStrong: 'rgba(255,255,255,0.85)',
  border: 'rgba(255,255,255,0.9)',
  borderStrong: 'rgba(120,90,200,0.18)',
  aurora: auroraLight,
  accent: '#7C5CFF',
  accentSoft: 'rgba(124,92,255,0.12)',
  textPrimary: '#1C1533',
  textSecondary: 'rgba(28,21,51,0.6)',
  textTertiary: 'rgba(28,21,51,0.4)',
  success: '#2FA98A',
  warning: '#C97A2E',
  danger: '#D65C5C',
  shadow: '#5B4B8A',
  glowOpacity: 0.25,
};

export const shadow = (theme: Theme, elevation: 'sm' | 'md' | 'lg' = 'md') => {
  const map = {
    sm: { h: 2, r: 8, o: theme.name === 'dark' ? 0.35 : 0.08 },
    md: { h: 6, r: 18, o: theme.name === 'dark' ? 0.4 : 0.12 },
    lg: { h: 14, r: 32, o: theme.name === 'dark' ? 0.45 : 0.16 },
  } as const;
  const cfg = map[elevation];
  return {
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: cfg.h },
    shadowOpacity: cfg.o,
    shadowRadius: cfg.r,
    elevation: cfg.h,
  };
};
