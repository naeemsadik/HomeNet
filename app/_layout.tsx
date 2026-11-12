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
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { setUnauthorizedHandler } from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { appFonts } from "@/theme/appFonts";
import { restoreSavedLanguage } from "@/i18n";
import { PageMeta } from "@/components/PageMeta";
import { queryClient } from "@/lib/queryClient";
import { installDomGuard } from "@/lib/domGuard";
import { installFieldFocus } from "@/lib/fieldFocus";

// Before React renders: browser translation/extensions might rewrite text nodes.
installDomGuard();
// Text fields show focus on the box they draw, not as a square ring inside it.
installFieldFocus();

export default function RootLayout() {
  // Latin subsets with font-display: swap on web; full files on native.
  const [loaded] = useFonts(appFonts);

  useEffect(() => {
    // Browser and phone alike: the language the user picked last time.
    void restoreSavedLanguage();

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
        <ErrorBoundary>
          {/* Default document title. Routes that render their own PageMeta
            override this; without it, any route lacking one would ship the
            empty <title> that Expo Router emits by default. */}
          <PageMeta
            title="HomeNet BD | Verified Property Listings in Bangladesh"
            description="HomeNet BD is a property marketplace for Bangladesh. Browse flats, houses and plots for sale or rent and contact the owners directly. Listing is free."
            noCanonical
          />
          <StatusBar style="dark" />
          <Stack screenOptions={{ contentStyle: { backgroundColor: "#f8faf9" }, headerShown: false }} />
          <AuthModal />
          <ToastHost />
        </ErrorBoundary>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
