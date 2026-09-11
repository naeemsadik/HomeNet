import { useEffect } from "react";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import {
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useFonts } from "expo-font";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthModal } from "@/components/AuthModal";
import { setUnauthorizedHandler } from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      const styleId = "homenet-remove-focus-outline";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
          input, textarea, select, [contenteditable] {
            outline: none !important;
            outline-style: none !important;
            box-shadow: none !important;
            -webkit-tap-highlight-color: transparent !important;
          }
          input:focus, textarea:focus, select:focus, [contenteditable]:focus,
          input:focus-visible, textarea:focus-visible, select:focus-visible {
            outline: none !important;
            outline-style: none !important;
            box-shadow: none !important;
          }
        `;
        document.head.appendChild(style);
      }

      // Self-XSS console warning (Facebook-style)
      console.log(
        "%cStop!",
        "color: red; font-size: 60px; font-weight: bold; text-shadow: 2px 2px 0 rgba(0,0,0,0.2);",
      );
      console.log(
        "%cThis is a browser feature intended for developers. If someone told you to copy and paste something here to enable a HomeNet feature or \"hack\" someone's account, it's a scam and will give them access to your HomeNet account.",
        "font-size: 16px; color: #FFFFFF;",
      );
      console.log(
        "%cSee https://homenetbd.com/self-xss for more information.",
        "font-size: 16px; color: #3b82f6;",
      );
    }

    setUnauthorizedHandler(() => {
      useAuthStore.getState().resetSession();
      queryClient.clear();
    });
    void useAuthStore.getState().hydrate();
    return () => setUnauthorizedHandler(null);
  }, []);

  if (!loaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ contentStyle: { backgroundColor: "#f8faf9" }, headerShown: false }} />
        <AuthModal />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
