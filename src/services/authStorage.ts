import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_KEY = "homenet.auth";

export type StoredAuthSession = {
  accessToken: string;
  refreshToken: string;
  userId: string;
  userName: string;
  email: string;
  avatarUrl: string | null;
};

export async function saveAuthSession(session: StoredAuthSession) {
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export async function getAuthSession(): Promise<StoredAuthSession | null> {
  const raw = await AsyncStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as StoredAuthSession;
}

export async function clearAuthSession() {
  await AsyncStorage.removeItem(AUTH_KEY);
}
