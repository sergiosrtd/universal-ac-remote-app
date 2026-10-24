import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { RemotePanel } from '@/features/remote/components/remote-panel';
import { useDevicesStore } from '@/store';
import type { DeviceId } from '@/types';

export default function RemoteScreen() {
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();
  const device = useDevicesStore((s) => (deviceId ? s.devices[deviceId as DeviceId] : undefined));
  const router = useRouter();

  if (!device) {
    return (
      <Screen edges={[]}>
        <Stack.Screen options={{ title: 'Remote' }} />
        <AppText variant="title">Remote not found</AppText>
        <AppText color="textSecondary">This remote may have been deleted.</AppText>
        <Button label="Go back" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['bottom']}>
      <Stack.Screen options={{ title: device.name }} />
      <RemotePanel device={device} />
    </Screen>
  );
}
