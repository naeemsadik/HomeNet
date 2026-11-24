import { StyleSheet, View } from "react-native";
import { WebView, type WebViewProps } from "react-native-webview";
import { openExternalUrl } from "@/lib/safeUrl";
import type { GoogleMapEmbedProps } from "./GoogleMapEmbed";

type LoadRequest = Parameters<NonNullable<WebViewProps["onShouldStartLoadWithRequest"]>>[0];

/**
 * The map shows once, from the embed address; a tap on "Open in Maps" or any other link inside
 * it goes to the phone's own browser or Maps app instead of replacing the card's map.
 */
export function allowEmbedNavigation(embedUrl: string, request: Pick<LoadRequest, "url">): boolean {
  const { url } = request;
  if (url === embedUrl || url === "about:blank") return true;
  if (url.startsWith("https://") || url.startsWith("http://")) openExternalUrl(url);
  return false;
}

/**
 * Google's embedded map for a listing, in the app: the same map and pin the website shows. Google
 * finds the place from the address when the listing has no coordinates.
 */
export function GoogleMapEmbed({ title, embedUrl }: GoogleMapEmbedProps) {
  return (
    <View style={styles.host}>
      <WebView
        accessibilityLabel={`Google Map for ${title}`}
        source={{ uri: embedUrl }}
        originWhitelist={["https://*"]}
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
  host: { flex: 1, width: "100%", backgroundColor: "#E5E7EB" },
  web: { flex: 1, backgroundColor: "#E5E7EB" },
});
