import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

export interface BrandMarkProps {
  name: string;
  color?: string;
  size?: number;
}

/** Brand initial on the brand color. Decorative: the brand name is always written next to it. */
export function BrandMark({ name, color, size = 56 }: BrandMarkProps) {
  const { colors, radii } = useAppTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.root, { width: size, height: size, backgroundColor: color ?? colors.primary, borderRadius: radii.md }]}>
      <AppText variant="heading" style={styles.text}>
        {name.slice(0, 1)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  // Brand colors are saturated mid-tones; white is the readable choice on all of them.
  text: { color: '#FFFFFF' },
});
