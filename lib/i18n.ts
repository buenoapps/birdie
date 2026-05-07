import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

import de from '@/locales/de.json';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';
import it from '@/locales/it.json';

export const SUPPORTED_LOCALES = ['en', 'de', 'es', 'fr', 'it'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const i18n = new I18n({ en, de, es, fr, it });
i18n.defaultLocale = 'en';
i18n.enableFallback = true;
i18n.locale = detectInitialLocale();

function detectInitialLocale(): string {
  try {
    const code = Localization.getLocales()[0]?.languageCode;
    if (code && (SUPPORTED_LOCALES as readonly string[]).includes(code)) {
      return code;
    }
  } catch {
    /* fall through */
  }
  return 'en';
}

export function t(key: string, params?: Record<string, unknown>): string {
  return i18n.t(key, params);
}
