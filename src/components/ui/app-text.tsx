import { Text, type TextProps } from 'react-native';

import { Layout, type ThemeColors, type TypographyVariant } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type TextColor = Exclude<keyof ThemeColors, 'mode'>;

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: TextColor;
}

/** Themed text. Follows the system text-size setting up to `Layout.maxFontScale`. */
export function AppText({
  variant = 'body',
  color = 'text',
  maxFontSizeMultiplier = Layout.maxFontScale,
  style,
  ...rest
}: AppTextProps) {
  const { typography, colors } = useAppTheme();
  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[typography[variant], { color: colors[color] }, style]}
      {...rest}
    />
  );
}
