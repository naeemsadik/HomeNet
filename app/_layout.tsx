// First, so production is silent before anything else can log.
import "@/lib/productionConsole";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthModal } from "@/components/AuthModal";
import { ToastHost } from "@/components/ToastHost";
import { setUnauthorizedHandler } from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { colorTokens } from "@/theme";
import { appFonts } from "@/theme/appFonts";
import { restoreSavedLanguage } from "@/i18n";
import { PageMeta } from "@/components/PageMeta";
import { queryClient } from "@/lib/queryClient";
import { installDomGuard } from "@/lib/domGuard";

// Before React renders: browser translation/extensions might rewrite text nodes.
installDomGuard();

// Keyboard focus ring. Not colorTokens.primary (#04cf92), which sits at 2.03:1
// on white and fails the 3:1 WCAG 1.4.11 minimum for a focus indicator.
const FOCUS_RING_COLOR = colorTokens.primaryOnLight;


export default function RootLayout() {
  // Latin subsets with font-display: swap on web; full files on native.
  const [loaded] = useFonts(appFonts);

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
          input:focus, textarea:focus, select:focus, [contenteditable]:focus {
            outline: none !important;
            outline-style: none !important;
            box-shadow: none !important;
          }
          input:focus-visible, textarea:focus-visible, select:focus-visible,
          [contenteditable]:focus-visible {
            outline: 2px solid ${FOCUS_RING_COLOR} !important;
            outline-offset: 2px !important;
          }
        `;
        document.head.appendChild(style);
      }

      restoreSavedLanguage();
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
        {/* Default document title. Routes that render their own PageMeta
            override this; without it, any route lacking one would ship the
            empty <title> that Expo Router emits by default. */}
        <PageMeta
          title="HomeNet — Verified Property Listings in Bangladesh"
          description="Browse verified real estate listings, connect directly with property owners, and search with transparent data on HomeNet."
        />
        <StatusBar style="dark" />
        <Stack screenOptions={{ contentStyle: { backgroundColor: "#f8faf9" }, headerShown: false }} />
        <AuthModal />
        <ToastHost />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
