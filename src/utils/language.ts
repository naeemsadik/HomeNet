import { create } from "zustand";
import { Platform } from "react-native";

export type SupportedLanguage = "en" | "bn";

interface LanguageState {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
}

const COOKIE_NAME = "googtrans";

function getCookie(name: string): string | null {
  if (Platform.OS !== "web" || typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number = 365) {
  if (Platform.OS !== "web" || typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();
  const domain = window.location.hostname;
  
  // Set for current path & root path, also set without domain for localhost
  document.cookie = `${name}=${value};${expires};path=/`;
  if (domain && domain !== "localhost") {
    document.cookie = `${name}=${value};${expires};path=/;domain=.${domain}`;
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
    // ignore storage errors
  }
  return "en";
}

function applyGoogleTranslation(targetLang: SupportedLanguage) {
  if (Platform.OS !== "web" || typeof document === "undefined" || typeof window === "undefined") return;

  try {
    localStorage.setItem("homenet_lang", targetLang);
  } catch {
    // ignore storage errors
  }

  const transValue = targetLang === "bn" ? "/en/bn" : "/en/en";
  setCookie(COOKIE_NAME, transValue);

  // The widget is no longer loaded on boot, so the first switch has to pull it
  // in. If it is already present we can drive its select directly; otherwise
  // the cookie is set and a reload brings the page back translated.
  const selectEl = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
  if (selectEl) {
    selectEl.value = targetLang;
    selectEl.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    ensureGoogleTranslateScript();
    window.location.reload();
  }
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
 * Loads the Google Translate widget. Idempotent.
 *
 * This used to run on every visit, costing ~105 KiB (60 KiB of it unused), a
 * 57 ms long task and a non-composited animation from its spinner — for a
 * feature most visitors never touch. It is now called only when the visitor
 * actually switches language, or on boot for someone who already reads in
 * Bangla (see `shouldLoadTranslateOnBoot`), since their page has to come back
 * translated rather than in English.
 */
export function ensureGoogleTranslateScript() {
  if (Platform.OS !== "web" || typeof document === "undefined") return;

  // Setup Google Translate Init Function
  (window as any).googleTranslateElementInit = () => {
    if ((window as any).google && (window as any).google.translate) {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,bn",
          autoDisplay: false,
          layout: (window as any).google.translate.TranslateElement.InlineLayout.HORIZONTAL,
        },
        "google_translate_element"
      );
    }
  };

  // Inject Script if not already loaded
  const existingScript = document.getElementById("google-translate-script");
  if (!existingScript) {
    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.type = "text/javascript";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }
}

/**
 * True when the visitor's stored preference is Bangla, so the widget must be
 * present on first paint for the page to render in the language they chose.
 */
export function shouldLoadTranslateOnBoot(): boolean {
  return getInitialLanguage() === "bn";
}
