import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export const ACCESS_TOKEN_KEY = "homenet.access_token";
export const REFRESH_TOKEN_KEY = "homenet.refresh_token";

/**
 * Hardware-backed security options for Keychain (iOS) and Keystore (Android).
 * WHEN_UNLOCKED_THIS_DEVICE_ONLY ensures tokens cannot be restored onto another
 * device or decrypted when the device is locked.
 */
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/**
 * Token storage abstraction.
 *
 * • **Native (iOS / Android)** – uses `expo-secure-store` with hardware
 *   keychain/keystore encryption (`WHEN_UNLOCKED_THIS_DEVICE_ONLY`).
 * • **Web** – falls back to scoped `localStorage` because hardware keystore
 *   is unavailable in browser environments.
 */

// ─── Helpers ───────────────────────────────────────────────────────────────

async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage === "undefined") return null;
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value);
      }
    } catch {
      // Ignore private/restricted storage access errors
    }
    return;
  }
  await SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS);
}

async function deleteSecureItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(key);
      }
    } catch {
      // Ignore private/restricted storage access errors
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

// ─── Public API ────────────────────────────────────────────────────────────

export async function getAccessToken(): Promise<string | null> {
  return getSecureItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return getSecureItem(REFRESH_TOKEN_KEY);
}

export async function saveTokens(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await Promise.all([
    setSecureItem(ACCESS_TOKEN_KEY, accessToken),
    setSecureItem(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    deleteSecureItem(ACCESS_TOKEN_KEY),
    deleteSecureItem(REFRESH_TOKEN_KEY),
  ]);
}
