// First, so production is silent before anything else can log.
import "@/lib/productionConsole";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
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

// Keep the native splash up until the fonts and the saved sign-in are ready, so
// the app opens on its first real screen instead of a blank one. The website has
// no native splash, and its static HTML must not wait on anything.
void SplashScreen.preventAutoHideAsync().catch(() => {});
// A slow network must not hold the splash forever.
const SPLASH_MAX_MS = 5000;

// Before React renders: browser translation/extensions might rewrite text nodes.
installDomGuard();
// Text fields show focus on the box they draw, not as a square ring inside it.
installFieldFocus();

export default function RootLayout() {
  // Latin subsets with font-display: swap on web; full files on native.
  const [fontsLoaded, fontError] = useFonts(appFonts);
  const loaded = fontsLoaded || Boolean(fontError);
  const authReady = useAuthStore((s) => s.hydrated);
  const [splashTimedOut, setSplashTimedOut] = useState(false);
  const ready = loaded && (Platform.OS === "web" || authReady || splashTimedOut);

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

  useEffect(() => {
    if (Platform.OS === "web") return;
    const timer = setTimeout(() => setSplashTimedOut(true), SPLASH_MAX_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

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
