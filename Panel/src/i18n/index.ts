import { useState, useCallback } from "react";
import { EN, type I18nKey } from "./keys";
import { DICTS } from "./dictionary";

export type { I18nKey };

export type TParams = Record<string, string | number>;

/** Translate a key for a locale, falling back to English, then the key itself. */
export function translate(lang: string | null, key: I18nKey, params?: TParams): string {
  const dict = lang ? DICTS[lang] : undefined;
  let s: string = (dict && dict[key]) ?? EN[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replace(`{${k}}`, String(v));
    }
  }
  return s;
}

const LANGUAGE_KEY = "cs2skinmod.language";

/** Get the saved language preference */
export function getSavedLanguage(): string {
  try {
    return localStorage.getItem(LANGUAGE_KEY) ?? "english";
  } catch {
    return "english";
  }
}

/** Save language preference */
export function saveLanguage(lang: string): void {
  try {
    localStorage.setItem(LANGUAGE_KEY, lang);
  } catch {
    /* localStorage unavailable */
  }
}

/** Available languages */
export const LANGUAGES = [
  { code: "english", label: "English", flag: "EN" },
  { code: "schinese", label: "简体中文", flag: "CN" },
  { code: "tchinese", label: "繁體中文", flag: "TW" },
  { code: "japanese", label: "日本語", flag: "JP" },
  { code: "koreana", label: "한국어", flag: "KR" },
] as const;

/** Hook returning a translator bound to the current language. */
export function useT() {
  const [lang, setLang] = useState<string>(getSavedLanguage);

  const changeLanguage = useCallback((newLang: string) => {
    setLang(newLang);
    saveLanguage(newLang);
  }, []);

  const t = useCallback(
    (key: I18nKey, params?: TParams) => translate(lang, key, params),
    [lang]
  );

  return { t, lang, changeLanguage, languages: LANGUAGES };
}
