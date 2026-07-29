import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta content="AI-assisted property discovery and market insights." name="description" />
        <title>HomeNet | Find a home you can trust</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: "html,body,#root{height:100%;margin:0}body{overflow:hidden;background:#fff}" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
