import type { AcMode, AcState, FanSpeed } from '@/types';

import type { IrFrame } from './encode-carrier-ac64';

/**
 * Coolix 24-bit A/C protocol, used by Midea-built splits (RG57/RG66/R51 remotes)
 * that are sold under Carrier, Midea, Beko, Tokio, Bosch and others.
 * Reference: IRremoteESP8266 `IRCoolixAC` / `IRsend::sendCOOLIX`.
 */
const TICK = 276;
const HEADER_MARK = 17 * TICK;
const HEADER_SPACE = 16 * TICK;
const BIT_MARK = 2 * TICK;
const ONE_SPACE = 6 * TICK;
const ZERO_SPACE = 2 * TICK;
const MIN_GAP = 19 * TICK;
const MESSAGE_GAP = 100_000;
/** The library sends every state twice. */
const SEND_COUNT = 2;

const POWER_OFF = 0xb27be0;
/** Dedicated display-LED toggle command. It does not change power or mode. */
const LED_TOGGLE = 0xb5f5a5;
const FAN_MODE_TEMP_CODE = 0b1110;

/** Index is °C − 17. The protocol uses a Gray-code-like table rather than a plain offset. */
const TEMP_CODES = [
  0b0000, 0b0001, 0b0011, 0b0010, 0b0110, 0b0111, 0b0101, 0b0100, 0b1100, 0b1101, 0b1001, 0b1000,
  0b1010, 0b1011,
] as const;

const MODE_CODE: Record<AcMode, number> = {
  cool: 0b00,
  dry: 0b01,
  auto: 0b10,
  heat: 0b11,
  fan: 0b01,
};

const FAN_CODE: Record<FanSpeed, number> = {
  auto: 0b101,
  low: 0b100,
  medium: 0b010,
  high: 0b001,
};
/** Auto and Dry only accept this auto-fan value. */
const FAN_AUTO_FIXED_MODES = 0b000;
const SENSOR_TEMP_IGNORE = 0b11111;

export function buildCoolixRaw(state: AcState): number {
  if (!state.power) return POWER_OFF;
  const celsius = Math.min(30, Math.max(17, Math.round(state.targetTemperature)));
  const tempCode = state.mode === 'fan' ? FAN_MODE_TEMP_CODE : TEMP_CODES[celsius - 17]!;
  const fan =
    state.mode === 'auto' || state.mode === 'dry'
      ? FAN_AUTO_FIXED_MODES
      : FAN_CODE[state.fanSpeed];
  const low = (tempCode << 4) | (MODE_CODE[state.mode] << 2);
  const middle = (fan << 5) | SENSOR_TEMP_IGNORE;
  return (0xb2 << 16) | (middle << 8) | low;
}

const appendByte = (pattern: number[], byte: number) => {
  for (let bit = 7; bit >= 0; bit -= 1) {
    pattern.push(BIT_MARK, (byte >> bit) & 1 ? ONE_SPACE : ZERO_SPACE);
  }
};

function encodeCoolixRaw(raw: number): IrFrame {
  const pattern: number[] = [];
  for (let send = 0; send < SEND_COUNT; send += 1) {
    pattern.push(HEADER_MARK, HEADER_SPACE);
    for (let shift = 16; shift >= 0; shift -= 8) {
      const byte = (raw >> shift) & 0xff;
      appendByte(pattern, byte);
      appendByte(pattern, byte ^ 0xff);
    }
    pattern.push(BIT_MARK, send === SEND_COUNT - 1 ? MIN_GAP + MESSAGE_GAP : MIN_GAP);
  }
  return { frequencyHz: 38_000, pattern };
}

export function encodeCoolix(state: AcState): IrFrame {
  return encodeCoolixRaw(buildCoolixRaw(state));
}

/** The Coolix protocol has a toggle-only LED command; no AC state is changed. */
export function encodeCoolixLightToggle(): IrFrame {
  return encodeCoolixRaw(LED_TOGGLE);
}
