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
import { ROOM_OPTIONS, roomLabel } from '@/constants/rooms';
import { Layout, Spacing } from '@/constants/theme';
import { BrandMark } from '@/features/brands/components/brand-mark';
import { useDevicesStore } from '@/store';
import type { RoomType } from '@/types';

const SAVE_ICON: IconName = { sf: 'checkmark', md: 'check' };

export default function AddDeviceScreen() {
  const { brandId } = useLocalSearchParams<{ brandId: string }>();
  const brand = getBrandById(brandId ?? '');
  const router = useRouter();

  const [room, setRoom] = useState<RoomType>('living-room');
  const [name, setName] = useState(() => suggestedName('living-room', brand?.name ?? 'AC'));
  const [nameEdited, setNameEdited] = useState(false);
  const [modelId, setModelId] = useState<string | undefined>(undefined);

  if (!brand) {
    return (
      <Screen edges={[]}>
        <Stack.Screen options={{ title: 'Add remote', headerShown: true }} />
        <AppText variant="title">Brand not found</AppText>
        <AppText color="textSecondary">Go back and choose a brand from the list.</AppText>
        <Button label="Go back" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  const selectedModel = brand.models.find((model) => model.id === modelId);
  const canSave = name.trim().length > 0;

  function chooseRoom(next: RoomType) {
    setRoom(next);
    if (!nameEdited) setName(suggestedName(next, brand?.name ?? 'AC'));
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
      <Stack.Screen options={{ title: 'Add remote', headerShown: true }} />
      <View style={styles.header}>
        <BrandMark name={brand.name} color={brand.color} size={64} />
        <View style={styles.headerCopy}>
          <AppText variant="title">{brand.name}</AppText>
          <AppText color="textSecondary">Answer the questions below, then tap Save.</AppText>
        </View>
      </View>

      <Section title="1. Which room is it in?">
        <View style={styles.grid} accessibilityRole="radiogroup">
          {ROOM_OPTIONS.map((option) => (
            <OptionButton
              key={option.id}
              label={option.label}
              selected={option.id === room}
              onPress={() => chooseRoom(option.id)}
              style={styles.gridItem}
            />
          ))}
        </View>
      </Section>

      <Section title="2. What should we call it?">
        <TextField
          label="Name"
          hint="This is how it will appear in your list."
          value={name}
          onChangeText={(value) => {
            setNameEdited(true);
            setName(value);
          }}
          placeholder="Living room AC"
          returnKeyType="done"
        />
      </Section>

      {brand.models.length > 0 ? (
        <Section title="3. Which model?" description="Not sure? Leave it on “I don't know”. It works for most units.">
          <View style={styles.options} accessibilityRole="radiogroup">
            <OptionButton label="I don't know" selected={modelId === undefined} onPress={() => setModelId(undefined)} />
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
        <Button label="Save remote" icon={SAVE_ICON} large disabled={!canSave} onPress={save} />
        {!canSave ? (
          <AppText color="danger" style={styles.center}>
            Please type a name first.
          </AppText>
        ) : null}
      </View>
    </Screen>
  );
}

function suggestedName(room: RoomType, brandName: string): string {
  return `${roomLabel(room)} ${brandName}`;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  headerCopy: { flex: 1, gap: Spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Layout.touchGap },
  // Two per row: wide enough for "Living room" at large text sizes.
  gridItem: { flexBasis: '45%', flexGrow: 1 },
  options: { gap: Layout.touchGap },
  footer: { gap: Spacing.sm, marginTop: Spacing.md },
  center: { textAlign: 'center' },
});
