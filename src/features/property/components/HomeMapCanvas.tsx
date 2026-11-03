import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent, type WebViewProps } from "react-native-webview";
import { openExternalUrl } from "@/lib/safeUrl";
import { markerHtml } from "./HomeMapCanvas.markers";
import type { HomeMapCanvasProps } from "./HomeMapCanvas.types";
import {
  MAP_PAGE_BASE_URL,
  MAP_USER_AGENT_SUFFIX,
  buildMapPage,
  parsePageMessage,
  type PageMarker,
  type ToPageMessage,
} from "./nativeMapPage";

type LoadRequest = Parameters<NonNullable<WebViewProps["onShouldStartLoadWithRequest"]>>[0];

/** The map page itself; anything else it tries to open (the attribution links) goes to the browser. */
export function allowMapNavigation(request: Pick<LoadRequest, "url">): boolean {
  const { url } = request;
  if (url === MAP_PAGE_BASE_URL || url === "about:blank") return true;
  if (url.startsWith("https://") || url.startsWith("http://")) openExternalUrl(url);
  return false;
}

/**
 * The listings map in the app: the website's Leaflet map (HomeMapCanvas.web.tsx) running in a
 * WebView, with the same pins, clusters and selection. The page is built once and keeps its own
 * view; the pins and the selected pin go in as messages, and a tapped pin comes back as one.
 */
export function HomeMapCanvas({
  markers,
  selectedId,
  onSelect,
  accessibilityLabel,
  touchDrag = false,
  zoomControlPosition = "topleft",
}: HomeMapCanvasProps) {
  const webRef = useRef<WebView>(null);
  // Messages sent before the page has said it is ready would be lost; until then they wait.
  const readyRef = useRef(false);
  // Read once, like the website's map: these don't change for a mounted map.
  const [html] = useState(() => buildMapPage({ touchDrag, zoomControlPosition }));

  const pageMarkers = useMemo<PageMarker[]>(
    () =>
      markers.map((item) => ({
        id: item.id,
        lat: item.lat,
        lng: item.lng,
        label: item.label,
        html: markerHtml(item, false),
        htmlActive: markerHtml(item, true),
      })),
    [markers],
  );

  // The page's messages arrive later; they read the latest props through this.
  const latest = useRef({ pageMarkers, selectedId, onSelect });
  useEffect(() => {
    latest.current = { pageMarkers, selectedId, onSelect };
  });

  const post = useCallback((message: ToPageMessage) => {
    if (readyRef.current) webRef.current?.postMessage(JSON.stringify(message));
  }, []);

  useEffect(() => {
    post({ type: "markers", markers: pageMarkers, selectedId: latest.current.selectedId });
  }, [pageMarkers, post]);

  useEffect(() => {
    post({ type: "select", id: selectedId });
  }, [selectedId, post]);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const message = parsePageMessage(event.nativeEvent.data);
      if (!message) return;
      if (message.type === "ready") {
        readyRef.current = true;
        const { pageMarkers: list, selectedId: id } = latest.current;
        post({ type: "markers", markers: list, selectedId: id });
        post({ type: "select", id });
        return;
      }
      // Only a pin the app put on the map.
      if (latest.current.pageMarkers.some((item) => item.id === message.id)) latest.current.onSelect(message.id);
    },
    [post],
  );

  // Android can stop a WebView's renderer to free memory; load the page again, and resend on ready.
  const restart = useCallback(() => {
    readyRef.current = false;
    webRef.current?.reload();
  }, []);

  return (
    <View style={styles.host}>
      <WebView
        ref={webRef}
        accessibilityLabel={accessibilityLabel}
        source={{ html, baseUrl: MAP_PAGE_BASE_URL }}
        // Every navigation goes through allowMapNavigation, which opens only http(s) links, outside.
        originWhitelist={["*"]}
        onShouldStartLoadWithRequest={allowMapNavigation}
        onMessage={onMessage}
        onRenderProcessGone={restart}
        onContentProcessDidTerminate={restart}
        applicationNameForUserAgent={MAP_USER_AGENT_SUFFIX}
        javaScriptEnabled
        domStorageEnabled={false}
        allowFileAccess={false}
        allowsLinkPreview={false}
        mixedContentMode="never"
        setSupportMultipleWindows={false}
        // A map that pans with one finger keeps the drag from the page's scroll view.
        nestedScrollEnabled={touchDrag}
        scrollEnabled={false}
        bounces={false}
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
