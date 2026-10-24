import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { createTheme, type AppTheme } from '@/constants/theme';
import { usePreferencesStore } from '@/store/preferences-store';
import type { ResolvedTheme } from '@/types';

export function useResolvedScheme(): ResolvedTheme {
  const system = useColorScheme();
  const preference = usePreferencesStore((s) => s.theme);
  if (preference !== 'system') return preference;
  return system === 'light' ? 'light' : 'dark';
}

export function useAppTheme(): AppTheme {
  const scheme = useResolvedScheme();
  return useMemo(() => createTheme(scheme), [scheme]);
}
