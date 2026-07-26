import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import nb from './locales/nb';
import * as packs from './locales/packs';
import { resolveI18nLocale } from '@/lib/languages';

const STORAGE_KEY = 'kalunez_locale';

const resources = {
  en: { translation: en },
  nb: { translation: nb },
  nn: { translation: nb },
  no: { translation: nb },
  da: { translation: packs.da },
  sv: { translation: packs.sv },
  fi: { translation: packs.fi },
  de: { translation: packs.de },
  fr: { translation: packs.fr },
  es: { translation: packs.es },
  pt: { translation: packs.pt },
  'pt-BR': { translation: packs.pt },
  it: { translation: packs.it },
  nl: { translation: packs.nl },
  pl: { translation: packs.pl },
  ru: { translation: packs.ru },
  uk: { translation: packs.uk },
  tr: { translation: packs.tr },
  ar: { translation: packs.ar },
  hi: { translation: packs.hi },
  zh: { translation: packs.zh },
  'zh-Hans': { translation: packs.zh },
  ja: { translation: packs.ja },
  ko: { translation: packs.ko },
  id: { translation: packs.id },
  th: { translation: packs.th },
  vi: { translation: packs.vi },
};

function detectLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
  } catch {
    /* ignore */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language || 'en' : 'en';
  return nav;
}

const preferred = detectLocale();
const active = resolveI18nLocale(preferred);

i18n.use(initReactI18next).init({
  resources,
  lng: active,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

/** Persist picker choice (may be a locale without a full pack). */
export function setAppLanguage(code) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* ignore */
  }
  const lng = resolveI18nLocale(code);
  document.documentElement.lang = code;
  document.documentElement.dir = ['ar', 'he', 'fa', 'ur'].some((c) => code === c || code.startsWith(`${c}-`))
    ? 'rtl'
    : 'ltr';
  return i18n.changeLanguage(lng);
}

export function getStoredLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY) || detectLocale();
  } catch {
    return 'en';
  }
}

// Apply dir/lang on boot
setAppLanguage(preferred);

export default i18n;
