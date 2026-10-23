import AsyncStorage from "@react-native-async-storage/async-storage";
import { restoreSavedLanguage, useLanguageStore } from "@/i18n";

/**
 * On a phone there is no localStorage, so the language an owner picked used to
 * be forgotten every time the app was closed. It is kept in AsyncStorage there.
 */
const KEY = "homenet_lang";

beforeEach(async () => {
  await AsyncStorage.clear();
  useLanguageStore.setState({ language: "en", currentLanguage: "en" });
});

describe("the language on Android", () => {
  it("is remembered when it is chosen", async () => {
    useLanguageStore.getState().setLanguage("bn");
    expect(useLanguageStore.getState().language).toBe("bn"); // the screen changes at once
    await Promise.resolve();
    expect(await AsyncStorage.getItem(KEY)).toBe("bn");
  });

  it("is restored on the next launch", async () => {
    await AsyncStorage.setItem(KEY, "bn");
    await restoreSavedLanguage();
    expect(useLanguageStore.getState().language).toBe("bn");
    expect(useLanguageStore.getState().currentLanguage).toBe("bn");
  });

  it("stays English when nothing was saved", async () => {
    await restoreSavedLanguage();
    expect(useLanguageStore.getState().language).toBe("en");
  });

  it("ignores a saved value that is not a language we have", async () => {
    await AsyncStorage.setItem(KEY, "xx");
    await restoreSavedLanguage();
    expect(useLanguageStore.getState().language).toBe("en");
  });

  it("still works when the storage fails", async () => {
    const getItem = jest.spyOn(AsyncStorage, "getItem").mockRejectedValueOnce(new Error("disk"));
    await expect(restoreSavedLanguage()).resolves.toBeUndefined();
    expect(useLanguageStore.getState().language).toBe("en");
    getItem.mockRestore();

    const setItem = jest.spyOn(AsyncStorage, "setItem").mockRejectedValueOnce(new Error("disk"));
    expect(() => useLanguageStore.getState().setLanguage("bn")).not.toThrow();
    expect(useLanguageStore.getState().language).toBe("bn");
    await Promise.resolve();
    setItem.mockRestore();
  });
});
