import type { AcState, FanSpeed } from '@/types';

/**
 * Carrier/Surrey 64-bit frame, matching IRremoteESP8266 `IRCarrierAc64`.
 * The signal is sent least-significant bit first at 38 kHz.
 * Timings: header 8940/4556, bit mark 503, one-space 1736, zero-space 615.
 */
const HEADER_MARK = 8940;
const HEADER_SPACE = 4556;
const BIT_MARK = 503;
const ONE_SPACE = 1736;
const ZERO_SPACE = 615;
const MESSAGE_GAP = 100_000;

/** Powered-off template from `IRCarrierAc64::stateReset`. */
const BASE_STATE = 0x109000002c2a5584n;

const FAN_CODE: Record<FanSpeed, number> = {
  auto: 0b00,
  low: 0b01,
  medium: 0b10,
  high: 0b11,
};

export interface IrFrame {
  frequencyHz: number;
  pattern: number[];
}

const setBits = (state: bigint, offset: number, size: number, value: number): bigint => {
  const mask = (1n << BigInt(size)) - 1n;
  return (state & ~(mask << BigInt(offset))) | ((BigInt(value) & mask) << BigInt(offset));
};

/** Sum of nibbles in bits 20..63, which is the library's 4-bit checksum. */
const checksum = (state: bigint): number => {
  let data = (state >> 20n) & ((1n << 44n) - 1n);
  let sum = 0;
  while (data > 0n) {
    sum += Number(data & 0xfn);
    data >>= 4n;
  }
  return sum & 0xf;
};

export function buildCarrierAc64Raw(state: AcState): bigint {
  const temperature = Math.min(30, Math.max(16, Math.round(state.targetTemperature)));
  const mode = state.mode === 'heat' ? 0b01 : state.mode === 'fan' ? 0b11 : 0b10;
  let raw = BASE_STATE;
  raw = setBits(raw, 36, 1, state.power ? 1 : 0);
  raw = setBits(raw, 20, 2, mode);
  raw = setBits(raw, 22, 2, FAN_CODE[state.fanSpeed]);
  raw = setBits(raw, 24, 4, temperature - 16);
  raw = setBits(raw, 29, 1, state.verticalSwing === 'off' ? 0 : 1);
  return setBits(raw, 16, 4, checksum(raw));
}

export function encodeCarrierAc64(state: AcState): IrFrame {
  const raw = buildCarrierAc64Raw(state);
  const pattern = [HEADER_MARK, HEADER_SPACE];
  for (let bit = 0; bit < 64; bit += 1) {
    const one = ((raw >> BigInt(bit)) & 1n) === 1n;
    pattern.push(BIT_MARK, one ? ONE_SPACE : ZERO_SPACE);
  }
  pattern.push(BIT_MARK, MESSAGE_GAP);
  return { frequencyHz: 38_000, pattern };
}
