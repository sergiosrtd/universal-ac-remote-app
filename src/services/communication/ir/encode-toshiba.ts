import type { AcMode, AcState, FanSpeed } from '@/types';

import type { IrFrame } from './encode-carrier-ac64';

/**
 * Toshiba 72-bit A/C protocol. Also used by Toshiba-Carrier splits such as the
 * Carrier 42NQV/38NYV series.
 * Reference: IRremoteESP8266 `IRToshibaAC` / `IRsend::sendToshibaAC`.
 * Bytes are sent most-significant bit first at 38 kHz, and the library sends
 * every state twice.
 */
const HEADER_MARK = 4400;
const HEADER_SPACE = 4300;
const BIT_MARK = 580;
const ONE_SPACE = 1600;
const ZERO_SPACE = 490;
const GAP = 7400;
const MESSAGE_GAP = 100_000;
const SEND_COUNT = 2;

const MIN_TEMP = 17;
const MAX_TEMP = 30;
const MODE_OFF = 0b111;

const MODE_CODE: Record<AcMode, number> = {
  auto: 0b000,
  cool: 0b001,
  dry: 0b010,
  heat: 0b011,
  fan: 0b100,
};

/** `IRToshibaAC::setFan` shifts every non-auto speed up by one. */
const FAN_CODE: Record<FanSpeed, number> = {
  auto: 0,
  low: 2,
  medium: 4,
  high: 6,
};

/**
 * Builds the 9-byte state. The first four bytes are the fixed header and the
 * length byte with their bitwise inverses; the last byte is an XOR checksum.
 */
export function buildToshibaRaw(state: AcState): number[] {
  const celsius = Math.min(MAX_TEMP, Math.max(MIN_TEMP, Math.round(state.targetTemperature)));
  const mode = state.power ? MODE_CODE[state.mode] : MODE_OFF;
  const raw = [0xf2, 0x0d, 0x03, 0xfc, 0x01, (celsius - MIN_TEMP) << 4, (FAN_CODE[state.fanSpeed] << 5) | mode, 0x00];
  raw.push(raw.reduce((sum, byte) => sum ^ byte, 0));
  return raw;
}

export function encodeToshiba(state: AcState): IrFrame {
  const raw = buildToshibaRaw(state);
  const pattern: number[] = [];
  for (let send = 0; send < SEND_COUNT; send += 1) {
    pattern.push(HEADER_MARK, HEADER_SPACE);
    for (const byte of raw) {
      for (let bit = 7; bit >= 0; bit -= 1) {
        pattern.push(BIT_MARK, (byte >> bit) & 1 ? ONE_SPACE : ZERO_SPACE);
      }
    }
    pattern.push(BIT_MARK, send === SEND_COUNT - 1 ? MESSAGE_GAP : GAP);
  }
  return { frequencyHz: 38_000, pattern };
}
