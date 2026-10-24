import { requireNativeModule } from 'expo';

type NativeIrBlaster = {
  hasIrEmitter(): boolean;
  transmit(frequencyHz: number, pattern: number[]): Promise<void> | void;
};

let native: NativeIrBlaster | null | undefined;

function loadNative(): NativeIrBlaster | null {
  if (native !== undefined) return native;
  try {
    native = requireNativeModule<NativeIrBlaster>('ExpoIrBlaster');
  } catch {
    native = null;
  }
  return native;
}

export function hasIrEmitter(): boolean {
  try {
    return loadNative()?.hasIrEmitter() ?? false;
  } catch {
    return false;
  }
}

export async function transmitIr(frequencyHz: number, pattern: number[]): Promise<void> {
  const module = loadNative();
  if (!module) {
    throw new Error(
      'Infrared is unavailable in Expo Go. Install the Android development build with npx expo run:android.',
    );
  }
  await module.transmit(frequencyHz, pattern);
}
