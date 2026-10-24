import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import type { IconName } from '@/components/ui/icon';
import { ListCard } from '@/components/ui/list-card';
import { Screen } from '@/components/ui/screen';
import { getBrandById } from '@/constants/brands';
import { roomLabel } from '@/constants/rooms';
import { Layout, Spacing } from '@/constants/theme';
import { BrandMark } from '@/features/brands/components/brand-mark';
import { useOrderedDevices } from '@/store';

const ADD_ICON: IconName = { sf: 'plus', md: 'add' };

export default function RemotesScreen() {
  const devices = useOrderedDevices();
  const router = useRouter();
  const addRemote = () => router.push('/brands');

  if (devices.length === 0) {
    return (
      <Screen scroll>
        <View style={styles.empty}>
          <AppText variant="title" style={styles.center}>
            No remotes yet
          </AppText>
          <AppText color="textSecondary" style={styles.center}>
            Add your air conditioner once, then control it from here.
          </AppText>
          <Button label="Add my air conditioner" icon={ADD_ICON} large onPress={addRemote} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.list}>
        {devices.map((device) => {
          const brand = getBrandById(device.brandId);
          return (
            <ListCard
              key={device.id}
              title={device.name}
              subtitle={`${brand?.name ?? 'Unknown brand'} · ${roomLabel(device.room)}`}
              accessibilityLabel={`Open remote for ${device.name}`}
              leading={<BrandMark name={brand?.name ?? device.name} color={brand?.color} />}
              onPress={() => router.push({ pathname: '/remote/[deviceId]', params: { deviceId: device.id } })}
            />
          );
        })}
      </View>
      <Button label="Add another remote" icon={ADD_ICON} variant="secondary" onPress={addRemote} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, justifyContent: 'center', gap: Spacing.xl, paddingVertical: Spacing.xxxl },
  center: { textAlign: 'center' },
  list: { gap: Layout.touchGap },
});
