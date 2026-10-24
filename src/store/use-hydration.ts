import { useSyncExternalStore } from 'react';

import { useDevicesStore } from './devices-store';
import { usePreferencesStore } from './preferences-store';
import { useRemoteStore } from './remote-store';

const persistedStores = [useDevicesStore, usePreferencesStore, useRemoteStore] as const;

const allHydrated = () => persistedStores.every((store) => store.persist.hasHydrated());

const subscribe = (onChange: () => void) => {
  const unsubscribers = persistedStores.map((store) => store.persist.onFinishHydration(onChange));
  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
};

/** True once every persisted store has finished loading from AsyncStorage. */
export function useStoresHydrated(): boolean {
  return useSyncExternalStore(subscribe, allHydrated, allHydrated);
}
