import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { ListCard } from '@/components/ui/list-card';
import { TextField } from '@/components/ui/text-field';
import { Layout, Spacing } from '@/constants/theme';
import { groupBrands } from '@/features/brands/lib/group-brands';
import { useTranslation } from '@/i18n';

import { BrandMark } from './brand-mark';

export function BrandPicker() {
  const [query, setQuery] = useState('');
  const groups = useMemo(() => groupBrands(query), [query]);
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.root}>
      <TextField
        label={t.brands.searchLabel}
        value={query}
        onChangeText={setQuery}
        placeholder={t.brands.searchPlaceholder}
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
          <AppText color="textSecondary">{t.brands.noMatch(query.trim())}</AppText>
        ) : (
          groups.map((group) => (
            <View key={group.id} style={styles.group}>
              <AppText variant="heading" accessibilityRole="header">
                {t.brands.groups[group.id]}
              </AppText>
              {group.brands.map((brand) => (
                <ListCard
                  key={brand.id}
                  title={brand.name}
                  subtitle={brand.supportedConnections.map((kind) => t.brands.connections[kind]).join(' · ')}
                  accessibilityLabel={t.brands.choose(brand.name)}
                  leading={<BrandMark brandId={brand.id} name={brand.name} color={brand.color} />}
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
