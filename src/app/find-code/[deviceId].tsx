import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { CodeFinder } from '@/features/remote/components/code-finder';
import { useTranslation } from '@/i18n';
import { useDevicesStore } from '@/store';
import type { DeviceId } from '@/types';

export default function FindCodeScreen() {
  const { deviceId, from } = useLocalSearchParams<{ deviceId: string; from?: 'add' | 'remote' }>();
  const device = useDevicesStore((s) => (deviceId ? s.devices[deviceId as DeviceId] : undefined));
  const router = useRouter();
  const { t } = useTranslation();

  if (!device) {
    return (
      <Screen edges={[]}>
        <AppText variant="title">{t.remote.notFound}</AppText>
        <AppText color="textSecondary">{t.remote.notFoundBody}</AppText>
        <Button label={t.common.goBack} variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  function done() {
    // Opened from the remote screen: go back to it. Opened right after adding: show the remote instead.
    if (from === 'remote' && router.canGoBack()) router.back();
    else router.replace({ pathname: '/remote/[deviceId]', params: { deviceId: device!.id } });
  }

  return (
    <Screen scroll edges={['bottom']}>
      <Stack.Screen options={{ title: t.navigation.findCode }} />
      <CodeFinder device={device} onDone={done} />
    </Screen>
  );
}
