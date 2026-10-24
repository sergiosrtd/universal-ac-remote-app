import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Layout, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { tapFeedback } from '@/utils/haptics';

import { AppText } from './app-text';
import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';

const CHEVRON: IconName = { sf: 'chevron.right', md: 'chevron_right' };

export interface ListCardProps {
  title: string;
  subtitle?: string;
  /** Leading visual, e.g. a `BrandMark`. */
  leading?: ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
}

/** A large tappable row that opens another screen. The chevron says "this goes somewhere". */
export function ListCard({ title, subtitle, leading, onPress, accessibilityLabel }: ListCardProps) {
  const { colors, radii, borders } = useAppTheme();

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={subtitle}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={[
        styles.root,
        { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: borders.regular, borderRadius: radii.lg },
      ]}>
      {leading}
      <View style={styles.copy}>
        <AppText variant="heading">{title}</AppText>
        {subtitle ? <AppText color="textSecondary">{subtitle}</AppText> : null}
      </View>
      <Icon name={CHEVRON} size={28} color={colors.textSecondary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: Layout.minTouchTarget + Spacing.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  copy: { flex: 1, gap: Spacing.xs },
});
