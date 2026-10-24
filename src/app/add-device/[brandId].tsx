import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import type { IconName } from '@/components/ui/icon';
import { OptionButton } from '@/components/ui/option-button';
import { Screen } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { TextField } from '@/components/ui/text-field';
import { getBrandById } from '@/constants/brands';
import { ROOM_TYPES } from '@/constants/rooms';
import { Layout, Spacing } from '@/constants/theme';
import { BrandMark } from '@/features/brands/components/brand-mark';
import { useTranslation, type Translations } from '@/i18n';
import { useDevicesStore } from '@/store';
import type { RoomType } from '@/types';

const SAVE_ICON: IconName = { sf: 'checkmark', md: 'check' };

export default function AddDeviceScreen() {
  const { brandId } = useLocalSearchParams<{ brandId: string }>();
  const brand = getBrandById(brandId ?? '');
  const router = useRouter();
  const { t } = useTranslation();

  const [room, setRoom] = useState<RoomType>('living-room');
  const [name, setName] = useState(() => suggestedName(t, 'living-room', brand?.name ?? 'AC'));
  const [nameEdited, setNameEdited] = useState(false);
  const [modelId, setModelId] = useState<string | undefined>(undefined);

  if (!brand) {
    return (
      <Screen edges={[]}>
        <Stack.Screen options={{ title: t.navigation.addRemote, headerShown: true }} />
        <AppText variant="title">{t.addDevice.brandNotFound}</AppText>
        <AppText color="textSecondary">{t.addDevice.brandNotFoundBody}</AppText>
        <Button label={t.common.goBack} variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  const selectedModel = brand.models.find((model) => model.id === modelId);
  const canSave = name.trim().length > 0;

  function chooseRoom(next: RoomType) {
    setRoom(next);
    if (!nameEdited) setName(suggestedName(t, next, brand?.name ?? 'AC'));
  }

  function save() {
    const trimmed = name.trim();
    if (!brand || !trimmed) return;
    const device = useDevicesStore.getState().addDevice({
      name: trimmed,
      room,
      brandId: brand.id,
      modelId: selectedModel?.id,
      connection: {
        kind: 'ir',
        protocol: selectedModel?.ir ?? brand.defaultIr,
        emitter: 'builtin',
      },
    });
    router.replace({ pathname: '/remote/[deviceId]', params: { deviceId: device.id } });
  }

  return (
    <Screen scroll edges={[]} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: t.navigation.addRemote, headerShown: true }} />
      <View style={styles.header}>
        <BrandMark name={brand.name} color={brand.color} size={64} />
        <View style={styles.headerCopy}>
          <AppText variant="title">{brand.name}</AppText>
          <AppText color="textSecondary">{t.addDevice.intro}</AppText>
        </View>
      </View>

      <Section title={t.addDevice.roomQuestion}>
        <View style={styles.options} accessibilityRole="radiogroup">
          {ROOM_TYPES.map((option) => (
            <OptionButton
              key={option}
              label={t.rooms[option]}
              selected={option === room}
              onPress={() => chooseRoom(option)}
            />
          ))}
        </View>
      </Section>

      <Section title={t.addDevice.nameQuestion}>
        <TextField
          label={t.addDevice.nameLabel}
          hint={t.addDevice.nameHint}
          value={name}
          onChangeText={(value) => {
            setNameEdited(true);
            setName(value);
          }}
          placeholder={t.addDevice.namePlaceholder}
          returnKeyType="done"
        />
      </Section>

      {brand.models.length > 0 ? (
        <Section title={t.addDevice.modelQuestion} description={t.addDevice.modelHelp}>
          <View style={styles.options} accessibilityRole="radiogroup">
            <OptionButton label={t.addDevice.modelUnknown} selected={modelId === undefined} onPress={() => setModelId(undefined)} />
            {brand.models.map((model) => (
              <OptionButton
                key={model.id}
                label={model.name}
                selected={modelId === model.id}
                onPress={() => setModelId(model.id)}
              />
            ))}
          </View>
        </Section>
      ) : null}

      <View style={styles.footer}>
        <Button label={t.addDevice.save} icon={SAVE_ICON} large disabled={!canSave} onPress={save} />
        {!canSave ? (
          <AppText color="danger" style={styles.center}>
            {t.addDevice.nameRequired}
          </AppText>
        ) : null}
      </View>
    </Screen>
  );
}

function suggestedName(t: Translations, room: RoomType, brandName: string): string {
  return `${t.rooms[room]} ${brandName}`;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  headerCopy: { flex: 1, gap: Spacing.xs },
  options: { gap: Layout.touchGap },
  footer: { gap: Spacing.sm, marginTop: Spacing.md },
  center: { textAlign: 'center' },
});
