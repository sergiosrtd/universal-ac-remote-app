import * as Haptics from 'expo-haptics';

import { usePreferencesStore } from '@/store/preferences-store';

/** Light tick for a selection. No-ops when haptics are off or the platform has none. */
export function tapFeedback(): void {
  if (!usePreferencesStore.getState().hapticsEnabled) return;
  void Haptics.selectionAsync().catch(() => undefined);
}
