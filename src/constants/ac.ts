import type { IconName } from '@/components/ui/icon';
import type {
  AcCapabilities,
  AcMode,
  AcState,
  FanSpeed,
  HorizontalSwing,
  VerticalSwing,
} from '@/types';

export interface OptionMeta {
  label: string;
  /** SF Symbol name (iOS) / Material Symbol name (Android) for the control icon. */
  icon: IconName;
  /** A few plain words saying what the option does, shown under the label. */
  description?: string;
}

export const MODE_META: Record<AcMode, OptionMeta> = {
  cool: { label: 'Cool', description: 'Cold air', icon: { sf: 'snowflake', md: 'ac_unit' } },
  heat: { label: 'Heat', description: 'Warm air', icon: { sf: 'sun.max.fill', md: 'sunny' } },
  dry: { label: 'Dry', description: 'Less damp', icon: { sf: 'drop.fill', md: 'water_drop' } },
  fan: { label: 'Fan', description: 'Air only', icon: { sf: 'fan.fill', md: 'mode_fan' } },
  auto: { label: 'Auto', description: 'AC decides', icon: { sf: 'arrow.triangle.2.circlepath', md: 'autorenew' } },
};

export const FAN_SPEED_META: Record<FanSpeed, OptionMeta> = {
  auto: { label: 'Auto', icon: { sf: 'a.circle', md: 'hdr_auto' } },
  low: { label: 'Low', icon: { sf: 'wind', md: 'air' } },
  medium: { label: 'Medium', icon: { sf: 'wind', md: 'air' } },
  high: { label: 'High', icon: { sf: 'tornado', md: 'cyclone' } },
};

export const VERTICAL_SWING_LABELS: Record<VerticalSwing, string> = {
  off: 'Fixed',
  auto: 'Swing',
  top: 'Top',
  upper: 'Upper',
  middle: 'Middle',
  lower: 'Lower',
  bottom: 'Bottom',
};

export const HORIZONTAL_SWING_LABELS: Record<HorizontalSwing, string> = {
  off: 'Fixed',
  auto: 'Swing',
  left: 'Left',
  center: 'Center',
  right: 'Right',
  wide: 'Wide',
};

/** Fallback when a brand is unknown or its catalog entry fails to load. */
export const DEFAULT_CAPABILITIES: AcCapabilities = {
  modes: ['cool', 'heat', 'dry', 'fan', 'auto'],
  fanSpeeds: ['auto', 'low', 'medium', 'high'],
  verticalSwing: ['off', 'auto'],
  horizontalSwing: [],
  temperature: { min: 16, max: 30, step: 1 },
  temperatureLockedModes: ['fan'],
};

export const DEFAULT_TEMPERATURE = 24;

export const createDefaultAcState = (now: number = Date.now()): AcState => ({
  power: false,
  displayLight: true,
  mode: 'cool',
  targetTemperature: DEFAULT_TEMPERATURE,
  fanSpeed: 'auto',
  verticalSwing: 'off',
  horizontalSwing: 'off',
  updatedAt: now,
});

/** Milliseconds to coalesce rapid presses (e.g. holding temp +) into one transmission. */
export const COMMAND_DEBOUNCE_MS = 250;
export const TRANSPORT_TIMEOUT_MS = 8000;
