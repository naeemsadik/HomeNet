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
        <title>HomeNet — Real Estate Marketplace with Verified Listings</title>
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          html, body, #root {
            height: 100%;
            width: 100%;
            margin: 0;
            overflow-x: hidden;
            background: #f8faf9;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
