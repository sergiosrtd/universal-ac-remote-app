/**
 * Design tokens. Components read semantic tokens through `useAppTheme()` and
 * never hard-code colors, so theme switching and rebranding happen here only.
 *
 * The values follow the senior-friendly rules in `docs/style-guide.md`: large
 * type, 64pt touch targets, and text colors that meet WCAG AAA (7:1) contrast.
 */

import { Platform } from 'react-native';

import type { AcMode, ResolvedTheme } from '@/types';

const palette = {
  white: '#FFFFFF',
  black: '#000000',
  slate50: '#F5F7FB',
  slate100: '#EAEEF5',
  slate200: '#D9DFEA',
  slate300: '#C9D1DE',
  slate400: '#A3ADBF',
  slate500: '#7A8499',
  slate600: '#4A5468',
  slate700: '#2A3245',
  slate800: '#1A2130',
  slate850: '#141A26',
  slate900: '#0B0F17',
  // Bright accents read well on dark surfaces.
  ice400: '#4CC9F0',
  ember400: '#FF8A4C',
  leaf400: '#5DD39E',
  sand400: '#F4C95D',
  violet400: '#A28BFF',
  red400: '#FF6B6B',
  // Deep accents keep white text and accent-colored text legible on light surfaces.
  blue700: '#0A5FA8',
  ember700: '#B8430F',
  leaf700: '#1E7A4C',
  sand700: '#8A5E00',
  violet700: '#5B3FD1',
  red700: '#B42318',
} as const;

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfacePressed: string;
  /** Visible outline for cards, inputs and buttons (at least 3:1 against the surface). */
  border: string;
  /** Outline of the focused or selected control. */
  borderStrong: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  /** Text and icons drawn on accent fills such as mode colors and the power-on fill. */
  onAccent: string;
  success: string;
  warning: string;
  danger: string;
  onDanger: string;
  powerOn: string;
  powerOff: string;
  overlay: string;
  /** Light tile behind brand logos. Logos are drawn for light backgrounds, so it stays light in dark mode. */
  logoPlate: string;
  mode: Record<AcMode, string>;
}

export const Colors: Record<ResolvedTheme, ThemeColors> = {
  light: {
    background: palette.slate50,
    surface: palette.white,
    surfaceElevated: palette.white,
    surfacePressed: palette.slate100,
    border: palette.slate500,
    borderStrong: palette.slate900,
    text: palette.slate900,
    textSecondary: palette.slate700,
    textMuted: palette.slate600,
    primary: palette.blue700,
    onPrimary: palette.white,
    onAccent: palette.white,
    success: palette.leaf700,
    warning: palette.sand700,
    danger: palette.red700,
    onDanger: palette.white,
    powerOn: palette.leaf700,
    powerOff: palette.red700,
    overlay: 'rgba(11, 15, 23, 0.5)',
    logoPlate: palette.white,
    mode: {
      cool: palette.blue700,
      heat: palette.ember700,
      dry: palette.sand700,
      fan: palette.leaf700,
      auto: palette.violet700,
    },
  },
  dark: {
    background: palette.slate900,
    surface: palette.slate850,
    surfaceElevated: palette.slate800,
    surfacePressed: palette.slate700,
    border: palette.slate500,
    borderStrong: palette.slate50,
    text: palette.slate50,
    textSecondary: palette.slate300,
    textMuted: palette.slate400,
    primary: palette.ice400,
    onPrimary: palette.slate900,
    onAccent: palette.slate900,
    success: palette.leaf400,
    warning: palette.sand400,
    danger: palette.red400,
    onDanger: palette.slate900,
    powerOn: palette.leaf400,
    powerOff: palette.red400,
    overlay: 'rgba(0, 0, 0, 0.6)',
    // Slightly off-white so it doesn't glare against the dark background.
    logoPlate: palette.slate100,
    mode: {
      cool: palette.ice400,
      heat: palette.ember400,
      dry: palette.sand400,
      fan: palette.leaf400,
      auto: palette.violet400,
    },
  },
};

export const Spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Outline widths. Thin hairlines disappear for low-vision users, so the minimum is 2. */
export const Borders = {
  regular: 2,
  selected: 4,
} as const;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', rounded: 'ui-rounded', mono: 'ui-monospace' },
  web: { sans: 'var(--font-display)', rounded: 'var(--font-rounded)', mono: 'var(--font-mono)' },
  default: { sans: 'normal', rounded: 'normal', mono: 'monospace' },
});

/** Nothing smaller than `caption` (17pt) is allowed anywhere in the app. */
export const Typography = {
  display: { fontSize: 88, lineHeight: 96, fontWeight: '500', fontFamily: Fonts.rounded },
  title: { fontSize: 32, lineHeight: 40, fontWeight: '700', fontFamily: Fonts.sans },
  heading: { fontSize: 24, lineHeight: 32, fontWeight: '700', fontFamily: Fonts.sans },
  body: { fontSize: 20, lineHeight: 28, fontWeight: '400', fontFamily: Fonts.sans },
  label: { fontSize: 20, lineHeight: 26, fontWeight: '600', fontFamily: Fonts.sans },
  caption: { fontSize: 17, lineHeight: 24, fontWeight: '500', fontFamily: Fonts.sans },
} as const;

export type TypographyVariant = keyof typeof Typography;

export const Motion = {
  /** Durations in ms. */
  fast: 120,
  normal: 220,
  slow: 360,
  /** Subtle on purpose: big shrinking targets feel like they moved away from the finger. */
  pressScale: 0.97,
  spring: { damping: 20, stiffness: 260, mass: 0.8 },
} as const;

export const Layout = {
  maxContentWidth: 560,
  /** Every tappable element is at least this tall and wide (HIG/Material minimum is 44–48). */
  minTouchTarget: 64,
  /** Height of the main action on a screen, e.g. Save or Power. */
  primaryButtonHeight: 72,
  /** Gap between neighbouring tappable elements, so a shaky tap never hits the wrong one. */
  touchGap: Spacing.md,
  /** Caps how far the system text-size setting can grow text before layouts break. */
  maxFontScale: 1.6,
} as const;

export interface AppTheme {
  scheme: ResolvedTheme;
  colors: ThemeColors;
  spacing: typeof Spacing;
  radii: typeof Radii;
  borders: typeof Borders;
  typography: typeof Typography;
  motion: typeof Motion;
}

export const createTheme = (scheme: ResolvedTheme): AppTheme => ({
  scheme,
  colors: Colors[scheme],
  spacing: Spacing,
  radii: Radii,
  borders: Borders,
  typography: Typography,
  motion: Motion,
});
