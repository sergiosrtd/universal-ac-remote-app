import type { AcState } from './ac';
import type { BrandId } from './brand';
import type { ConnectionConfig } from './connection';

export type DeviceId = string & { readonly __brand: 'DeviceId' };

export type RoomType = 'living-room' | 'bedroom' | 'office' | 'kitchen' | 'kids-room' | 'other';

/** A user-configured remote, e.g. "Living Room AC". */
export interface SavedDevice {
  id: DeviceId;
  name: string;
  room: RoomType;
  brandId: BrandId;
  /** `AcModelProfile.id`; omitted means "use brand defaults". */
  modelId?: string;
  connection: ConnectionConfig;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export type NewDeviceInput = Omit<SavedDevice, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'> & {
  isFavorite?: boolean;
};

export type DeviceUpdate = Partial<Omit<SavedDevice, 'id' | 'createdAt'>>;

/** Live status of a remote session, separate from the persisted desired state. */
export type DeviceSyncStatus = 'idle' | 'sending' | 'synced' | 'error';

export interface RemoteSession {
  deviceId: DeviceId;
  state: AcState;
  status: DeviceSyncStatus;
  lastError?: string;
}
