import deLocale from '@/locales/de.json';
import enLocale from '@/locales/en.json';
import esLocale from '@/locales/es.json';
import frLocale from '@/locales/fr.json';
import itLocale from '@/locales/it.json';
import { i18n, t } from '@/lib/i18n';

type AnyObj = Record<string, unknown>;

function flatten(obj: AnyObj, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object') {
      Object.assign(out, flatten(value as AnyObj, fullKey));
    } else {
      out[fullKey] = String(value);
    }
  }
  return out;
}

const ENGLISH_KEYS = Object.keys(flatten(enLocale));

describe('locales', () => {
  it.each([
    ['de', deLocale],
    ['es', esLocale],
    ['fr', frLocale],
    ['it', itLocale],
  ])('%s has every key from English', (_name, locale) => {
    const localeKeys = Object.keys(flatten(locale as AnyObj));
    const missing = ENGLISH_KEYS.filter((k) => !localeKeys.includes(k));
    expect(missing).toEqual([]);
  });

  it.each([
    ['en', enLocale],
    ['de', deLocale],
    ['es', esLocale],
    ['fr', frLocale],
    ['it', itLocale],
  ])('%s has no empty leaf strings', (_name, locale) => {
    const flat = flatten(locale as AnyObj);
    const empties = Object.entries(flat).filter(([, v]) => v.trim() === '');
    expect(empties).toEqual([]);
  });
});

describe('i18n.t', () => {
  beforeEach(() => {
    i18n.locale = 'en';
  });

  it('interpolates {{age}} in turningSuffix across all locales', () => {
    for (const locale of ['en', 'de', 'es', 'fr', 'it'] as const) {
      i18n.locale = locale;
      expect(t('card.turningSuffix', { age: 8 })).toContain('8');
    }
  });

  it('interpolates {{count}} in date.inDays across all locales', () => {
    for (const locale of ['en', 'de', 'es', 'fr', 'it'] as const) {
      i18n.locale = locale;
      expect(t('date.inDays', { count: 3 })).toContain('3');
    }
  });

  it('returns English values when set to English', () => {
    i18n.locale = 'en';
    expect(t('nav.upcoming')).toBe('Upcoming');
    expect(t('date.today')).toBe('Today!');
  });

  it('returns German when set to de', () => {
    i18n.locale = 'de';
    expect(t('nav.upcoming')).toBe('Demnächst');
  });

  it('falls back to English for unsupported locales', () => {
    i18n.locale = 'pl';
    expect(t('nav.upcoming')).toBe('Upcoming');
  });
});
