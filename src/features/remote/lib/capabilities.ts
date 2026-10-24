import { getBrandById } from '@/constants/brands';
import { DEFAULT_CAPABILITIES } from '@/constants/ac';
import type { AcCapabilities, AcMode, SavedDevice, TemperatureRange } from '@/types';

/** Brand defaults merged with the selected model profile, falling back to generic capabilities. */
export const resolveCapabilities = (device: Pick<SavedDevice, 'brandId' | 'modelId'>): AcCapabilities => {
  const brand = getBrandById(device.brandId);
  if (!brand) return DEFAULT_CAPABILITIES;

  const model = device.modelId ? brand.models.find((m) => m.id === device.modelId) : undefined;
  return { ...brand.capabilities, ...model?.capabilities };
};

export const getTemperatureRange = (capabilities: AcCapabilities, mode: AcMode): TemperatureRange =>
  capabilities.temperatureByMode?.[mode] ?? capabilities.temperature;

export const isTemperatureLocked = (capabilities: AcCapabilities, mode: AcMode): boolean =>
  capabilities.temperatureLockedModes?.includes(mode) ?? false;
