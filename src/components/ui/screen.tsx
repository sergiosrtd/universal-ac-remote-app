import type { ReactNode, Ref } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewInstance,
  type ScrollViewProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Layout, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  contentStyle?: ViewStyle;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  /** Lets a screen scroll programmatically, e.g. to reveal a confirmation. Only used with `scroll`. */
  scrollRef?: Ref<ScrollViewInstance>;
}

/** Themed, safe-area aware, width-capped container used by every screen. */
export function Screen({
  children,
  scroll = false,
  edges = ['top'],
  contentStyle,
  keyboardShouldPersistTaps,
  scrollRef,
}: ScreenProps) {
  const { colors } = useAppTheme();
  // On web the native tab bar floats over the top of tab screens instead of sitting at the bottom.
  const clearsWebTabBar = Platform.OS === 'web' && edges.includes('top');
  const content = (
    <View
      style={[
        styles.content,
        scroll ? styles.scrollContent : styles.fill,
        clearsWebTabBar && styles.webTabBarInset,
        contentStyle,
      ]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: colors.background }]}>
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  content: {
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.xl,
  },
  fill: { flex: 1 },
  webTabBarInset: { paddingTop: 80 },
  scrollContent: { flexGrow: 1, paddingBottom: Spacing.xxl },
});
