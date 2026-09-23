import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";
import { HERO_IMAGE_URL } from "@/lib/heroImage";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta content="Browse verified real estate listings, connect directly with property owners, and search with transparent data on HomeNet." name="description" />
        {/* The title is supplied per route via PageMeta (expo-router/head),
            which fills Expo Router's own react-helmet tag. A static <title>
            here would be a second, competing title element. */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/*
          The homepage LCP element is a CSS background image, which the preload
          scanner cannot see until the bundle has rendered. Announcing it here
          starts the download in parallel with the JS instead of after it.
          The URL must stay identical to HomeScreen's — hence the shared constant.
        */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link
          rel="preload"
          as="image"
          fetchPriority="high"
          href={HERO_IMAGE_URL}
        />
        <ScrollViewStyleReset />
        {/*
          Inter and Plus Jakarta Sans are bundled and registered by useFonts in
          _layout.tsx, under the family names Inter_400Regular,
          PlusJakartaSans_700Bold and so on — which is what all ~675 fonts.*
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

          /* ─── Google Translate UI Cleanup ──────────────────────────────── */
          .goog-te-banner-frame.skiptranslate,
          .goog-te-banner-frame,
          .goog-te-balloon-frame,
          #goog-gt-tt,
          .goog-tooltip,
          .goog-tooltip:hover {
            display: none !important;
            visibility: hidden !important;
          }
          body {
            top: 0px !important;
            position: static !important;
          }
          .skiptranslate iframe {
            display: none !important;
          }
          #google_translate_element {
            display: none !important;
          }
        ` }} />
      </head>
      <body>
        <div id="google_translate_element" style={{ display: "none" }} />
        {children}
      </body>
    </html>
  );
}
