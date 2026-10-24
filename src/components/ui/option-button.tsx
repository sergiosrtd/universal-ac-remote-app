import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Layout, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { withAlpha } from '@/utils/color';
import { tapFeedback } from '@/utils/haptics';

import { AppText } from './app-text';
import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';

const CHECK: IconName = { sf: 'checkmark.circle.fill', md: 'check_circle' };
const EMPTY: IconName = { sf: 'circle', md: 'radio_button_unchecked' };

export interface OptionButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * One choice in a list of choices. Selection is shown three ways at once — a
 * check mark, a thick outline and a tinted fill — so it never depends on color.
 */
export function OptionButton({ label, selected, onPress, style }: OptionButtonProps) {
  const { colors, radii, borders } = useAppTheme();

  return (
    <PressableScale
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={[
        styles.root,
        {
          borderRadius: radii.lg,
          borderWidth: selected ? borders.selected : borders.regular,
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? withAlpha(colors.primary, 0.12) : colors.surface,
          // Keep the label in place when the outline grows.
          paddingHorizontal: Spacing.lg - (selected ? borders.selected - borders.regular : 0),
        },
        style,
      ]}>
      <View style={styles.content}>
        <Icon name={selected ? CHECK : EMPTY} size={28} color={selected ? colors.primary : colors.textMuted} />
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { minHeight: Layout.minTouchTarget, justifyContent: 'center', paddingVertical: Spacing.sm },
  content: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  label: { flex: 1 },
});
