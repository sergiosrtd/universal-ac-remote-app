import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createDefaultAcState } from '@/constants/ac';
import { StorageKeys } from '@/constants/storage';
import { applyAcCommand, normalizeAcState } from '@/features/remote/lib/ac-state-reducer';
import type { AcCapabilities, AcCommand, AcState, DeviceId, DeviceSyncStatus } from '@/types';

import { isWebServer, persistStorage } from './storage';

/**
 * Last known desired state per device (persisted) plus transient sync status.
 *
 * IR is one-way, so the app is the source of truth for IR devices and must remember
 * what it last sent. For Wi-Fi/BLE devices this acts as an optimistic cache that the
 * transport's `readState` reconciles.
 */
interface RemoteState {
  states: Record<DeviceId, AcState>;
  status: Record<DeviceId, DeviceSyncStatus>;
  errors: Record<DeviceId, string | undefined>;
}

interface RemoteActions {
  getState: (id: DeviceId, capabilities: AcCapabilities) => AcState;
  /** Applies a command optimistically and returns `{ previous, next }` for rollback. */
  dispatch: (
    id: DeviceId,
    command: AcCommand,
    capabilities: AcCapabilities,
  ) => { previous: AcState; next: AcState; changed: boolean };
  replaceState: (id: DeviceId, state: AcState) => void;
  setStatus: (id: DeviceId, status: DeviceSyncStatus, error?: string) => void;
  clearDevice: (id: DeviceId) => void;
}

export type RemoteStore = RemoteState & RemoteActions;

export const useRemoteStore = create<RemoteStore>()(
  persist(
    (set, get) => ({
      states: {},
      status: {},
      errors: {},

      getState: (id, capabilities) =>
        normalizeAcState(get().states[id] ?? createDefaultAcState(), capabilities),

      dispatch: (id, command, capabilities) => {
        const previous = get().getState(id, capabilities);
        const next = applyAcCommand(previous, command, capabilities);
        const changed = next !== previous;
        if (changed) set((s) => ({ states: { ...s.states, [id]: next } }));
        return { previous, next, changed };
      },

      replaceState: (id, state) => set((s) => ({ states: { ...s.states, [id]: state } })),

      setStatus: (id, status, error) =>
        set((s) => ({
          status: { ...s.status, [id]: status },
          errors: { ...s.errors, [id]: error },
        })),

      clearDevice: (id) =>
        set((s) => {
          const { [id]: _state, ...states } = s.states;
          const { [id]: _status, ...status } = s.status;
          const { [id]: _error, ...errors } = s.errors;
          return { states, status, errors };
        }),
    }),
    {
      name: StorageKeys.remoteStates,
      version: 1,
      storage: persistStorage,
      skipHydration: isWebServer,
      // Sync status is session-only; never restore a stale "sending" spinner.
      partialize: ({ states }) => ({ states }),
    },
  ),
);
