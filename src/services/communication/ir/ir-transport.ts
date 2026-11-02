import { hasIrEmitter, transmitIr } from 'expo-ir-blaster';

import { usePreferencesStore } from '@/store/preferences-store';
import { AppError, err, ok, type AcCommand, type AcState, type Result } from '@/types';

import { encodeCarrierAc64, type IrFrame } from './encode-carrier-ac64';
import { encodeCoolix, encodeCoolixLightToggle } from './encode-coolix';
import { encodeGree } from './encode-gree';
import { encodeMidea } from './encode-midea';
import { encodeToshiba } from './encode-toshiba';

const CARRIER_PROTOCOLS = new Set(['CARRIER_AC', 'CARRIER_AC64']);

let transmitQueue: Promise<void> = Promise.resolve();

export function encodeIrFrame(protocol: string, state: AcState): IrFrame | null {
  if (CARRIER_PROTOCOLS.has(protocol)) return encodeCarrierAc64(state);
  if (protocol === 'MIDEA') return encodeMidea(state);
  if (protocol === 'COOLIX') return encodeCoolix(state);
  if (protocol === 'TOSHIBA_AC') return encodeToshiba(state);
  if (protocol === 'GREE') return encodeGree(state);
  return null;
}

const SUPPORTED_PROTOCOLS = new Set([...CARRIER_PROTOCOLS, 'MIDEA', 'COOLIX', 'TOSHIBA_AC', 'GREE']);

/** Whether this app can encode the protocol. Unsupported ones are skipped by the code finder. */
export const isIrProtocolSupported = (protocol: string): boolean => SUPPORTED_PROTOCOLS.has(protocol);

/**
 * Carrier-branded splits ship with Coolix, Midea 48-bit, or Carrier/Surrey 64-bit
 * receivers depending on the OEM. Each receiver ignores the frames it can't decode.
 */
export function encodeIrFrames(protocol: string, state: AcState, command?: AcCommand): IrFrame[] {
  if (CARRIER_PROTOCOLS.has(protocol)) {
    if (command?.type === 'display-light/toggle') return [encodeCoolixLightToggle()];
    return [encodeCoolix(state), encodeMidea(state), encodeCarrierAc64(state)];
  }
  const frame = encodeIrFrame(protocol, state);
  return frame ? [frame] : [];
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
