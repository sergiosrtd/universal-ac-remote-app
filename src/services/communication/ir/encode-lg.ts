import type { AcMode, AcState, FanSpeed } from '@/types';

import type { IrFrame } from './encode-carrier-ac64';

/**
 * LG 28-bit A/C protocol in its two timing variants: `LG2` for current LG
 * remotes (AKB7xxxx) and the original `LG`, also used by General Electric.
 * Reference: IRremoteESP8266 `IRLgAc` / `IRsend::sendLG` / `IRsend::sendLG2`.
 * The code is sent most-significant bit first at 38 kHz.
 */
const BIT_MARK_LG = 550;
const BIT_MARK_LG2 = 480;
const ONE_SPACE = 1600;
const ZERO_SPACE = 550;
const MIN_GAP = 39_750;
/** Each message, including its trailing gap, lasts at least this long. */
const MIN_MESSAGE_LENGTH = 108_050;
const BITS = 28;

const HEADER = {
  LG: { mark: 8500, space: 4250, bitMark: BIT_MARK_LG },
  LG2: { mark: 3200, space: 9900, bitMark: BIT_MARK_LG2 },
} as const;

export type LgVariant = keyof typeof HEADER;

/** Dedicated off command; LG does not send the rest of the state when turning off. */
const OFF_COMMAND = 0x88c0051;
const SIGNATURE = 0x88;
const MIN_TEMP = 16;
const MAX_TEMP = 30;
const TEMP_OFFSET = 15;

const MODE_CODE: Record<AcMode, number> = {
  cool: 0,
  dry: 1,
  fan: 2,
  auto: 3,
  heat: 4,
};

const FAN_CODE: Record<FanSpeed, number> = {
  auto: 5,
  low: 1,
  medium: 2,
  high: 4,
};

/** Sum of the four nibbles above the checksum nibble, modulo 16. */
const checksum = (raw: number): number => {
  let sum = 0;
  for (let shift = 4; shift < 20; shift += 4) sum += (raw >> shift) & 0xf;
  return sum & 0xf;
};

export function buildLgRaw(state: AcState): number {
  if (!state.power) return OFF_COMMAND;
  const celsius = Math.min(MAX_TEMP, Math.max(MIN_TEMP, Math.round(state.targetTemperature)));
  const raw =
    (SIGNATURE << 20) | (MODE_CODE[state.mode] << 12) | ((celsius - TEMP_OFFSET) << 8) | (FAN_CODE[state.fanSpeed] << 4);
  return raw | checksum(raw);
}

export function encodeLg(state: AcState, variant: LgVariant = 'LG2'): IrFrame {
  const raw = buildLgRaw(state);
  const { mark, space, bitMark } = HEADER[variant];
  const pattern: number[] = [mark, space];
  for (let bit = BITS - 1; bit >= 0; bit -= 1) {
    pattern.push(bitMark, (raw >> bit) & 1 ? ONE_SPACE : ZERO_SPACE);
  }
  pattern.push(bitMark);
  const elapsed = pattern.reduce((total, duration) => total + duration, 0);
  pattern.push(Math.max(MIN_GAP, MIN_MESSAGE_LENGTH - elapsed));
  return { frequencyHz: 38_000, pattern };
}
