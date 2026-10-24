import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import type { IconName } from '@/components/ui/icon';
import { ListCard } from '@/components/ui/list-card';
import { Screen } from '@/components/ui/screen';
import { getBrandById } from '@/constants/brands';
import { Layout, Spacing } from '@/constants/theme';
import { BrandMark } from '@/features/brands/components/brand-mark';
import { useTranslation } from '@/i18n';
import { useOrderedDevices } from '@/store';

const ADD_ICON: IconName = { sf: 'plus', md: 'add' };

export default function RemotesScreen() {
  const devices = useOrderedDevices();
  const router = useRouter();
  const { t } = useTranslation();
  const addRemote = () => router.push('/brands');

  if (devices.length === 0) {
    return (
      <Screen scroll>
        <View style={styles.empty}>
          <AppText variant="title" style={styles.center}>
            {t.remotes.emptyTitle}
          </AppText>
          <AppText color="textSecondary" style={styles.center}>
            {t.remotes.emptyBody}
          </AppText>
          <Button label={t.remotes.addFirst} icon={ADD_ICON} large onPress={addRemote} />
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
              subtitle={`${brand?.name ?? t.common.unknownBrand} · ${t.rooms[device.room]}`}
              accessibilityLabel={t.remotes.open(device.name)}
              leading={<BrandMark name={brand?.name ?? device.name} color={brand?.color} />}
              onPress={() => router.push({ pathname: '/remote/[deviceId]', params: { deviceId: device.id } })}
            />
          );
        })}
      </View>
      <Button label={t.remotes.addAnother} icon={ADD_ICON} variant="secondary" onPress={addRemote} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, justifyContent: 'center', gap: Spacing.xl, paddingVertical: Spacing.xxxl },
  center: { textAlign: 'center' },
  list: { gap: Layout.touchGap },
});
