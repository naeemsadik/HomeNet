import {
  useLanguageStore,
  translate,
  interpolate,
  restoreSavedLanguage,
} from "@/i18n";

describe("i18n engine and useTranslation hook", () => {
  beforeEach(() => {
    localStorage.clear();
    useLanguageStore.setState({ language: "en", currentLanguage: "en" });
  });

  describe("translate() & interpolate()", () => {
    it("translates static keys in English", () => {
      expect(translate("en", "nav.home")).toBe("Home");
      expect(translate("en", "hero.tabs.buy")).toBe("Buy");
      expect(translate("en", "propertyCard.verified")).toBe("Verified");
      expect(translate("en", "filters.title")).toBe("Advanced filters");
      expect(translate("en", "areaPicker.title")).toBe("Select Location");
      expect(translate("en", "browse.gridView")).toBe("Grid view");
      expect(translate("en", "propertyDetail.forSale")).toBe("For Sale");
      expect(translate("en", "propertyDetail.aboutProperty")).toBe(
        "About this property"
      );
      expect(translate("en", "propertyDetail.bookViewing")).toBe(
        "Book a visit"
      );
      expect(translate("en", "saved.title")).toBe("Saved Properties");
      expect(translate("en", "saved.emptyTitle")).toBe(
        "No saved properties yet"
      );
      expect(translate("en", "auth.signIn")).toBe("Sign in");
      expect(translate("en", "auth.signUp")).toBe("Create an account");
      expect(translate("en", "auth.resetPassword")).toBe("Reset password");
    });

    it("translates static keys in Bengali", () => {
      expect(translate("bn", "nav.home")).toBe("হোম");
      expect(translate("bn", "hero.tabs.buy")).toBe("কিনুন");
      expect(translate("bn", "propertyCard.verified")).toBe("যাচাইকৃত");
      expect(translate("bn", "filters.title")).toBe("অ্যাডভান্সড ফিল্টার");
      expect(translate("bn", "areaPicker.title")).toBe("এলাকা নির্বাচন করুন");
      expect(translate("bn", "browse.gridView")).toBe("গ্রিড ভিউ");
      expect(translate("bn", "propertyDetail.forSale")).toBe("বিক্রির জন্য");
      expect(translate("bn", "propertyDetail.aboutProperty")).toBe(
        "এই প্রপার্টি সম্পর্কে"
      );
      expect(translate("bn", "propertyDetail.bookViewing")).toBe(
        "পরিদর্শনের বুকিং দিন"
      );
      expect(translate("bn", "saved.title")).toBe("সংরক্ষিত প্রপার্টিসমূহ");
      expect(translate("bn", "saved.emptyTitle")).toBe(
        "এখনও কোনো সংরক্ষিত প্রপার্টি নেই"
      );
      expect(translate("bn", "auth.signIn")).toBe("সাইন ইন");
      expect(translate("bn", "auth.signUp")).toBe("অ্যাকাউন্ট তৈরি করুন");
      expect(translate("bn", "auth.resetPassword")).toBe("পাসওয়ার্ড রিসেট করুন");
    });

    it("translates filters, browse, and propertyDetail interpolation keys", () => {
      expect(translate("en", "filters.showResults", { count: 12 })).toBe(
        "Show 12 results"
      );
      expect(translate("bn", "filters.showResults", { count: "১২" })).toBe(
        "১২টি ফলাফল দেখুন"
      );
      expect(translate("en", "browse.propertiesFound", { count: 8 })).toBe(
        "8 properties found"
      );
      expect(translate("bn", "browse.propertiesFound", { count: "৮" })).toBe(
        "৮টি প্রপার্টি পাওয়া গেছে"
      );
      expect(
        translate("en", "propertyDetail.photoOf", { current: 1, total: 10 })
      ).toBe("1 of 10");
      expect(
        translate("bn", "propertyDetail.photoOf", { current: "১", total: "১০" })
      ).toBe("১ / ১০");
      expect(translate("en", "saved.count", { count: 3 })).toBe(
        "3 saved properties"
      );
      expect(translate("bn", "saved.count", { count: "৩" })).toBe(
        "৩টি সংরক্ষিত প্রপার্টি"
      );
      expect(
        translate("en", "auth.socialComingSoon", { provider: "Google" })
      ).toBe("Google sign-in will be available soon.");
      expect(
        translate("bn", "auth.socialComingSoon", { provider: "Google" })
      ).toBe("Google সাইন-ইন শীঘ্রই উপলব্ধ হবে।");
    });

    it("interpolates parameters with {{key}} format", () => {
      expect(
        translate("en", "propertyCard.photosCount", { count: 5 })
      ).toBe("5 Photos");
      expect(
        translate("bn", "propertyCard.photosCount", { count: 5 })
      ).toBe("5টি ছবি");
    });

    it("interpolates parameters with multiple variables", () => {
      const result = translate("en", "bookVisit.body", {
        sellerName: "Rahim",
        propertyTitle: "Green Villa",
      });
      expect(result).toContain("Rahim");
      expect(result).toContain("Green Villa");
    });

    it("interpolates helper directly", () => {
      expect(interpolate("Hello {{name}}!", { name: "Antigravity" })).toBe(
        "Hello Antigravity!"
      );
      expect(interpolate("Hello {name}!", { name: "Antigravity" })).toBe(
        "Hello Antigravity!"
      );
    });
  });

  describe("useLanguageStore", () => {
    it("initializes with default language 'en'", () => {
      expect(useLanguageStore.getState().language).toBe("en");
      expect(useLanguageStore.getState().currentLanguage).toBe("en");
    });

    it("switches language reactively when calling setLanguage('bn')", () => {
      useLanguageStore.getState().setLanguage("bn");
      expect(useLanguageStore.getState().language).toBe("bn");
      expect(useLanguageStore.getState().currentLanguage).toBe("bn");
      expect(localStorage.getItem("homenet_lang")).toBe("bn");
    });

    it("toggles language between 'en' and 'bn'", () => {
      expect(useLanguageStore.getState().language).toBe("en");

      useLanguageStore.getState().toggleLanguage();
      expect(useLanguageStore.getState().language).toBe("bn");
      expect(useLanguageStore.getState().currentLanguage).toBe("bn");

      useLanguageStore.getState().toggleLanguage();
      expect(useLanguageStore.getState().language).toBe("en");
      expect(useLanguageStore.getState().currentLanguage).toBe("en");
    });

    it("restores saved language from localStorage", () => {
      localStorage.setItem("homenet_lang", "bn");
      restoreSavedLanguage();
      expect(useLanguageStore.getState().language).toBe("bn");
      expect(useLanguageStore.getState().currentLanguage).toBe("bn");
    });
  });
});
