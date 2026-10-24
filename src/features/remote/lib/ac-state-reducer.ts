import type { AcCapabilities, AcCommand, AcState } from '@/types';
import { clamp, roundToStep } from '@/utils/math';

import { getTemperatureRange, isTemperatureLocked } from './capabilities';

/**
 * Coerce a state so every field is something the unit supports. Run after every
 * command and when capabilities change (e.g. the user switches model profile).
 */
export const normalizeAcState = (state: AcState, capabilities: AcCapabilities): AcState => {
  const mode = capabilities.modes.includes(state.mode) ? state.mode : (capabilities.modes[0] ?? state.mode);
  const range = getTemperatureRange(capabilities, mode);

  const pick = <T>(value: T, allowed: readonly T[], fallback: T): T =>
    allowed.length === 0 ? fallback : allowed.includes(value) ? value : (allowed[0] ?? fallback);

  return {
    ...state,
    // Existing persisted remotes predate this field. Carrier's IR command is
    // toggle-only, so assume its display starts enabled until the user changes it.
    displayLight: state.displayLight ?? true,
    mode,
    targetTemperature: clamp(roundToStep(state.targetTemperature, range.step), range.min, range.max),
    fanSpeed: pick(state.fanSpeed, capabilities.fanSpeeds, 'auto'),
    verticalSwing: pick(state.verticalSwing, capabilities.verticalSwing, 'off'),
    horizontalSwing: pick(state.horizontalSwing, capabilities.horizontalSwing, 'off'),
  };
};

/**
 * Pure reducer: (state, command, capabilities) -> next state. Returns the same
 * reference when the command is a no-op so callers can skip transmitting.
 */
export const applyAcCommand = (
  state: AcState,
  command: AcCommand,
  capabilities: AcCapabilities,
  now: number = Date.now(),
): AcState => {
  const range = getTemperatureRange(capabilities, state.mode);
  const tempLocked = isTemperatureLocked(capabilities, state.mode);

  let next: AcState;
  switch (command.type) {
    case 'power/toggle':
      next = { ...state, power: !state.power };
      break;
    case 'power/set':
      next = { ...state, power: command.value };
      break;
    case 'display-light/toggle':
      next = { ...state, displayLight: !state.displayLight };
      break;
    case 'mode/set':
      if (!capabilities.modes.includes(command.value)) return state;
      next = { ...state, mode: command.value };
      break;
    case 'temperature/set':
      if (tempLocked) return state;
      next = { ...state, targetTemperature: command.value };
      break;
    case 'temperature/increment':
      if (tempLocked) return state;
      next = { ...state, targetTemperature: state.targetTemperature + range.step };
      break;
    case 'temperature/decrement':
      if (tempLocked) return state;
      next = { ...state, targetTemperature: state.targetTemperature - range.step };
      break;
    case 'fan/set':
      if (!capabilities.fanSpeeds.includes(command.value)) return state;
      next = { ...state, fanSpeed: command.value };
      break;
    case 'swing/vertical/set':
      if (!capabilities.verticalSwing.includes(command.value)) return state;
      next = { ...state, verticalSwing: command.value };
      break;
    case 'swing/horizontal/set':
      if (!capabilities.horizontalSwing.includes(command.value)) return state;
      next = { ...state, horizontalSwing: command.value };
      break;
  }

  const normalized = normalizeAcState(next, capabilities);
  const unchanged =
    normalized.power === state.power &&
    normalized.displayLight === state.displayLight &&
    normalized.mode === state.mode &&
    normalized.targetTemperature === state.targetTemperature &&
    normalized.fanSpeed === state.fanSpeed &&
    normalized.verticalSwing === state.verticalSwing &&
    normalized.horizontalSwing === state.horizontalSwing;

  return unchanged ? state : { ...normalized, updatedAt: now };
};
