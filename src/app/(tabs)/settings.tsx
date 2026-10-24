import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { OptionButton } from '@/components/ui/option-button';
import { Screen } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { Layout } from '@/constants/theme';
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES, useTranslation } from '@/i18n';
import { usePreferencesStore } from '@/store';
import type { LanguagePreference, TemperatureUnit, ThemePreference } from '@/types';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const language = usePreferencesStore((s) => s.language);
  const theme = usePreferencesStore((s) => s.theme);
  const unit = usePreferencesStore((s) => s.temperatureUnit);
  const haptics = usePreferencesStore((s) => s.hapticsEnabled);
  const setPreference = usePreferencesStore((s) => s.setPreference);

  const languageOptions: readonly { id: LanguagePreference; label: string }[] = [
    ...SUPPORTED_LANGUAGES.map((id) => ({ id, label: LANGUAGE_NAMES[id] })),
    { id: 'system', label: t.settings.languageSystem },
  ];
  const themeOptions: readonly { id: ThemePreference; label: string }[] = [
    { id: 'light', label: t.settings.themeLight },
    { id: 'dark', label: t.settings.themeDark },
    { id: 'system', label: t.settings.themeSystem },
  ];
  const unitOptions: readonly { id: TemperatureUnit; label: string }[] = [
    { id: 'celsius', label: t.settings.celsius },
    { id: 'fahrenheit', label: t.settings.fahrenheit },
  ];

  return (
    <Screen scroll>
      <AppText variant="title" accessibilityRole="header">
        {t.settings.title}
      </AppText>

      {/* First, so someone who can't read the current language finds it without scrolling. */}
      <Section title={t.settings.language}>
        <View style={styles.options} accessibilityRole="radiogroup">
          {languageOptions.map((option) => (
            <OptionButton
              key={option.id}
              label={option.label}
              selected={language === option.id}
              onPress={() => setPreference('language', option.id)}
            />
          ))}
        </View>
      </Section>

      <Section title={t.settings.colors}>
        <View style={styles.options} accessibilityRole="radiogroup">
          {themeOptions.map((option) => (
            <OptionButton
              key={option.id}
              label={option.label}
              selected={theme === option.id}
              onPress={() => setPreference('theme', option.id)}
            />
          ))}
        </View>
      </Section>

      <Section title={t.settings.temperature}>
        <View style={styles.options} accessibilityRole="radiogroup">
          {unitOptions.map((option) => (
            <OptionButton
              key={option.id}
              label={option.label}
              selected={unit === option.id}
              onPress={() => setPreference('temperatureUnit', option.id)}
            />
          ))}
        </View>
      </Section>

      <Section title={t.settings.vibrate} description={t.settings.vibrateHelp}>
        <View style={styles.options} accessibilityRole="radiogroup">
          <OptionButton label={t.common.yes} selected={haptics} onPress={() => setPreference('hapticsEnabled', true)} />
          <OptionButton label={t.common.no} selected={!haptics} onPress={() => setPreference('hapticsEnabled', false)} />
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  options: { gap: Layout.touchGap },
});
