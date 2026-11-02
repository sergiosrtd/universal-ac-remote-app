import { useLocales } from 'expo-localization';

import { usePreferencesStore } from '@/store/preferences-store';
import type { Language } from '@/types';

import { en, type Translations } from './en';
import { es } from './es';

export type { Translations };

const TRANSLATIONS: Record<Language, Translations> = { en, es };

/** Names shown in the language picker, each written in its own language so anyone can find theirs. */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  es: 'Español',
};

export const SUPPORTED_LANGUAGES = Object.keys(TRANSLATIONS) as Language[];

const isLanguage = (code: string | null | undefined): code is Language =>
  !!code && (SUPPORTED_LANGUAGES as string[]).includes(code);

export const getTranslations = (language: Language): Translations => TRANSLATIONS[language];

/** The first supported language in the phone's settings, else English. */
export function usePhoneLanguage(): Language {
  const locales = useLocales();
  return locales.map((locale) => locale.languageCode).find(isLanguage) ?? 'en';
}

/** The language in use: the saved choice, else the phone's language. */
export function useLanguage(): Language {
  const preference = usePreferencesStore((s) => s.language);
  const phoneLanguage = usePhoneLanguage();
  return preference === 'system' ? phoneLanguage : preference;
}

export function useTranslation(): { t: Translations; language: Language } {
  const language = useLanguage();
  return { t: TRANSLATIONS[language], language };
}
