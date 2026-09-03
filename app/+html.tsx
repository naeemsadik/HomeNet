import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta content="AI-assisted property discovery and market insights in Bangladesh." name="description" />
        <title>HomeNet | Find a home you can trust, priced by AI</title>
        <ScrollViewStyleReset />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          html, body, #root {
            height: 100%;
            margin: 0;
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
        ` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
