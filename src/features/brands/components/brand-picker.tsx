import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { ListCard } from '@/components/ui/list-card';
import { TextField } from '@/components/ui/text-field';
import { Layout, Spacing } from '@/constants/theme';
import { groupBrands } from '@/features/brands/lib/group-brands';
import type { ConnectionKind } from '@/types';

import { BrandMark } from './brand-mark';

const CONNECTION_LABEL: Record<ConnectionKind, string> = {
  ir: 'Infrared',
  wifi: 'Wi-Fi',
  bluetooth: 'Bluetooth',
};

export function BrandPicker() {
  const [query, setQuery] = useState('');
  const groups = useMemo(() => groupBrands(query), [query]);
  const router = useRouter();

  return (
    <View style={styles.root}>
      <TextField
        label="Search brands"
        value={query}
        onChangeText={setQuery}
        placeholder="For example: Samsung"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="always"
        returnKeyType="search"
      />

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        {groups.length === 0 ? (
          <AppText color="textSecondary">
            No brand called “{query.trim()}”. Check the spelling, or look for it under More brands.
          </AppText>
        ) : (
          groups.map((group) => (
            <View key={group.title} style={styles.group}>
              <AppText variant="heading" accessibilityRole="header">
                {group.title}
              </AppText>
              {group.brands.map((brand) => (
                <ListCard
                  key={brand.id}
                  title={brand.name}
                  subtitle={brand.supportedConnections.map((kind) => CONNECTION_LABEL[kind]).join(' · ')}
                  accessibilityLabel={`Choose ${brand.name}`}
                  leading={<BrandMark name={brand.name} color={brand.color} />}
                  onPress={() => router.push({ pathname: '/add-device/[brandId]', params: { brandId: brand.id } })}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: Spacing.lg },
  list: { flex: 1 },
  listContent: { gap: Spacing.xl, paddingBottom: Spacing.xxl },
  group: { gap: Layout.touchGap },
});
