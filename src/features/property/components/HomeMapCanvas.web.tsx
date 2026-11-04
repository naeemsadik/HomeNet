// Leaflet and the cluster plugin's stylesheets are bundled, not loaded from a CDN: the site's
// Content-Security-Policy (vercel.json) only allows stylesheets and scripts from 'self'. Metro
// can't load CSS through a lazy import(), so these are static; the scripts load when the map mounts.
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import type { Map as LeafletMap, Marker, MarkerClusterGroup } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { MAP_ATTRIBUTION, MAP_MAX_ZOOM, MAP_TILE_URL } from "../constants/map";
import { DHAKA_CENTER } from "../constants/areaCenters";
import type { HomeMapCanvasProps, HomeMapMarker } from "./HomeMapCanvas.types";
import { MARKER_CSS, markerHtml } from "./HomeMapCanvas.markers";

type LeafletModule = typeof import("leaflet");

const STYLE_ID = "homenet-home-map-styles";

/** Inline <style> is allowed by style-src 'unsafe-inline'; added once per page. */
function ensureMarkerStyles() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = MARKER_CSS;
  document.head.appendChild(style);
}

/**
 * The home page's listings map (web). Leaflet runs in the page itself rather
 * than in a srcdoc iframe: an iframe inherits the page's CSP, which blocks the
 * inline script and CDN files such an iframe needs.
 *
 * Scrolling the page must keep working over the map, so the mouse wheel only
 * zooms after the map is clicked, and on touch screens one finger scrolls the
 * page while two fingers pan and zoom the map.
 */
export function HomeMapCanvas({
  markers,
  selectedId,
  onSelect,
  accessibilityLabel,
  touchDrag = false,
  zoomControlPosition = "topleft",
}: HomeMapCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const clusterRef = useRef<MarkerClusterGroup | null>(null);
  const markerRefs = useRef(new Map<string, { marker: Marker; item: HomeMapMarker }>());
  const fittedRef = useRef(false);
  const onSelectRef = useRef(onSelect);
  const selectedRef = useRef(selectedId);
  const [ready, setReady] = useState(false);
  // Read once when the map is created; these don't change for a mounted map.
  const optionsRef = useRef({ touchDrag, zoomControlPosition });

  // Leaflet's handlers outlive renders; they read the latest props through these refs.
  useEffect(() => {
    onSelectRef.current = onSelect;
    selectedRef.current = selectedId;
  });

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    const placed = markerRefs.current;
    (async () => {
      try {
        const leaflet = await import("leaflet");
        const L = ((leaflet as unknown as { default?: LeafletModule }).default ?? leaflet) as LeafletModule;
        // The cluster plugin extends the global `L` rather than importing Leaflet.
        (window as unknown as { L?: LeafletModule }).L = L;
        await import("leaflet.markercluster");
        if (cancelled || !hostRef.current) return;

        ensureMarkerStyles();
        const touch = L.Browser.mobile;
        const map = L.map(hostRef.current, {
          center: [DHAKA_CENTER.lat, DHAKA_CENTER.lng],
          zoom: 12,
          minZoom: 6,
          zoomControl: false,
          scrollWheelZoom: false,
          // One finger scrolls the page on phones; pinch still pans and zooms.
          dragging: !touch || optionsRef.current.touchDrag,
        });
        L.control.zoom({ position: optionsRef.current.zoomControlPosition }).addTo(map);
        L.tileLayer(MAP_TILE_URL, { attribution: MAP_ATTRIBUTION, maxZoom: MAP_MAX_ZOOM }).addTo(map);
        map.on("click focus", () => map.scrollWheelZoom.enable());
        map.on("mouseout blur", () => map.scrollWheelZoom.disable());

        const cluster = L.markerClusterGroup({
          showCoverageOnHover: false,
          maxClusterRadius: 36,
          iconCreateFunction: (group) =>
            L.divIcon({
              html: `<div>${group.getChildCount()}</div>`,
              className: "hn-cluster",
              iconSize: [38, 38],
            }),
        });
        map.addLayer(cluster);

        leafletRef.current = L;
        mapRef.current = map;
        clusterRef.current = cluster;
        requestAnimationFrame(() => map.invalidateSize());
        setReady(true);
      } catch (error) {
        console.error("HomeMapCanvas: the map could not load", error);
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      clusterRef.current = null;
      placed.clear();
    };
  }, []);

  // Swap the markers in place when the list or filter changes; the map keeps its view.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const cluster = clusterRef.current;
    if (!ready || !L || !map || !cluster) return;

    cluster.clearLayers();
    markerRefs.current.clear();
    const layers = markers.map((item) => {
      const marker = L.marker([item.lat, item.lng], {
        icon: L.divIcon({
          className: "hn-price-wrap",
          html: markerHtml(item, item.id === selectedRef.current),
          iconSize: [0, 0],
        }),
        keyboard: true,
        title: item.label,
      });
      marker.on("click", () => onSelectRef.current(item.id));
      markerRefs.current.set(item.id, { marker, item });
      return marker;
    });
    cluster.addLayers(layers);

    // Frame the listings the first time they arrive; later filter changes keep the user's view.
    if (!fittedRef.current && layers.length) {
      fittedRef.current = true;
      map.fitBounds(cluster.getBounds(), { padding: [40, 40], maxZoom: 14 });
    }
  }, [markers, ready]);

  // Highlight the selected pin and bring it into view.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map) return;
    markerRefs.current.forEach(({ marker, item }, id) => {
      marker.setIcon(
        L.divIcon({ className: "hn-price-wrap", html: markerHtml(item, id === selectedId), iconSize: [0, 0] }),
      );
      marker.setZIndexOffset(id === selectedId ? 1000 : 0);
    });
    const selected = selectedId ? markerRefs.current.get(selectedId) : undefined;
    if (selected) map.panTo(selected.marker.getLatLng(), { animate: true, duration: 0.35 });
  }, [selectedId, ready]);

  return (
    <div
      ref={hostRef}
      role="region"
      aria-label={accessibilityLabel}
      // isolation keeps Leaflet's panes (z-index 400+) under the preview card that floats over the map.
      style={{ width: "100%", height: "100%", background: "#E5E7EB", position: "relative", isolation: "isolate" }}
    />
  );
}
