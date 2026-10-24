import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';

/**
 * A Node render (web SSR) has no `window`, and AsyncStorage's web build reads
 * `window.localStorage`. Native also has no `window`, so the check is web-only.
 */
export const isWebServer = Platform.OS === 'web' && typeof window === 'undefined';

/**
 * AsyncStorage adapter that never throws into the UI: a failed read hydrates the
 * store with defaults, and a failed write is logged and retried on the next change.
 */
const safeAsyncStorage: StateStorage = {
  getItem: async (name) => {
    if (isWebServer) return null;
    try {
      return await AsyncStorage.getItem(name);
    } catch (error) {
      console.warn(`[storage] read failed for "${name}"`, error);
      return null;
    }
  },
  setItem: async (name, value) => {
    if (isWebServer) return;
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.warn(`[storage] write failed for "${name}"`, error);
    }
  },
  removeItem: async (name) => {
    if (isWebServer) return;
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.warn(`[storage] remove failed for "${name}"`, error);
    }
  },
};

export const persistStorage = createJSONStorage(() => safeAsyncStorage);
