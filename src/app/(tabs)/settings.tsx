import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { OptionButton } from '@/components/ui/option-button';
import { Screen } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { Layout } from '@/constants/theme';
import { usePreferencesStore } from '@/store';
import type { TemperatureUnit, ThemePreference } from '@/types';

const THEME_OPTIONS: readonly { id: ThemePreference; label: string }[] = [
  { id: 'light', label: 'Light (white background)' },
  { id: 'dark', label: 'Dark (black background)' },
  { id: 'system', label: 'Same as my phone' },
];

const UNIT_OPTIONS: readonly { id: TemperatureUnit; label: string }[] = [
  { id: 'celsius', label: 'Celsius (°C)' },
  { id: 'fahrenheit', label: 'Fahrenheit (°F)' },
];

export default function SettingsScreen() {
  const theme = usePreferencesStore((s) => s.theme);
  const unit = usePreferencesStore((s) => s.temperatureUnit);
  const haptics = usePreferencesStore((s) => s.hapticsEnabled);
  const setPreference = usePreferencesStore((s) => s.setPreference);

  return (
    <Screen scroll>
      <AppText variant="title" accessibilityRole="header">
        Settings
      </AppText>

      <Section title="Screen colors">
        <View style={styles.options} accessibilityRole="radiogroup">
          {THEME_OPTIONS.map((option) => (
            <OptionButton
              key={option.id}
              label={option.label}
              selected={theme === option.id}
              onPress={() => setPreference('theme', option.id)}
            />
          ))}
        </View>
      </Section>

      <Section title="Temperature">
        <View style={styles.options} accessibilityRole="radiogroup">
          {UNIT_OPTIONS.map((option) => (
            <OptionButton
              key={option.id}
              label={option.label}
              selected={unit === option.id}
              onPress={() => setPreference('temperatureUnit', option.id)}
            />
          ))}
        </View>
      </Section>

      <Section title="Vibrate when I tap" description="A small buzz confirms that a button was pressed.">
        <View style={styles.options} accessibilityRole="radiogroup">
          <OptionButton label="Yes" selected={haptics} onPress={() => setPreference('hapticsEnabled', true)} />
          <OptionButton label="No" selected={!haptics} onPress={() => setPreference('hapticsEnabled', false)} />
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  options: { gap: Layout.touchGap },
});
