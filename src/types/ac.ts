/**
 * Core air-conditioner domain model.
 *
 * These types are transport-agnostic: the same `AcState` is encoded into an IR
 * frame, a cloud API payload, or a BLE characteristic write by the matching
 * transport in `src/services/communication/`.
 */

export const AC_MODES = ['cool', 'heat', 'dry', 'fan', 'auto'] as const;
export type AcMode = (typeof AC_MODES)[number];

export const FAN_SPEEDS = ['auto', 'low', 'medium', 'high'] as const;
export type FanSpeed = (typeof FAN_SPEEDS)[number];

export const VERTICAL_SWING_MODES = ['off', 'auto', 'top', 'upper', 'middle', 'lower', 'bottom'] as const;
export type VerticalSwing = (typeof VERTICAL_SWING_MODES)[number];

export const HORIZONTAL_SWING_MODES = ['off', 'auto', 'left', 'center', 'right', 'wide'] as const;
export type HorizontalSwing = (typeof HORIZONTAL_SWING_MODES)[number];

export type TemperatureUnit = 'celsius' | 'fahrenheit';

/** Temperatures are always stored in Celsius; conversion happens at the UI edge. */
export type Celsius = number;

export interface TemperatureRange {
  min: Celsius;
  max: Celsius;
  /** Smallest supported increment, e.g. 1 or 0.5. */
  step: number;
}

/** Full desired state of a unit. Most AC protocols send the whole state on every press. */
export interface AcState {
  power: boolean;
  /**
   * Desired indoor-unit display light. IR remotes commonly expose this as a
   * toggle command, so it is the app's best-known state rather than a reading.
   */
  displayLight: boolean;
  mode: AcMode;
  targetTemperature: Celsius;
  fanSpeed: FanSpeed;
  verticalSwing: VerticalSwing;
  horizontalSwing: HorizontalSwing;
  /** Epoch ms of the last change, used for sync/conflict resolution with cloud transports. */
  updatedAt: number;
}

/**
 * User intents emitted by the remote UI. Reducers turn these into a new `AcState`,
 * and transports may also use them directly for protocols that send deltas.
 */
export type AcCommand =
  | { type: 'power/toggle' }
  | { type: 'power/set'; value: boolean }
  | { type: 'display-light/toggle' }
  | { type: 'mode/set'; value: AcMode }
  | { type: 'temperature/set'; value: Celsius }
  | { type: 'temperature/increment' }
  | { type: 'temperature/decrement' }
  | { type: 'fan/set'; value: FanSpeed }
  | { type: 'swing/vertical/set'; value: VerticalSwing }
  | { type: 'swing/horizontal/set'; value: HorizontalSwing };

export type AcCommandType = AcCommand['type'];
