import type { TemperatureUnit } from './ac';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export type Language = 'en' | 'es';
export type LanguagePreference = 'system' | Language;

export interface UserPreferences {
  theme: ThemePreference;
  /** `system` follows the phone's language, falling back to English. */
  language: LanguagePreference;
  /** False until the person picks a language on the first-run screen. */
  languageChosen: boolean;
  temperatureUnit: TemperatureUnit;
  hapticsEnabled: boolean;
  /** Plays the press animation and haptic but skips the transport; useful for demos. */
  simulationMode: boolean;
  /** Last opened remote, restored on launch. */
  lastActiveDeviceId: string | null;
}
