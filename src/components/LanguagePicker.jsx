import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Languages } from 'lucide-react';
import { getWorldLanguages, TRANSLATED_LOCALES } from '@/lib/languages';
import { getStoredLanguage, setAppLanguage } from '@/i18n';

export default function LanguagePicker() {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(() => getStoredLanguage());
  const languages = useMemo(() => getWorldLanguages(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return languages;
    return languages.filter(
      (l) =>
        l.code.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q)
    );
  }, [languages, query]);

  const handleSelect = async (code) => {
    setSelected(code);
    await setAppLanguage(code);
  };

  const hasPack =
    TRANSLATED_LOCALES.has(selected) || TRANSLATED_LOCALES.has(selected.split('-')[0]);

  return (
    <div className="space-y-3 py-2 border-b border-border">
      <div className="flex items-center gap-2 text-white text-sm font-medium">
        <Languages className="w-4 h-4 text-cyan-400" />
        {t('settings.language')}
      </div>
      <p className="text-muted-foreground text-xs leading-relaxed">{t('settings.languageHint')}</p>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('settings.languageSearch')}
        className="w-full bg-black/40 border border-white/15 text-white text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500"
      />
      <div className="max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-black/30 divide-y divide-white/5">
        {filtered.map((lang) => {
          const active = selected === lang.code || i18n.language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                active ? 'bg-purple-500/20 text-white' : 'text-white/90 hover:bg-white/5'
              }`}
            >
              <span className="min-w-0">
                <span className="font-medium block truncate">{lang.nativeName}</span>
                <span className="text-xs text-white/50 block truncate">
                  {lang.name} · {lang.code}
                  {lang.translated ? ` · ${t('settings.languageTranslated')}` : ''}
                </span>
              </span>
              {active && <Check className="w-4 h-4 text-purple-300 shrink-0" />}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-white/50 text-sm px-3 py-4 text-center">No matches</p>
        )}
      </div>
      {!hasPack && (
        <p className="text-amber-300/90 text-xs">{t('settings.languageFallback')}</p>
      )}
    </div>
  );
}
