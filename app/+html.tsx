import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";
import { FIELD_FOCUS_CSS, STYLE_ID as FIELD_FOCUS_STYLE_ID } from "@/lib/fieldFocus";
import { GA_MEASUREMENT_ID, isValidMeasurementId } from "@/lib/ga";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta name="yandex-verification" content="bc39c4d488d0a3ba" />
        {/* The title and description are supplied per route via PageMeta
            (expo-router/head), which fills Expo Router's own react-helmet tags.
            A static <title> or description here would be a second, competing
            copy: crawlers would see two. */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* The homepage hero preload lives in app/index.tsx: every page shares
            this file, and on the others an unused preload logs a console
            warning. */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        {/* GA4's loader, and nothing at all when EXPO_PUBLIC_GA_MEASUREMENT_ID
            is unset. `async` keeps it off the critical path. The gtag stub and
            the config call live in src/lib/ga.ts rather than in an inline
            script here: script-src has no 'unsafe-inline', so an inline script
            would need a sha256 hash in vercel.json that changed with the
            measurement ID. An external src needs no hash. */}
        {isValidMeasurementId(GA_MEASUREMENT_ID) ? (
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`}
          />
        ) : null}
        <ScrollViewStyleReset />
        {/*
          Inter and Plus Jakarta Sans are bundled and registered by useFonts in
          _layout.tsx, under the family names Inter_400Regular,
          PlusJakartaSans_700Bold and so on, which is what all ~675 fonts.*
          token call sites resolve to.

          The Google Fonts stylesheet that used to sit here registered a second,
          differently-named copy ("Inter", "Plus Jakarta Sans") that only this
          file's base CSS rule ever referenced. It downloaded both families
          again and blocked first paint for ~200 ms to do it. Removed: the
          bundled copies are the ones the app actually renders with.
        */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body, #root {
            height: 100%;
            width: 100%;
            margin: 0;
            overflow-x: hidden;
            background: #f8faf9;
            font-family: 'Inter_400Regular', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          * {
            box-sizing: border-box;
          }
          /* Pages are pre-rendered at a phone's size (src/hooks/useResponsive.ts). On a wider screen
             that layout would flash and then jump to the real one, so the page stays invisible
             until app/_layout.tsx adds app-ready (a script that loads fast there). It stays in the
             document, so crawlers read it. If the script never runs it appears after 4 s anyway. */
          @media (min-width: 601px) {
            html:not(.app-ready) #root {
              opacity: 0;
              animation: app-ready-fallback 0s 4s forwards;
            }
          }
          @keyframes app-ready-fallback {
            to { opacity: 1; }
          }
        ` }} />
        {/* The field focus rules, under the id installFieldFocus checks so they are not added twice. */}
        <style id={FIELD_FOCUS_STYLE_ID} dangerouslySetInnerHTML={{ __html: FIELD_FOCUS_CSS }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
