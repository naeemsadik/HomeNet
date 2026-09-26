import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * General storage utility for non-sensitive user preferences and client state.
 *
 * NOTE: Sensitive credentials (auth tokens, passwords) MUST NOT be stored here.
 * Use `@/services/tokenStorage` (`expo-secure-store`) for all secrets.
 */
export const preferenceStorage = {
  /**
   * Retrieves a non-sensitive string or parsed JSON item.
   */
  async getItem<T = string>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as unknown as T;
      }
    } catch {
      return null;
    }
  },

  /**
   * Saves a non-sensitive preference value (strings or serializable objects).
   */
  async setItem(key: string, value: unknown): Promise<void> {
    try {
      const stringValue = typeof value === "string" ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
    } catch {
      // ignore storage write errors
    }
  },

  /**
   * Removes a non-sensitive preference key.
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // ignore storage removal errors
    }
  },
};
