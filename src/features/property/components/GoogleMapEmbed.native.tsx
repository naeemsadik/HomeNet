import { StyleSheet, View } from "react-native";
import { WebView, type WebViewProps } from "react-native-webview";
import { openExternalUrl } from "@/lib/safeUrl";
import { SITE_URL } from "@/lib/seo";
import { useTranslation } from "@/i18n";
import { colorTokens } from "@/theme";
import type { GoogleMapEmbedProps } from "./GoogleMapEmbed";

type LoadRequest = Parameters<NonNullable<WebViewProps["onShouldStartLoadWithRequest"]>>[0];

/**
 * The map shows once, from the embed address; a tap on "Open in Maps" or any other link inside
 * it goes to the phone's own browser or Maps app instead of replacing the card's map.
 */
export function allowEmbedNavigation(
  embedUrl: string,
  request: Pick<LoadRequest, "url"> & { isTopFrame?: boolean },
): boolean {
  const { url } = request;
  // Loads inside the map's own frame (iOS reports them too) are Google's, not a tapped link.
  if (request.isTopFrame === false) return true;
  if (url === `${SITE_URL}/` || url === embedUrl || url === "about:blank") return true;
  if (url.startsWith("https://") || url.startsWith("http://")) openExternalUrl(url);
  return false;
}

/** Escapes text for an HTML attribute value. */
export function attr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * The page the web view shows: Google's embed inside an iframe, exactly as the website does. The
 * embed address is built for a frame; opened as a page of its own it can stay blank.
 */
export function mapPage(embedUrl: string, title: string, background: string = colorTokens.surfaceSunken): string {
  return (
    `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<style>html,body{margin:0;height:100%;background:${attr(background)}}iframe{border:0;width:100%;height:100%}</style></head>` +
    `<body><iframe title="${attr(title)}" src="${attr(embedUrl)}" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe></body></html>`
  );
}

/**
 * Google's embedded map for a listing, in the app: the same map and pin the website shows. Google
 * finds the place from the address when the listing has no coordinates.
 */
export function GoogleMapEmbed({ title, embedUrl }: GoogleMapEmbedProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.host}>
      <WebView
        accessibilityLabel={t("propertyDetail.mapFor", { title })}
        source={{ html: mapPage(embedUrl, title), baseUrl: `${SITE_URL}/` }}
        originWhitelist={["*"]}
        onShouldStartLoadWithRequest={(request) => allowEmbedNavigation(embedUrl, request)}
        javaScriptEnabled
        domStorageEnabled={false}
        allowFileAccess={false}
        mixedContentMode="never"
        setSupportMultipleWindows={false}
        // A map that pans with one finger keeps the drag from the page's scroll view.
        nestedScrollEnabled
        overScrollMode="never"
        style={styles.web}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1, width: "100%", backgroundColor: colorTokens.surfaceSunken },
  web: { flex: 1, backgroundColor: colorTokens.surfaceSunken },
});
