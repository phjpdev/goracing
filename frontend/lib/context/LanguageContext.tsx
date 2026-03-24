"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { zhTW, en } from "@/lib/i18n";
import type { Locale, TranslationKeys } from "@/lib/i18n";

const dictionaries: Record<Locale, TranslationKeys> = { "zh-TW": zhTW, en };

type LanguageContextValue = {
  locale: Locale;
  t: TranslationKeys;
  toggleLocale: () => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  locale: "zh-TW",
  t: zhTW,
  toggleLocale: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("zh-TW");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && dictionaries[saved]) setLocale(saved);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next = prev === "zh-TW" ? "en" : "zh-TW";
      localStorage.setItem("locale", next);
      return next;
    });
  }, []);

  const t = dictionaries[locale];

  return (
    <LanguageContext.Provider value={{ locale, t, toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
