import { hasIrEmitter, transmitIr } from 'expo-ir-blaster';

import { usePreferencesStore } from '@/store/preferences-store';
import { AppError, err, ok, type AcCommand, type AcState, type Result } from '@/types';

import { encodeCarrierAc64, type IrFrame } from './encode-carrier-ac64';
import { encodeCoolix, encodeCoolixLightToggle } from './encode-coolix';
import { encodeElectra } from './encode-electra';
import { encodeGree } from './encode-gree';
import { encodeLg } from './encode-lg';
import { encodeMidea } from './encode-midea';
import { encodeSamsung } from './encode-samsung';
import { encodeTcl } from './encode-tcl';
import { encodeToshiba } from './encode-toshiba';

let transmitQueue: Promise<void> = Promise.resolve();

const isPowerCommand = (command?: AcCommand): boolean =>
  !command || command.type === 'power/toggle' || command.type === 'power/set';

/**
 * Frames to send for one change. Protocol names follow IRremoteESP8266.
 * Combined codes send several frames; each receiver ignores the ones it can't decode.
 */
const ENCODERS: Record<string, (state: AcState, command?: AcCommand) => IrFrame[]> = {
  // Carrier-branded splits ship with Coolix, Midea 48-bit or Carrier/Surrey 64-bit
  // receivers depending on the OEM. CARRIER_AC is the name older saved remotes use.
  CARRIER_AC64: (state, command) =>
    command?.type === 'display-light/toggle'
      ? [encodeCoolixLightToggle()]
      : [encodeCoolix(state), encodeMidea(state), encodeCarrierAc64(state)],
  CARRIER_AC: (state, command) => ENCODERS.CARRIER_AC64!(state, command),
  // Midea-built units under other brand names answer one of these two.
  MIDEA_COOLIX: (state, command) =>
    command?.type === 'display-light/toggle'
      ? [encodeCoolixLightToggle()]
      : [encodeCoolix(state), encodeMidea(state)],
  MIDEA: (state) => [encodeMidea(state)],
  COOLIX: (state) => [encodeCoolix(state)],
  TOSHIBA_AC: (state) => [encodeToshiba(state)],
  GREE: (state) => [encodeGree(state)],
  LG: (state) => [encodeLg(state, 'LG')],
  LG2: (state) => [encodeLg(state, 'LG2')],
  // Power changes need Samsung's longer "extended" message.
  SAMSUNG_AC: (state, command) => [encodeSamsung(state, isPowerCommand(command))],
  TCL112AC: (state) => [encodeTcl(state)],
  ELECTRA_AC: (state, command) => [encodeElectra(state, command?.type === 'display-light/toggle')],
};

/** Whether this app can encode the protocol. Unsupported ones are skipped by the code finder. */
export const isIrProtocolSupported = (protocol: string): boolean => protocol in ENCODERS;

export function encodeIrFrames(protocol: string, state: AcState, command?: AcCommand): IrFrame[] {
  return ENCODERS[protocol]?.(state, command) ?? [];
}

/** Send one infrared frame. Calls are serialized so two presses cannot overlap on the emitter. */
export function transmitAcInfrared(
  protocol: string,
  state: AcState,
  command?: AcCommand,
): Promise<Result<void>> {
  const run = transmitQueue.then(() => sendOnce(protocol, state, command));
  transmitQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function sendOnce(protocol: string, state: AcState, command?: AcCommand): Promise<Result<void>> {
  if (usePreferencesStore.getState().simulationMode) {
    return err(new AppError('TRANSPORT_UNAVAILABLE', 'Simulation mode is on, so no infrared signal was sent.'));
  }
  const frames = encodeIrFrames(protocol, state, command);
  if (frames.length === 0) {
    return err(
      new AppError(
        'UNSUPPORTED_COMMAND',
        `Infrared encoding for ${protocol} is not implemented yet. Carrier uses CARRIER_AC64.`,
      ),
    );
  }
  if (!hasIrEmitter()) {
    return err(
      new AppError(
        'UNSUPPORTED_PLATFORM',
        'No infrared emitter found. Expo Go cannot transmit IR, and some Android phones have no blaster. Build and install with npx expo run:android, then point the top of the phone at the AC.',
      ),
    );
  }
  try {
    for (const frame of frames) {
      await transmitIr(frame.frequencyHz, frame.pattern);
    }
    return ok(undefined);
  } catch (error) {
    return err(AppError.from(error, 'TRANSPORT_UNAVAILABLE'));
  }
}
