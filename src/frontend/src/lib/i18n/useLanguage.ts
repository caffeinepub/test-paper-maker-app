import { useCallback, useEffect, useState } from "react";
import {
  type Language,
  type TranslationKey,
  allTranslations,
} from "./translations";

const STORAGE_KEY = "appLanguage";
const DEFAULT_LANGUAGE: Language = "en";

function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in allTranslations) {
      return stored as Language;
    }
  } catch {
    // ignore
  }
  return DEFAULT_LANGUAGE;
}

// Module-level listeners so all hooks stay in sync
const listeners = new Set<() => void>();
let currentLanguage: Language = getStoredLanguage();

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(currentLanguage);

  useEffect(() => {
    const listener = () => setLanguageState(currentLanguage);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    currentLanguage = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    for (const l of listeners) {
      l();
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const translations = allTranslations[language];
      return translations[key] ?? allTranslations.en[key] ?? key;
    },
    [language],
  );

  return { language, setLanguage, t };
}
