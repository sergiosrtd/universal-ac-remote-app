import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Layout, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { tapFeedback } from '@/utils/haptics';

import { AppText } from './app-text';
import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export interface ButtonProps {
  /** Always required: buttons are never icon-only. */
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  /** Primary-height button for the main action on a screen. */
  large?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

/** Full-width, labelled button. Use one `primary` per screen. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  large = false,
  accessibilityHint,
  style,
}: ButtonProps) {
  const { colors, radii, borders } = useAppTheme();
  const palette = {
    primary: { background: colors.primary, border: colors.primary, text: colors.onPrimary },
    secondary: { background: colors.surface, border: colors.border, text: colors.text },
    danger: { background: colors.danger, border: colors.danger, text: colors.onDanger },
  }[variant];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={[
        styles.root,
        {
          minHeight: large ? Layout.primaryButtonHeight : Layout.minTouchTarget,
          backgroundColor: palette.background,
          borderColor: palette.border,
          borderWidth: borders.regular,
          borderRadius: radii.lg,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}>
      <View style={styles.content}>
        {icon ? <Icon name={icon} size={28} color={palette.text} /> : null}
        <AppText variant="label" style={[styles.label, { color: palette.text }]}>
          {label}
        </AppText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  content: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: { textAlign: 'center' },
});
