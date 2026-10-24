import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';

import { AppText } from './app-text';

export interface SectionProps {
  title: string;
  /** One short sentence explaining what the choices below do. */
  description?: string;
  children: ReactNode;
}

/** A titled group of controls. Titles are plain sentence case, never small caps. */
export function Section({ title, description, children }: SectionProps) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <AppText variant="heading" accessibilityRole="header">
          {title}
        </AppText>
        {description ? <AppText color="textSecondary">{description}</AppText> : null}
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.md },
  header: { gap: Spacing.xs },
  body: { gap: Spacing.md },
});
