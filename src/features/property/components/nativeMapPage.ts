import { SITE_URL } from "@/lib/seo";
import { DHAKA_CENTER } from "../constants/areaCenters";
import { MAP_ATTRIBUTION, MAP_MAX_ZOOM, MAP_TILE_URL } from "../constants/map";
import { MARKER_CSS } from "./HomeMapCanvas.markers";
import type { HomeMapCanvasProps } from "./HomeMapCanvas.types";
import {
  LEAFLET_CSS,
  LEAFLET_JS,
  MARKERCLUSTER_CSS,
  MARKERCLUSTER_JS,
} from "./leafletAssets.generated";

/**
 * The page the app's map WebView shows: the website's Leaflet map, with Leaflet and the cluster
 * plugin inlined (leafletAssets.generated.ts) so nothing but the map tiles is fetched.
 *
 * Its base URL is the site, so tile requests carry it as their Referer, and the WebView adds the
 * app's name to its User-Agent: OpenStreetMap's tile policy asks apps to identify themselves.
 */
export const MAP_PAGE_BASE_URL = `${SITE_URL}/`;
export const MAP_USER_AGENT_SUFFIX = "HomenetBD-App";

/** A pin as the page draws it: its HTML is built by the app (HomeMapCanvas.markers.ts) and escaped there. */
export interface PageMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  html: string;
  htmlActive: string;
}

/** App to page. */
export type ToPageMessage =
  | { type: "markers"; markers: PageMarker[]; selectedId: string | null }
  | { type: "select"; id: string | null };

/** Page to app. */
export type FromPageMessage = { type: "ready" } | { type: "select"; id: string };

/** Reads a message from the page; anything else (or malformed) is null. */
export function parsePageMessage(data: string): FromPageMessage | null {
  let message: unknown;
  try {
    message = JSON.parse(data);
  } catch {
    return null;
  }
  if (!message || typeof message !== "object") return null;
  const { type, id } = message as { type?: unknown; id?: unknown };
  if (type === "ready") return { type: "ready" };
  if (type === "select" && typeof id === "string" && id.length > 0) return { type: "select", id };
  return null;
}

/** JSON that is safe inside an inline <script>: no "</script>" can close it early. */
const scriptJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
/** Leaflet's own code, kept from closing its <script> or <style> early (it contains neither today). */
const inScript = (code: string) => code.replace(/<\/script/gi, "<\\/script");
const inStyle = (css: string) => css.replace(/<\/style/gi, "<\\/style");

/*
 * The map script. Plain JavaScript (it runs in the WebView, not through Metro), the same steps
 * as HomeMapCanvas.web.tsx: one finger pans only when `touchDrag` is set, the first pins frame
 * the view and later lists keep it, and the selected pin is raised and brought into view.
 */
const PAGE_SCRIPT = `
(function () {
  var opts = window.__HN_MAP_OPTIONS__;
  function send(message) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }
  var map = L.map("map", {
    center: [opts.center.lat, opts.center.lng],
    zoom: 12,
    minZoom: 6,
    zoomControl: false,
    scrollWheelZoom: false,
    dragging: !L.Browser.mobile || opts.touchDrag
  });
  L.control.zoom({ position: opts.zoomControlPosition }).addTo(map);
  L.tileLayer(opts.tileUrl, { attribution: opts.attribution, maxZoom: opts.maxZoom }).addTo(map);
  var cluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 36,
    iconCreateFunction: function (group) {
      return L.divIcon({ html: "<div>" + group.getChildCount() + "</div>", className: "hn-cluster", iconSize: [38, 38] });
    }
  });
  map.addLayer(cluster);

  var placed = {};
  var selectedId = null;
  var fitted = false;
  function icon(item, active) {
    return L.divIcon({ className: "hn-price-wrap", html: active ? item.htmlActive : item.html, iconSize: [0, 0] });
  }
  function setMarkers(list) {
    cluster.clearLayers();
    placed = {};
    var layers = [];
    list.forEach(function (item) {
      if (typeof item.lat !== "number" || typeof item.lng !== "number") return;
      var marker = L.marker([item.lat, item.lng], { icon: icon(item, item.id === selectedId), keyboard: true, title: item.label });
      marker.on("click", function () { send({ type: "select", id: item.id }); });
      placed[item.id] = { marker: marker, item: item };
      layers.push(marker);
    });
    cluster.addLayers(layers);
    if (!fitted && layers.length) {
      fitted = true;
      map.fitBounds(cluster.getBounds(), { padding: [40, 40], maxZoom: 14 });
    }
  }
  function select(id) {
    selectedId = id;
    Object.keys(placed).forEach(function (key) {
      placed[key].marker.setIcon(icon(placed[key].item, key === id));
      placed[key].marker.setZIndexOffset(key === id ? 1000 : 0);
    });
    if (id && placed[id]) map.panTo(placed[id].marker.getLatLng(), { animate: true, duration: 0.35 });
  }
  function receive(event) {
    var message;
    try { message = JSON.parse(event.data); } catch (e) { return; }
    if (!message || typeof message !== "object") return;
    if (message.type === "markers" && Array.isArray(message.markers)) {
      selectedId = message.selectedId || null;
      setMarkers(message.markers);
    } else if (message.type === "select") {
      select(message.id || null);
    }
  }
  // Android delivers the app's messages on document, iOS on window.
  document.addEventListener("message", receive);
  window.addEventListener("message", receive);
  window.addEventListener("resize", function () { map.invalidateSize(); });

  // The bridge is normally there before this runs; wait briefly if it is not.
  (function announce(tries) {
    if (window.ReactNativeWebView) send({ type: "ready" });
    else if (tries > 0) setTimeout(function () { announce(tries - 1); }, 50);
  })(40);
})();
`;

export function buildMapPage({
  touchDrag = false,
  zoomControlPosition = "topleft",
}: Pick<HomeMapCanvasProps, "touchDrag" | "zoomControlPosition">): string {
  const options = {
    center: DHAKA_CENTER,
    touchDrag,
    zoomControlPosition,
    tileUrl: MAP_TILE_URL,
    attribution: MAP_ATTRIBUTION,
    maxZoom: MAP_MAX_ZOOM,
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>${inStyle(LEAFLET_CSS)}</style>
<style>${inStyle(MARKERCLUSTER_CSS)}</style>
<style>${inStyle(MARKER_CSS)}
html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #E5E7EB; }
</style>
</head>
<body>
<div id="map"></div>
<script>window.__HN_MAP_OPTIONS__ = ${scriptJson(options)};</script>
<script>${inScript(LEAFLET_JS)}</script>
<script>${inScript(MARKERCLUSTER_JS)}</script>
<script>${inScript(PAGE_SCRIPT)}</script>
</body>
</html>`;
}
