import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Spacing } from '@/constants/theme';
import { getBrandLogo } from '@/features/brands/lib/brand-logos';
import { useAppTheme } from '@/hooks/use-app-theme';

/** Logos are wide wordmarks, so the mark is wider than it is tall. */
const ASPECT = 1.6;

export interface BrandMarkProps {
  /** Used to find the brand's logo. Without a logo the initial is shown. */
  brandId?: string;
  name: string;
  color?: string;
  /** Height in points; the width follows `ASPECT` so every row lines up. */
  size?: number;
}

/** Brand logo on a light tile, or the brand initial on the brand color. Decorative: the name is always written next to it. */
export function BrandMark({ brandId, name, color, size = 56 }: BrandMarkProps) {
  const { colors, radii, borders } = useAppTheme();
  const logo = brandId ? getBrandLogo(brandId) : undefined;
  const box = { width: Math.round(size * ASPECT), height: size, borderRadius: radii.md };

  if (logo) {
    return (
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.root,
          box,
          { backgroundColor: colors.logoPlate, borderColor: colors.border, borderWidth: borders.regular },
        ]}>
        <Image source={logo} contentFit="contain" style={styles.logo} />
      </View>
    );
  }

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.root, box, { backgroundColor: color ?? colors.primary }]}>
      <AppText variant="heading" style={styles.initial}>
        {name.slice(0, 1)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', padding: Spacing.sm },
  logo: { width: '100%', height: '100%' },
  // Brand colors are saturated mid-tones; white is the readable choice on all of them.
  initial: { color: '#FFFFFF' },
});
