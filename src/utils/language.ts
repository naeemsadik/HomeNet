import {
  useLanguageStore,
  restoreSavedLanguage,
  type SupportedLanguage,
  type LanguageState,
} from "@/i18n";

export type { SupportedLanguage, LanguageState };
export { useLanguageStore, restoreSavedLanguage };

/**
 * @deprecated Legacy Google Translate script loader - no-op in native i18n
 */
export function ensureGoogleTranslateScript() {}

/**
 * @deprecated Legacy Google Translate boot checker - no-op in native i18n
 */
export function shouldLoadTranslateOnBoot(): boolean {
  return false;
}

/**
 * @deprecated Legacy Google Translate cookie restorer - no-op in native i18n
 */
export function restoreTranslateCookie() {}
