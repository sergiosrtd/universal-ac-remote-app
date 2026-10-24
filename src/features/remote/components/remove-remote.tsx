import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import type { IconName } from '@/components/ui/icon';
import { Layout, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useTranslation } from '@/i18n';
import { useDevicesStore, usePreferencesStore, useRemoteStore } from '@/store';
import type { SavedDevice } from '@/types';
import { withAlpha } from '@/utils/color';

const TRASH: IconName = { sf: 'trash', md: 'delete' };

export interface RemoveRemoteProps {
  device: SavedDevice;
  /** Called after the question appears, so the screen can scroll it into view. */
  onAsk?: () => void;
}

/**
 * Two-step removal shown in place, not in a pop-up: the first tap asks, the
 * second confirms. A pop-up is easy to dismiss by accident and does not work on web.
 */
export function RemoveRemote({ device, onAsk }: RemoveRemoteProps) {
  const router = useRouter();
  const { colors, radii, borders } = useAppTheme();
  const [confirming, setConfirming] = useState(false);
  const { t } = useTranslation();

  function remove() {
    // Leave the screen first so it never renders "Remote not found" for the removed device.
    router.dismissTo('/');
    useRemoteStore.getState().clearDevice(device.id);
    const preferences = usePreferencesStore.getState();
    if (preferences.lastActiveDeviceId === device.id) preferences.setPreference('lastActiveDeviceId', null);
    useDevicesStore.getState().removeDevice(device.id);
  }

  if (!confirming) {
    return (
      <Button
        label={t.removeRemote.button}
        icon={TRASH}
        variant="secondary"
        accessibilityHint={t.removeRemote.hint}
        onPress={() => {
          setConfirming(true);
          // Wait a frame so the question has been laid out before scrolling to it.
          requestAnimationFrame(() => onAsk?.());
        }}
      />
    );
  }

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.root,
        {
          backgroundColor: withAlpha(colors.danger, 0.1),
          borderColor: colors.danger,
          borderWidth: borders.regular,
          borderRadius: radii.lg,
        },
      ]}>
      <AppText variant="heading">{t.removeRemote.question(device.name)}</AppText>
      <AppText>{t.removeRemote.body}</AppText>
      <View style={styles.actions}>
        <Button label={t.removeRemote.confirm} icon={TRASH} variant="danger" large onPress={remove} />
        <Button label={t.removeRemote.cancel} variant="secondary" large onPress={() => setConfirming(false)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.md, padding: Spacing.lg },
  actions: { gap: Layout.touchGap, marginTop: Spacing.sm },
});
