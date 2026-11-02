import type { AcMode, AcState, FanSpeed } from '@/types';

import type { IrFrame } from './encode-carrier-ac64';

/**
 * Samsung A/C protocol (DB93/DB96 remotes). The state is sent in 7-byte
 * sections, least-significant bit first at 38 kHz. Turning the unit on or off
 * needs the 21-byte "extended" message; other changes use the 14-byte one.
 * Reference: IRremoteESP8266 `IRSamsungAc` / `IRsend::sendSamsungAC`.
 */
const HEADER_MARK = 690;
const HEADER_SPACE = 17_844;
const SECTION_MARK = 3086;
const SECTION_SPACE = 8864;
const SECTION_GAP = 2886;
const BIT_MARK = 586;
const ONE_SPACE = 1432;
const ZERO_SPACE = 436;
const MESSAGE_GAP = 100_000;
const SECTION_LENGTH = 7;

const MIN_TEMP = 16;
const MAX_TEMP = 30;

const MODE_CODE: Record<AcMode, number> = {
  auto: 0,
  cool: 1,
  dry: 2,
  fan: 3,
  heat: 4,
};

const FAN_CODE: Record<FanSpeed, number> = {
  auto: 0,
  low: 2,
  medium: 4,
  high: 5,
};
/** Auto mode only accepts its own fan value. */
const AUTO_MODE_FAN = 6;
const SWING_VERTICAL = 0b010;
const SWING_OFF = 0b111;

/** Middle section of an extended message with every timer and sleep option off. */
const EXTENDED_MIDDLE = [0x01, 0xd2, 0x0f, 0x00, 0x00, 0x00, 0x00];

const popcount = (value: number): number => {
  let count = 0;
  for (let v = value; v; v >>= 1) count += v & 1;
  return count;
};

/** `IRSamsungAc::calcSectionChecksum`, stored across bytes 1 and 2 of the section. */
const applySectionChecksum = (raw: number[], offset: number) => {
  let sum = popcount(raw[offset]!) + popcount(raw[offset + 1]! & 0x0f) + popcount(raw[offset + 2]! >> 4);
  for (let i = 3; i < SECTION_LENGTH; i += 1) sum += popcount(raw[offset + i]!);
  const value = ~sum & 0xff;
  raw[offset + 1] = (raw[offset + 1]! & 0x0f) | ((value & 0x0f) << 4);
  raw[offset + 2] = (raw[offset + 2]! & 0xf0) | (value >> 4);
};

/** The normal 14-byte state, or the 21-byte power on/off message when `extended`. */
export function buildSamsungRaw(state: AcState, extended: boolean): number[] {
  const celsius = Math.min(MAX_TEMP, Math.max(MIN_TEMP, Math.round(state.targetTemperature)));
  const power = state.power ? 0b11 : 0b00;
  const fan = state.mode === 'auto' ? AUTO_MODE_FAN : FAN_CODE[state.fanSpeed];
  const swing = state.verticalSwing === 'off' ? SWING_OFF : SWING_VERTICAL;

  const first = [0x02, 0x92, 0x0f, 0x00, 0x00, 0x00, 0xc0 | (power << 4)];
  const second = [
    0x01,
    0x02,
    // Swing in bits 4–6; the low nibble holds part of the checksum.
    0x80 | (swing << 4),
    // Display on/off, plus fixed bits the reference remote always sends.
    0x61 | (state.displayLight ? 0x10 : 0),
    (celsius - MIN_TEMP) << 4,
    0x01 | (fan << 1) | (MODE_CODE[state.mode] << 4),
    0xc0 | (power << 4),
  ];
  const raw = extended ? [...first, ...EXTENDED_MIDDLE, ...second] : [...first, ...second];
  for (let offset = 0; offset < raw.length; offset += SECTION_LENGTH) applySectionChecksum(raw, offset);
  return raw;
}

export function encodeSamsung(state: AcState, extended: boolean): IrFrame {
  const raw = buildSamsungRaw(state, extended);
  const pattern = [HEADER_MARK, HEADER_SPACE];
  for (let offset = 0; offset < raw.length; offset += SECTION_LENGTH) {
    pattern.push(SECTION_MARK, SECTION_SPACE);
    for (let i = offset; i < offset + SECTION_LENGTH; i += 1) {
      for (let bit = 0; bit < 8; bit += 1) {
        pattern.push(BIT_MARK, (raw[i]! >> bit) & 1 ? ONE_SPACE : ZERO_SPACE);
      }
    }
    pattern.push(BIT_MARK, SECTION_GAP);
  }
  // The library ends with a 100 ms gap in total after the last section.
  pattern[pattern.length - 1] = MESSAGE_GAP;
  return { frequencyHz: 38_000, pattern };
}
