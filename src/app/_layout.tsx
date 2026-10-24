import '@/global.css';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Spacing, Typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useStoresHydrated } from '@/store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrated = useStoresHydrated();
  const { scheme, colors } = useAppTheme();

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync();
  }, [hydrated]);

  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
      },
    };
  }, [scheme, colors]);

  // Keep the splash visible until persisted devices/preferences are loaded, so the
  // first frame already reflects the user's theme and saved remotes.
  if (!hydrated) return null;

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontSize: Typography.heading.fontSize, fontWeight: '700' },
          // A written "Back" is clearer than a lone chevron or the previous screen's name.
          headerBackTitle: 'Back',
          headerBackButtonDisplayMode: 'generic',
          headerBackTitleStyle: { fontSize: Typography.label.fontSize },
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-device/[brandId]" options={{ headerShown: true, title: 'Add remote' }} />
        <Stack.Screen name="remote/[deviceId]" options={{ headerShown: true, title: 'Remote' }} />
      </Stack>
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.errorRoot, { backgroundColor: colors.background }]}>
      <AppText variant="title" style={styles.center}>
        Something went wrong
      </AppText>
      <AppText color="textSecondary" style={styles.center}>
        {error.message}
      </AppText>
      <Button label="Try again" onPress={retry} large style={styles.retry} />
    </View>
  );
}

const styles = StyleSheet.create({
  errorRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.lg },
  center: { textAlign: 'center' },
  retry: { alignSelf: 'stretch' },
});
