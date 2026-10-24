import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { StorageKeys } from '@/constants/storage';
import type { DeviceId, DeviceUpdate, NewDeviceInput, SavedDevice } from '@/types';
import { createId } from '@/utils/id';

import { isWebServer, persistStorage } from './storage';

interface DevicesState {
  devices: Record<DeviceId, SavedDevice>;
  /** Display order; kept separate so reordering doesn't rewrite every record. */
  order: DeviceId[];
}

interface DevicesActions {
  addDevice: (input: NewDeviceInput) => SavedDevice;
  updateDevice: (id: DeviceId, update: DeviceUpdate) => void;
  removeDevice: (id: DeviceId) => void;
  toggleFavorite: (id: DeviceId) => void;
  reorder: (order: DeviceId[]) => void;
}

export type DevicesStore = DevicesState & DevicesActions;

const initialState: DevicesState = { devices: {}, order: [] };

export const useDevicesStore = create<DevicesStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addDevice: (input) => {
        const now = Date.now();
        const device: SavedDevice = {
          ...input,
          id: createId('dev') as DeviceId,
          isFavorite: input.isFavorite ?? false,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          devices: { ...s.devices, [device.id]: device },
          order: [...s.order, device.id],
        }));
        return device;
      },

      updateDevice: (id, update) => {
        const existing = get().devices[id];
        if (!existing) return;
        set((s) => ({
          devices: { ...s.devices, [id]: { ...existing, ...update, updatedAt: Date.now() } },
        }));
      },

      removeDevice: (id) =>
        set((s) => {
          const { [id]: _removed, ...devices } = s.devices;
          return { devices, order: s.order.filter((d) => d !== id) };
        }),

      toggleFavorite: (id) => {
        const existing = get().devices[id];
        if (existing) get().updateDevice(id, { isFavorite: !existing.isFavorite });
      },

      reorder: (order) =>
        set((s) => {
          const known = order.filter((id) => id in s.devices);
          const missing = s.order.filter((id) => !known.includes(id));
          return { order: [...known, ...missing] };
        }),
    }),
    {
      name: StorageKeys.devices,
      version: 1,
      storage: persistStorage,
      skipHydration: isWebServer,
      partialize: ({ devices, order }) => ({ devices, order }),
      migrate: (persisted, version) => {
        // Add a `case` per schema bump; unknown/corrupt data resets to empty.
        if (version === 1 && persisted && typeof persisted === 'object') return persisted as DevicesState;
        return initialState;
      },
    },
  ),
);

const listOrderedDevices = (devices: Record<DeviceId, SavedDevice>, order: DeviceId[]): SavedDevice[] =>
  order.flatMap((id) => {
    const device = devices[id];
    return device ? [device] : [];
  });

/**
 * Select `devices` and `order` themselves. Deriving the array inside a Zustand
 * selector returns a new reference on every snapshot, and React then re-renders forever.
 */
export function useOrderedDevices(): SavedDevice[] {
  const devices = useDevicesStore((s) => s.devices);
  const order = useDevicesStore((s) => s.order);
  return useMemo(() => listOrderedDevices(devices, order), [devices, order]);
}

export function useFavoriteDevices(): SavedDevice[] {
  const devices = useOrderedDevices();
  return useMemo(() => devices.filter((device) => device.isFavorite), [devices]);
}
