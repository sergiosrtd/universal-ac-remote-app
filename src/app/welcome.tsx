import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Layout, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getTranslations, LANGUAGE_NAMES, SUPPORTED_LANGUAGES, usePhoneLanguage } from '@/i18n';
import { usePreferencesStore } from '@/store';
import type { Language } from '@/types';

const GLOBE: IconName = { sf: 'globe', md: 'language' };

/**
 * First-run screen. The question is written in every language, the phone's
 * language first, because we don't yet know which one the person reads.
 * Choosing one saves it; the root layout's guard then opens the app.
 */
export default function WelcomeScreen() {
  const { colors } = useAppTheme();
  const phoneLanguage = usePhoneLanguage();
  const languages = [phoneLanguage, ...SUPPORTED_LANGUAGES.filter((id) => id !== phoneLanguage)];

  function choose(language: Language) {
    const { setPreference } = usePreferencesStore.getState();
    setPreference('language', language);
    setPreference('languageChosen', true);
  }

  return (
    <Screen edges={['top', 'bottom']} contentStyle={styles.content}>
      <View style={styles.header}>
        <Icon name={GLOBE} size={64} color={colors.primary} />
        {languages.map((id) => (
          <AppText
            key={id}
            variant={id === phoneLanguage ? 'title' : 'heading'}
            color={id === phoneLanguage ? 'text' : 'textSecondary'}
            accessibilityRole={id === phoneLanguage ? 'header' : undefined}
            style={styles.center}>
            {getTranslations(id).languagePicker.title}
          </AppText>
        ))}
      </View>

      <View style={styles.choices}>
        {languages.map((id) => (
          <Button
            key={id}
            label={LANGUAGE_NAMES[id]}
            variant={id === phoneLanguage ? 'primary' : 'secondary'}
            large
            onPress={() => choose(id)}
          />
        ))}
      </View>

      <AppText color="textSecondary" style={styles.center}>
        {getTranslations(phoneLanguage).languagePicker.changeLater}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', gap: Spacing.xxl },
  header: { alignItems: 'center', gap: Spacing.sm },
  center: { textAlign: 'center' },
  choices: { gap: Layout.touchGap },
});
