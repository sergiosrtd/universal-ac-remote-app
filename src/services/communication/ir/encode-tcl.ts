import type { AcMode, AcState, FanSpeed } from '@/types';

import type { IrFrame } from './encode-carrier-ac64';

/**
 * TCL 112-bit A/C protocol, used by TCL and the units it builds for other
 * brands (including some Electrolux and Daewoo models).
 * Reference: IRremoteESP8266 `IRTcl112Ac` / `IRsend::sendTcl112Ac`.
 * Bytes are sent least-significant bit first at 38 kHz.
 */
const HEADER_MARK = 3000;
const HEADER_SPACE = 1650;
const BIT_MARK = 500;
const ONE_SPACE = 1050;
const ZERO_SPACE = 325;
const MESSAGE_GAP = 100_000;

const MIN_TEMP = 16;
const MAX_TEMP = 31;

const MODE_CODE: Record<AcMode, number> = {
  heat: 1,
  dry: 2,
  cool: 3,
  fan: 7,
  auto: 8,
};

const FAN_CODE: Record<FanSpeed, number> = {
  auto: 0b000,
  low: 0b010,
  medium: 0b011,
  high: 0b101,
};
const SWING_ON = 0b111;
const SWING_OFF = 0b000;

export function buildTclRaw(state: AcState): number[] {
  const celsius = Math.min(MAX_TEMP, Math.max(MIN_TEMP, Math.round(state.targetTemperature)));
  // `IRTcl112Ac::setMode` forces the highest fan speed in Fan mode.
  const fan = state.mode === 'fan' ? FAN_CODE.high : FAN_CODE[state.fanSpeed];
  const swing = state.verticalSwing === 'off' ? SWING_OFF : SWING_ON;

  const raw = [
    0x23, 0xcb, 0x26,
    // Normal (type 1) message.
    0x01,
    0x00,
    // Power, and the display light, which this protocol stores inverted (set = off).
    0x20 | (state.power ? 0x04 : 0) | (state.displayLight ? 0 : 0x40),
    MODE_CODE[state.mode],
    MAX_TEMP - celsius,
    fan | (swing << 3),
    0x00, 0x00, 0x00,
    // Marks a TCL-branded (TAC09CHSD) message.
    0x80,
  ];
  raw.push(raw.reduce((sum, byte) => sum + byte, 0) & 0xff);
  return raw;
}

export function encodeTcl(state: AcState): IrFrame {
  const raw = buildTclRaw(state);
  const pattern = [HEADER_MARK, HEADER_SPACE];
  for (const byte of raw) {
    for (let bit = 0; bit < 8; bit += 1) {
      pattern.push(BIT_MARK, (byte >> bit) & 1 ? ONE_SPACE : ZERO_SPACE);
    }
  }
  pattern.push(BIT_MARK, MESSAGE_GAP);
  return { frequencyHz: 38_000, pattern };
}
