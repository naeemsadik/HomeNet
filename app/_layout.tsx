// First, so production is silent before anything else can log.
import "@/lib/productionConsole";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthModal } from "@/components/AuthModal";
import { ToastHost } from "@/components/ToastHost";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { trackPageView } from "@/lib/ga";
import { setUnauthorizedHandler } from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { appFonts } from "@/theme/appFonts";
import { restoreSavedLanguage } from "@/i18n";
import { PageMeta } from "@/components/PageMeta";
import { queryClient } from "@/lib/queryClient";
import { fallbackTitleForPath } from "@/lib/seo";
import { installDomGuard } from "@/lib/domGuard";
import { installFieldFocus } from "@/lib/fieldFocus";

// Keep the native splash up until the fonts and the saved sign-in are ready, so
// the app opens on its first real screen instead of a blank one. The website has
// no native splash, and its static HTML must not wait on anything.
void SplashScreen.preventAutoHideAsync().catch(() => {});
// A slow network must not hold the splash forever.
const SPLASH_MAX_MS = 2000;

// Before React renders: browser translation/extensions might rewrite text nodes.
installDomGuard();
// Text fields show focus on the box they draw, not as a square ring inside it.
installFieldFocus();

export default function RootLayout() {
  // Latin subsets with font-display: swap on web; full files on native.
  const [fontsLoaded, fontError] = useFonts(appFonts);
  // A font that fails to load must not hold the app (or the native splash) forever.
  const loaded = fontsLoaded || Boolean(fontError);
  const pathname = usePathname();
  const hydrated = useAuthStore((s) => s.hydrated);
  const [splashTimedOut, setSplashTimedOut] = useState(false);
  // The website renders as soon as fonts load; the app also waits for the saved sign-in.
  const ready = Platform.OS === "web" ? loaded : loaded && (hydrated || splashTimedOut);

  // Tells app/+html.tsx's CSS the page is hydrated and laid out for this screen, so it can show
  // the pre-rendered page it hid on wider screens (see the comment there). Two frames: the first
  // paints the hydrated tree, the second is when its layout for the real window size has settled.
  useEffect(() => {
    if (!loaded || Platform.OS !== "web" || typeof document === "undefined") return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => document.documentElement.classList.add("app-ready"));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [loaded]);

  // One GA4 page view per route. The app navigates on the client, so a single
  // config call at startup would record one page view for an entire session.
  // trackPageView configures GA4 on its first call, so this covers the
  // landing page too. A no-op unless EXPO_PUBLIC_GA_MEASUREMENT_ID is set.
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

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
            title={fallbackTitleForPath(pathname)}
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
