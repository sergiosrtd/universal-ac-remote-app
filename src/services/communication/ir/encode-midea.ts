import type { AcMode, AcState, FanSpeed } from '@/types';

import type { IrFrame } from './encode-carrier-ac64';

/**
 * Midea's 48-bit A/C protocol, also used by a number of Carrier-branded splits.
 * Each command sends the state, followed by its bitwise inverse, at 38 kHz.
 * Reference: IRremoteESP8266 `IRMideaAC` / `IRsend::sendMidea`.
 */
const HEADER_MARK = 4480;
const HEADER_SPACE = 4480;
const BIT_MARK = 560;
const ONE_SPACE = 1680;
const ZERO_SPACE = 560;
const FRAME_GAP = 5600;
const MESSAGE_GAP = 100_000;
const MASK_48 = (1n << 48n) - 1n;

const MIDEA_MODE: Record<AcMode, number> = {
  cool: 0,
  dry: 1,
  auto: 2,
  heat: 3,
  fan: 4,
};

const MIDEA_FAN: Record<FanSpeed, number> = {
  auto: 0,
  low: 1,
  medium: 2,
  high: 3,
};

const setByte = (raw: bigint, byteIndexFromLsb: number, value: number): bigint => {
  const shift = BigInt(byteIndexFromLsb * 8);
  return (raw & ~(0xffn << shift)) | (BigInt(value & 0xff) << shift);
};

const reverseByte = (value: number): number => {
  let result = 0;
  for (let bit = 0; bit < 8; bit += 1) {
    result = (result << 1) | ((value >> bit) & 1);
  }
  return result;
};

/** Matches `IRMideaAC::calcChecksum`. */
const checksum = (raw: bigint): number => {
  let sum = 0;
  for (let byte = 1; byte <= 5; byte += 1) {
    sum += reverseByte(Number((raw >> BigInt(byte * 8)) & 0xffn));
  }
  return reverseByte((-sum) & 0xff);
};

export function buildMideaRaw(state: AcState): bigint {
  // A1 header, command type, timers disabled, Celsius state. The low byte is
  // calculated below. This is the reference library's known-good layout.
  let raw = 0xa10040ffff00n;
  const temperature = Math.min(30, Math.max(17, Math.round(state.targetTemperature)));
  const modeFanPower =
    (state.power ? 0x80 : 0) | (MIDEA_FAN[state.fanSpeed] << 3) | MIDEA_MODE[state.mode];

  raw = setByte(raw, 4, modeFanPower);
  // Bits 0..4 are Celsius − 17; bit 5 is the Fahrenheit selector and stays
  // clear; bit 6 is set in Midea A/C command frames.
  raw = setByte(raw, 3, 0x40 | (temperature - 17));
  return setByte(raw, 0, checksum(raw));
}

const appendPayload = (pattern: number[], payload: bigint) => {
  pattern.push(HEADER_MARK, HEADER_SPACE);
  for (let bit = 47; bit >= 0; bit -= 1) {
    const one = ((payload >> BigInt(bit)) & 1n) === 1n;
    pattern.push(BIT_MARK, one ? ONE_SPACE : ZERO_SPACE);
  }
  pattern.push(BIT_MARK);
};

export function encodeMidea(state: AcState): IrFrame {
  const raw = buildMideaRaw(state);
  const pattern: number[] = [];
  appendPayload(pattern, raw);
  pattern.push(FRAME_GAP);
  appendPayload(pattern, (~raw) & MASK_48);
  pattern.push(MESSAGE_GAP);
  return { frequencyHz: 38_000, pattern };
}
