import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { StorageKeys } from '@/constants/storage';
import type { UserPreferences } from '@/types';

import { isWebServer, persistStorage } from './storage';

interface PreferencesActions {
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  resetPreferences: () => void;
}

export type PreferencesStore = UserPreferences & PreferencesActions;

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'system',
  temperatureUnit: 'celsius',
  hapticsEnabled: true,
  simulationMode: false,
  lastActiveDeviceId: null,
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      setPreference: (key, value) => set({ [key]: value } as Pick<UserPreferences, typeof key>),
      resetPreferences: () => set(DEFAULT_PREFERENCES),
    }),
    {
      name: StorageKeys.preferences,
      version: 3,
      storage: persistStorage,
      skipHydration: isWebServer,
      migrate: (persisted, version) => {
        const stored = { ...DEFAULT_PREFERENCES, ...(persisted as Partial<UserPreferences>) };
        // Version 1 defaulted to simulation, which never transmitted.
        if (version < 2) stored.simulationMode = false;
        return stored;
      },
      partialize: ({ theme, language, temperatureUnit, hapticsEnabled, simulationMode, lastActiveDeviceId }) => ({
        theme,
        language,
        temperatureUnit,
        hapticsEnabled,
        simulationMode,
        lastActiveDeviceId,
      }),
    },
  ),
);
