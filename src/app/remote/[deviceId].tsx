import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef } from 'react';
import type { ScrollViewInstance } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import type { IconName } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { RemotePanel } from '@/features/remote/components/remote-panel';
import { RemoveRemote } from '@/features/remote/components/remove-remote';
import { getIrCodeCandidates } from '@/features/remote/lib/ir-codes';
import { useTranslation } from '@/i18n';
import { useDevicesStore } from '@/store';
import type { DeviceId } from '@/types';

const SEARCH_ICON: IconName = { sf: 'magnifyingglass', md: 'search' };

export default function RemoteScreen() {
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();
  const device = useDevicesStore((s) => (deviceId ? s.devices[deviceId as DeviceId] : undefined));
  const router = useRouter();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const { t } = useTranslation();
  const codeCount = useMemo(() => (device ? getIrCodeCandidates(device).length : 0), [device]);

  if (!device) {
    return (
      <Screen edges={[]}>
        <Stack.Screen options={{ title: t.navigation.remote }} />
        <AppText variant="title">{t.remote.notFound}</AppText>
        <AppText color="textSecondary">{t.remote.notFoundBody}</AppText>
        <Button label={t.common.goBack} variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['bottom']} scrollRef={scrollRef}>
      <Stack.Screen options={{ title: device.name }} />
      <RemotePanel device={device} />
      {codeCount > 1 ? (
        <Button
          label={t.codeFinder.openFromRemote}
          icon={SEARCH_ICON}
          variant="secondary"
          accessibilityHint={t.codeFinder.openFromRemoteHint}
          onPress={() =>
            router.push({ pathname: '/find-code/[deviceId]', params: { deviceId: device.id, from: 'remote' } })
          }
        />
      ) : null}
      <RemoveRemote device={device} onAsk={() => scrollRef.current?.scrollToEnd({ animated: true })} />
    </Screen>
  );
}
