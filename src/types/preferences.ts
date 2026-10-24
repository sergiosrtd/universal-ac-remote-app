import type { TemperatureUnit } from './ac';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export interface UserPreferences {
  theme: ThemePreference;
  temperatureUnit: TemperatureUnit;
  hapticsEnabled: boolean;
  /** Plays the press animation and haptic but skips the transport; useful for demos. */
  simulationMode: boolean;
  /** Last opened remote, restored on launch. */
  lastActiveDeviceId: string | null;
}
