import type { AcMode, AcState, FanSpeed } from '@/types';

import type { IrFrame } from './encode-carrier-ac64';

/**
 * Electra 104-bit A/C protocol, made by AUX and used by AUX-built units sold as
 * Electra, Electrolux, Frigidaire, AEG, Centek and others.
 * Reference: IRremoteESP8266 `IRElectraAc` / `IRsend::sendElectraAC`.
 * Bytes are sent least-significant bit first at 38 kHz.
 */
const HEADER_MARK = 9166;
const HEADER_SPACE = 4470;
const BIT_MARK = 646;
const ONE_SPACE = 1647;
const ZERO_SPACE = 547;
const MESSAGE_GAP = 100_000;

const MIN_TEMP = 16;
const MAX_TEMP = 32;
const TEMP_OFFSET = 8;
const SWING_ON = 0b000;
const SWING_OFF = 0b111;
/** The display light is a toggle: this value flips it, the other leaves it alone. */
const LIGHT_TOGGLE = 0x15;
const LIGHT_UNCHANGED = 0x08;

const MODE_CODE: Record<AcMode, number> = {
  auto: 0b000,
  cool: 0b001,
  dry: 0b010,
  heat: 0b100,
  fan: 0b110,
};

const FAN_CODE: Record<FanSpeed, number> = {
  auto: 0b101,
  low: 0b011,
  medium: 0b010,
  high: 0b001,
};

export function buildElectraRaw(state: AcState, toggleLight = false): number[] {
  const celsius = Math.min(MAX_TEMP, Math.max(MIN_TEMP, Math.round(state.targetTemperature)));
  const swingV = state.verticalSwing === 'off' ? SWING_OFF : SWING_ON;
  const swingH = state.horizontalSwing === 'off' ? SWING_OFF : SWING_ON;

  const raw = [
    0xc3,
    ((celsius - TEMP_OFFSET) << 3) | swingV,
    swingH << 5,
    0x00,
    FAN_CODE[state.fanSpeed] << 5,
    0x00,
    MODE_CODE[state.mode] << 5,
    0x00,
    0x00,
    state.power ? 0x20 : 0x00,
    0x00,
    toggleLight ? LIGHT_TOGGLE : LIGHT_UNCHANGED,
  ];
  raw.push(raw.reduce((sum, byte) => sum + byte, 0) & 0xff);
  return raw;
}

export function encodeElectra(state: AcState, toggleLight = false): IrFrame {
  const raw = buildElectraRaw(state, toggleLight);
  const pattern = [HEADER_MARK, HEADER_SPACE];
  for (const byte of raw) {
    for (let bit = 0; bit < 8; bit += 1) {
      pattern.push(BIT_MARK, (byte >> bit) & 1 ? ONE_SPACE : ZERO_SPACE);
    }
  }
  pattern.push(BIT_MARK, MESSAGE_GAP);
  return { frequencyHz: 38_000, pattern };
}
