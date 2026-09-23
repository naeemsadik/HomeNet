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

function setCookie(name: string, value: string) {
  if (Platform.OS !== "web" || typeof document === "undefined") return;
  const domain = window.location.hostname;
  document.cookie = `${name}=${value};path=/;`;
  if (domain && domain !== "localhost") {
    document.cookie = `${name}=${value};path=/;domain=.${domain};`;
  }
}

function clearCookie(name: string) {
  if (Platform.OS !== "web" || typeof document === "undefined") return;
  const domain = window.location.hostname;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  if (domain && domain !== "localhost") {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.${domain};`;
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
    // ignore
  }
  return "en";
}

function applyGoogleTranslation(targetLang: SupportedLanguage) {
  if (Platform.OS !== "web" || typeof document === "undefined" || typeof window === "undefined") return;

  try {
    localStorage.setItem("homenet_lang", targetLang);
  } catch {
    // ignore
  }

  if (targetLang === "bn") {
    setCookie(COOKIE_NAME, "/en/bn");
  } else {
    clearCookie(COOKIE_NAME);
    setCookie(COOKIE_NAME, "/en/en");
  }

  const selectEl = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
  if (selectEl) {
    if (targetLang === "bn") {
      selectEl.value = "bn";
      if (typeof selectEl.onchange === "function") {
        selectEl.onchange(new Event("change"));
      }
      selectEl.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    } else {
      // Switching to English: Google Translate script does not reliably un-translate live DOM nodes
      // without restoring original or reloading with cleared cookie.
      // Clear select & reload cleanly for 100% accurate, fast restoration
      window.location.reload();
      return;
    }
  }

  window.location.reload();
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

export function ensureGoogleTranslateScript() {
  if (Platform.OS !== "web" || typeof document === "undefined") return;

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

  const existingScript = document.getElementById("google-translate-script");
  if (!existingScript) {
    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.type = "text/javascript";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }
}

export function shouldLoadTranslateOnBoot(): boolean {
  return true;
}
