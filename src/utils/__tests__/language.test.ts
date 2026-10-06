import {
  useLanguageStore,
  restoreSavedLanguage,
  shouldLoadTranslateOnBoot,
  ensureGoogleTranslateScript,
  restoreTranslateCookie,
} from "@/utils/language";

describe("utils/language backward compatibility", () => {
  beforeEach(() => {
    localStorage.clear();
    useLanguageStore.setState({ language: "en", currentLanguage: "en" });
  });

  it("exports useLanguageStore with state and action methods", () => {
    expect(useLanguageStore.getState().language).toBe("en");
    expect(useLanguageStore.getState().currentLanguage).toBe("en");

    useLanguageStore.getState().setLanguage("bn");
    expect(useLanguageStore.getState().language).toBe("bn");
    expect(useLanguageStore.getState().currentLanguage).toBe("bn");

    useLanguageStore.getState().toggleLanguage();
    expect(useLanguageStore.getState().language).toBe("en");
    expect(useLanguageStore.getState().currentLanguage).toBe("en");
  });

  it("restores saved language cleanly", () => {
    localStorage.setItem("homenet_lang", "bn");
    restoreSavedLanguage();
    expect(useLanguageStore.getState().language).toBe("bn");
    expect(useLanguageStore.getState().currentLanguage).toBe("bn");
  });

  it("handles legacy Google Translate function shims without crashing", () => {
    expect(() => ensureGoogleTranslateScript()).not.toThrow();
    expect(() => restoreTranslateCookie()).not.toThrow();
    expect(shouldLoadTranslateOnBoot()).toBe(false);
  });
});
