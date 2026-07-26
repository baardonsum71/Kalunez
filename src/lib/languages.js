/**
 * World languages for the Settings picker (ISO 639-1 + common region tags).
 * Native labels via Intl.DisplayNames when available.
 */

const BASE_CODES = [
  'af', 'am', 'ar', 'as', 'az', 'be', 'bg', 'bn', 'bo', 'bs', 'ca', 'ceb', 'co', 'cs', 'cy', 'da',
  'de', 'dv', 'el', 'en', 'eo', 'es', 'et', 'eu', 'fa', 'fi', 'fil', 'fo', 'fr', 'fy', 'ga', 'gd',
  'gl', 'gu', 'ha', 'haw', 'he', 'hi', 'hmn', 'hr', 'ht', 'hu', 'hy', 'id', 'ig', 'is', 'it', 'ja',
  'jv', 'ka', 'kk', 'km', 'kn', 'ko', 'ku', 'ky', 'la', 'lb', 'lo', 'lt', 'lv', 'mg', 'mi', 'mk',
  'ml', 'mn', 'mr', 'ms', 'mt', 'my', 'nb', 'ne', 'nl', 'nn', 'no', 'ny', 'or', 'pa', 'pl', 'ps',
  'pt', 'pt-BR', 'ro', 'ru', 'rw', 'sd', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'st', 'su',
  'sv', 'sw', 'ta', 'te', 'tg', 'th', 'tk', 'tl', 'tr', 'tt', 'ug', 'uk', 'ur', 'uz', 'vi', 'xh',
  'yi', 'yo', 'zh', 'zh-Hans', 'zh-Hant', 'zu',
];

/** Locales with a full Kalunez UI translation pack. */
export const TRANSLATED_LOCALES = new Set([
  'en', 'nb', 'no', 'nn', 'da', 'sv', 'fi', 'de', 'fr', 'es', 'pt', 'pt-BR', 'it', 'nl', 'pl',
  'ru', 'uk', 'tr', 'ar', 'hi', 'zh', 'zh-Hans', 'ja', 'ko', 'id', 'th', 'vi',
]);

function displayName(code, of = 'en') {
  try {
    const dn = new Intl.DisplayNames([of], { type: 'language' });
    return dn.of(code) || code;
  } catch {
    return code;
  }
}

function nativeName(code) {
  try {
    const dn = new Intl.DisplayNames([code], { type: 'language' });
    return dn.of(code) || displayName(code);
  } catch {
    return displayName(code);
  }
}

let cached = null;

export function getWorldLanguages() {
  if (cached) return cached;
  cached = BASE_CODES.map((code) => ({
    code,
    name: displayName(code, 'en'),
    nativeName: nativeName(code),
    translated: TRANSLATED_LOCALES.has(code) || TRANSLATED_LOCALES.has(code.split('-')[0]),
  })).sort((a, b) => a.name.localeCompare(b.name, 'en'));
  return cached;
}

export function resolveI18nLocale(code) {
  if (!code) return 'en';
  if (TRANSLATED_LOCALES.has(code)) return code === 'no' ? 'nb' : code;
  const base = code.split('-')[0];
  if (TRANSLATED_LOCALES.has(base)) return base === 'no' ? 'nb' : base;
  if (code === 'zh-Hant') return 'zh';
  return 'en';
}
