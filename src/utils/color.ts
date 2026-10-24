import { clamp } from './math';

/** Appends an alpha channel to a `#RRGGBB` token, e.g. for tinted surfaces and glows. */
export const withAlpha = (hex: string, alpha: number): string => {
  const channel = Math.round(clamp(alpha, 0, 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex.slice(0, 7)}${channel}`;
};
