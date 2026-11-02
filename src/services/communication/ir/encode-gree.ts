import type { AcMode, AcState, FanSpeed } from '@/types';

import type { IrFrame } from './encode-carrier-ac64';

/**
 * Gree 64-bit A/C protocol (YAW1F remote layout), used by Gree and the many
 * brands Gree builds for, including some Carrier, Tosot and Kelvinator units.
 * Reference: IRremoteESP8266 `IRGreeAC` / `IRsend::sendGree`.
 * Bytes are sent least-significant bit first at 38 kHz in two blocks of four,
 * with a 3-bit footer and a long gap between them.
 */
const HEADER_MARK = 9000;
const HEADER_SPACE = 4500;
const BIT_MARK = 620;
const ONE_SPACE = 1600;
const ZERO_SPACE = 540;
const BLOCK_GAP = 19_980;
const MESSAGE_GAP = 100_000;
const BLOCK_FOOTER = 0b010;
const BLOCK_FOOTER_BITS = 3;

const MIN_TEMP = 16;
const MAX_TEMP = 30;
/** Gree locks Auto mode to 25 °C. */
const AUTO_MODE_TEMP = 25;
/** Gree locks Dry mode to the lowest fan speed. */
const DRY_MODE_FAN = 1;
/** `IRKelvinatorAC::calcBlockChecksum` starts from this value. */
const CHECKSUM_START = 10;

const MODE_CODE: Record<AcMode, number> = {
  auto: 0,
  cool: 1,
  dry: 2,
  fan: 3,
  heat: 4,
};

const FAN_CODE: Record<FanSpeed, number> = {
  auto: 0,
  low: 1,
  medium: 2,
  high: 3,
};

/** Low nibbles of bytes 0–3 plus high nibbles of bytes 4–6, modulo 16. */
const checksum = (raw: readonly number[]): number => {
  let sum = CHECKSUM_START;
  for (let i = 0; i < 4; i += 1) sum += raw[i]! & 0x0f;
  for (let i = 4; i < 7; i += 1) sum += raw[i]! >> 4;
  return sum & 0x0f;
};

export function buildGreeRaw(state: AcState): number[] {
  const celsius =
    state.mode === 'auto'
      ? AUTO_MODE_TEMP
      : Math.min(MAX_TEMP, Math.max(MIN_TEMP, Math.round(state.targetTemperature)));
  const fan = state.mode === 'dry' ? DRY_MODE_FAN : FAN_CODE[state.fanSpeed];
  const swingAuto = state.verticalSwing !== 'off';

  const raw = [
    // Mode, power, fan, automatic vertical swing. Sleep stays off.
    MODE_CODE[state.mode] | (state.power ? 0x08 : 0) | (fan << 4) | (swingAuto ? 0x40 : 0),
    celsius - MIN_TEMP,
    // Display light, and the YAW1F model bit that the library sets while powered on.
    (state.displayLight ? 0x20 : 0) | (state.power ? 0x40 : 0),
    0x50,
    // Vertical swing position: 1 = automatic, 0 = keep the last position.
    swingAuto ? 0x01 : 0x00,
    0x20,
    0x00,
    0x00,
  ];
  raw[7] = checksum(raw) << 4;
  return raw;
}

const appendLsbFirst = (pattern: number[], value: number, bits: number) => {
  for (let bit = 0; bit < bits; bit += 1) {
    pattern.push(BIT_MARK, (value >> bit) & 1 ? ONE_SPACE : ZERO_SPACE);
  }
};

export function encodeGree(state: AcState): IrFrame {
  const raw = buildGreeRaw(state);
  const pattern = [HEADER_MARK, HEADER_SPACE];
  for (let i = 0; i < 4; i += 1) appendLsbFirst(pattern, raw[i]!, 8);
  appendLsbFirst(pattern, BLOCK_FOOTER, BLOCK_FOOTER_BITS);
  pattern.push(BIT_MARK, BLOCK_GAP);
  for (let i = 4; i < 8; i += 1) appendLsbFirst(pattern, raw[i]!, 8);
  pattern.push(BIT_MARK, BLOCK_GAP + MESSAGE_GAP);
  return { frequencyHz: 38_000, pattern };
}
