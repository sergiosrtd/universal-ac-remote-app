import { NativeTabs } from 'expo-router/native-tabs';

import { useAppTheme } from '@/hooks/use-app-theme';
import { useTranslation } from '@/i18n';

// Tab bars have little room; 15pt bold is the largest size that fits three labels on small phones.
const LABEL_SIZE = 15;

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  return (
    <NativeTabs
      backgroundColor={colors.surface}
      indicatorColor={colors.surfacePressed}
      labelVisibilityMode="labeled"
      iconColor={{ default: colors.textSecondary, selected: colors.primary }}
      labelStyle={{
        default: { fontSize: LABEL_SIZE, fontWeight: '600', color: colors.textSecondary },
        selected: { fontSize: LABEL_SIZE, fontWeight: '700', color: colors.primary },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t.tabs.remotes}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }} md="grid_view" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="brands">
        <NativeTabs.Trigger.Label>{t.tabs.add}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'plus.circle', selected: 'plus.circle.fill' }} md="add_circle" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>{t.tabs.settings}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
