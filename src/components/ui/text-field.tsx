import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Layout, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

import { AppText } from './app-text';

export interface TextFieldProps extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  /** Shown above the field and never replaced by the placeholder. */
  label: string;
  hint?: string;
}

/** Large text input with a permanent label and a thick outline while typing. */
export function TextField({ label, hint, onFocus, onBlur, ...rest }: TextFieldProps) {
  const { colors, radii, borders, typography } = useAppTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.root}>
      <AppText variant="label">{label}</AppText>
      {hint ? <AppText color="textSecondary">{hint}</AppText> : null}
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={hint}
        placeholderTextColor={colors.textMuted}
        maxFontSizeMultiplier={Layout.maxFontScale}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          typography.body,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: focused ? colors.primary : colors.border,
            borderWidth: focused ? borders.selected : borders.regular,
            borderRadius: radii.lg,
            paddingHorizontal: Spacing.lg - (focused ? borders.selected - borders.regular : 0),
          },
        ]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.sm },
  input: { minHeight: Layout.minTouchTarget, paddingVertical: Spacing.md },
});
