import { useCallback } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { en } from "./locales/en";
import { bn } from "./locales/bn";
import type { SupportedLanguage, TranslationKey } from "./types";

const STORAGE_KEY = "homenet_lang";

function flattenDictionary(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const flattened: Record<string, string> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof val === "object" && val !== null) {
      Object.assign(flattened, flattenDictionary(val as Record<string, unknown>, fullKey));
    } else if (typeof val === "string") {
      flattened[fullKey] = val;
    }
  }
  return flattened;
}

const flatEn = flattenDictionary(en);
const flatBn = flattenDictionary(bn);

const dictionaries: Record<SupportedLanguage, Record<string, string>> = {
  en: flatEn,
  bn: flatBn,
};

export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{{1,2}(\w+)\}{1,2}/g, (_, key) => {
    return key in params ? String(params[key]) : `{${key}}`;
  });
}

export function translate(
  lang: SupportedLanguage,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const dict = dictionaries[lang] || dictionaries.en;
  const raw = dict[key] ?? dictionaries.en[key] ?? key;
  return interpolate(raw, params);
}

/** A saved value is trusted only if it names a language we have. */
function asLanguage(saved: string | null): SupportedLanguage | null {
  return saved === "bn" || saved === "en" ? saved : null;
}

/**
 * The language saved in the browser. Synchronous, so the first paint is already
 * in the right language. On a phone there is no localStorage: this is "en" there,
 * and restoreSavedLanguage() reads the real value from AsyncStorage.
 */
export function getInitialLanguage(): SupportedLanguage {
  if (Platform.OS === "web" && typeof window !== "undefined" && typeof localStorage !== "undefined") {
    try {
      const saved = asLanguage(localStorage.getItem(STORAGE_KEY));
      if (saved) return saved;
    } catch {
      // ignore storage access restrictions
    }
  }
  return "en";
}

export interface LanguageState {
  language: SupportedLanguage;
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
}

const initialLang = getInitialLanguage();

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: initialLang,
  currentLanguage: initialLang,
  setLanguage: (lang: SupportedLanguage) => {
    if (Platform.OS !== "web") {
      // The screen changes now; saving is best effort and must never block that.
      AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => {});
    } else if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // ignore storage access restrictions
      }
    }
    set({ language: lang, currentLanguage: lang });
  },
  toggleLanguage: () => {
    const next = get().language === "en" ? "bn" : "en";
    get().setLanguage(next);
  },
}));

/**
 * Applies the language saved on this device. In a browser this is immediate; on a
 * phone it waits for AsyncStorage. Never rejects: a storage failure leaves the
 * current language as it is.
 */
export async function restoreSavedLanguage(): Promise<void> {
  let initial: SupportedLanguage | null;
  if (Platform.OS === "web") {
    initial = getInitialLanguage();
  } else {
    try {
      initial = asLanguage(await AsyncStorage.getItem(STORAGE_KEY));
    } catch {
      initial = null;
    }
  }
  if (initial) useLanguageStore.setState({ language: initial, currentLanguage: initial });
}

export function useTranslation() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const toggleLanguage = useLanguageStore((s) => s.toggleLanguage);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      return translate(language, key, params);
    },
    [language]
  );

  return {
    t,
    language,
    setLanguage,
    toggleLanguage,
  };
}
