import { create } from "zustand";
import { Platform } from "react-native";

export type SupportedLanguage = "en" | "bn";

interface LanguageState {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
}

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages?: string;
            autoDisplay?: boolean;
            layout?: number;
          },
          elementId: string
        ) => void;
        InlineLayout?: {
          HORIZONTAL: number;
        };
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

const COOKIE_NAME = "googtrans";
const GOOGTRANS_COOKIE_REGEX = new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`);
const SCRIPT_ID = "google-translate-script";

function getCookie(name: string): string | null {
  if (Platform.OS !== "web" || typeof document === "undefined") return null;
  const match = document.cookie.match(GOOGTRANS_COOKIE_REGEX);
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string) {
  if (Platform.OS !== "web" || typeof document === "undefined") return;
  const domain = window.location.hostname;
  document.cookie = `${name}=${value};path=/;SameSite=Lax;`;
  if (domain && domain !== "localhost" && !/^\d+\.\d+\.\d+\.\d+$/.test(domain)) {
    document.cookie = `${name}=${value};path=/;domain=.${domain};SameSite=Lax;`;
  }
}

function clearCookie(name: string) {
  if (Platform.OS !== "web" || typeof document === "undefined") return;
  const domain = window.location.hostname;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax;`;
  if (domain && domain !== "localhost" && !/^\d+\.\d+\.\d+\.\d+$/.test(domain)) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.${domain};SameSite=Lax;`;
  }
}

function getInitialLanguage(): SupportedLanguage {
  if (Platform.OS !== "web" || typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem("homenet_lang");
    if (saved === "bn" || saved === "en") return saved;
    const cookie = getCookie(COOKIE_NAME);
    if (cookie && cookie.includes("/bn")) return "bn";
  } catch {
    // ignore storage access restrictions
  }
  return "en";
}

function applyGoogleTranslation(targetLang: SupportedLanguage) {
  if (Platform.OS !== "web" || typeof document === "undefined" || typeof window === "undefined") return;

  try {
    localStorage.setItem("homenet_lang", targetLang);
  } catch {
    // ignore storage access restrictions
  }

  // ── Switching to English ──────────────────────────────────────────────
  // Google Translate has no public API to un-translate a page. The only
  // reliable restoration is a fresh page load with the cookie cleared.
  if (targetLang === "en") {
    clearCookie(COOKIE_NAME);
    window.location.reload();
    return;
  }

  // ── Switching to Bangla ───────────────────────────────────────────────
  setCookie(COOKIE_NAME, "/en/bn");

  const selectEl = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
  if (selectEl) {
    selectEl.value = "bn";
    selectEl.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  // First activation: inject script, poll until combo appears
  ensureGoogleTranslateScript();
  let attempts = 0;
  const poll = setInterval(() => {
    const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (combo) {
      clearInterval(poll);
      combo.value = "bn";
      combo.dispatchEvent(new Event("change", { bubbles: true }));
    } else if (++attempts > 30) {
      clearInterval(poll);
    }
  }, 80);
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  currentLanguage: getInitialLanguage(),
  setLanguage: (lang: SupportedLanguage) => {
    set({ currentLanguage: lang });
    applyGoogleTranslation(lang);
  },
  toggleLanguage: () => {
    const next = get().currentLanguage === "en" ? "bn" : "en";
    set({ currentLanguage: next });
    applyGoogleTranslation(next);
  },
}));

/**
 * Loads the Google Translate widget script on demand. Idempotent.
 */
export function ensureGoogleTranslateScript() {
  if (Platform.OS !== "web" || typeof document === "undefined") return;

  window.googleTranslateElementInit = () => {
    if (window.google?.translate?.TranslateElement) {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,bn",
          autoDisplay: false,
          layout: 0,
        },
        "google_translate_element"
      );
    }
  };

  if (!document.getElementById(SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.type = "text/javascript";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }
}

/**
 * Only loads script at boot for visitors who previously saved Bangla.
 * Default English visitors have 0 KB initial translate overhead.
 */
export function shouldLoadTranslateOnBoot(): boolean {
  return getInitialLanguage() === "bn";
}
