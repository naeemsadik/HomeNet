// Leaflet's stylesheet is injected via app/+html.tsx / <Head> to prevent Metro CSS asset import warnings.
// The script itself is loaded dynamically only when this step opens.
import type { Map as LeafletMap, Marker } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { LocateFixed, X } from "@/components/icons";
import { webPointer } from "@/theme";
import type { MapPoint } from "../../constants/areaCenters";
import { MAP_ATTRIBUTION, MAP_MAX_ZOOM, MAP_PIN_ZOOM, MAP_TILE_URL } from "../../constants/map";
import { styles } from "../../screens/PropertyCreateWizard.styles";
import { GOOGLE_MAPS_API_KEY } from "@/lib/features";
import { GoogleLocationPicker } from "./GoogleLocationPicker";
import type { LocationPickerProps } from "./LocationPicker.types";
import { LOCATION_MESSAGES, PIN_SVG, round, sameSpot, zoomFor } from "./locationPickerShared";

type LeafletModule = typeof import("leaflet");

/**
 * Pin-drop map for the listing wizard (web): Google Maps when a key is set and
 * Google accepts it, otherwise OpenStreetMap.
 */
export function LocationPicker(props: LocationPickerProps) {
  const [googleFailed, setGoogleFailed] = useState(false);
  if (GOOGLE_MAPS_API_KEY && !googleFailed) {
    return <GoogleLocationPicker {...props} onUnavailable={() => setGoogleFailed(true)} />;
  }
  return <LeafletLocationPicker {...props} />;
}

/**
 * The OpenStreetMap pin-drop map. Click or tap to place the pin, drag it to
 * adjust, or use the device location. Leaflet is loaded only when this step
 * opens, so it adds nothing to the rest of the app.
 */
function LeafletLocationPicker({ value, openAt, onChange }: LocationPickerProps) {
  const { lat: openLat, lng: openLng } = openAt;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  // Map event handlers outlive a render; they call whichever onChange is current.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  /** Puts the pin at a point, creating it if needed. Does not tell the form. */
  const showPin = useCallback((point: MapPoint) => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([point.lat, point.lng]);
      return;
    }
    const marker = L.marker([point.lat, point.lng], {
      draggable: true,
      keyboard: false,
      icon: L.divIcon({ html: PIN_SVG, className: "", iconSize: [36, 46], iconAnchor: [18, 45] }),
    }).addTo(map);
    marker.on("dragend", () => {
      const at = marker.getLatLng();
      // Settle on the rounded value the form will hold, so the pin and the form agree exactly.
      const next = { lat: round(at.lat), lng: round(at.lng) };
      marker.setLatLng([next.lat, next.lng]);
      onChangeRef.current(next);
    });
    markerRef.current = marker;
  }, []);

  /** The owner chose a spot: pin it and tell the form. `recentre` also moves the view there (device location). */
  const pickPoint = useCallback(
    (point: MapPoint, recentre = false) => {
      const map = mapRef.current;
      const next = { lat: round(point.lat), lng: round(point.lng) };
      showPin(next);
      if (recentre && map) map.setView([next.lat, next.lng], Math.max(map.getZoom(), MAP_PIN_ZOOM));
      onChangeRef.current(next);
    },
    [showPin],
  );

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const leaflet = await import("leaflet");
        const L = ((leaflet as unknown as { default?: LeafletModule }).default ?? leaflet) as LeafletModule;
        if (cancelled || !hostRef.current) return;

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const start = value ?? openAt;
        const map = L.map(hostRef.current, {
          center: [start.lat, start.lng],
          zoom: value ? MAP_PIN_ZOOM : zoomFor(openAt),
          minZoom: 6,
          zoomControl: true,
        });
        L.tileLayer(MAP_TILE_URL, { attribution: MAP_ATTRIBUTION, maxZoom: MAP_MAX_ZOOM }).addTo(map);
        map.on("click", (event) => pickPoint({ lat: event.latlng.lat, lng: event.latlng.lng }));

        leafletRef.current = L;
        mapRef.current = map;
        if (value) showPin(value);
        // The card has laid out by now; Leaflet needs to be told its real size.
        requestAnimationFrame(() => map.invalidateSize());
        setStatus("ready");
      } catch (error) {
        // The form still works without the map; say why it didn't load (silenced in production).
        console.error("LocationPicker: the map could not load", error);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // The map is created once; later changes arrive through the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Typed or pasted coordinates move the pin; clearing them removes it.
  useEffect(() => {
    if (status !== "ready") return;
    const map = mapRef.current;
    if (!map) return;
    if (!value) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    const current = markerRef.current?.getLatLng();
    if (current && sameSpot({ lat: current.lat, lng: current.lng }, value)) return;
    showPin(value);
    map.setView([value.lat, value.lng], Math.max(map.getZoom(), MAP_PIN_ZOOM));
  }, [value?.lat, value?.lng, status, showPin]); // eslint-disable-line react-hooks/exhaustive-deps

  // Choosing a different area re-centres the map, but never moves an existing pin.
  useEffect(() => {
    if (status !== "ready" || markerRef.current) return;
    mapRef.current?.setView([openLat, openLng], zoomFor({ lat: openLat, lng: openLng }));
  }, [openLat, openLng, status]);

  const useMyLocation = () => {
    setNotice(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setNotice("This browser can't share your location. Tap the map instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        pickPoint({ lat: position.coords.latitude, lng: position.coords.longitude }, true);
      },
      (error) => {
        setLocating(false);
        setNotice(LOCATION_MESSAGES[error.code] ?? LOCATION_MESSAGES[2]);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
    );
  };

  const clearPin = () => {
    markerRef.current?.remove();
    markerRef.current = null;
    setNotice(null);
    onChangeRef.current(null);
  };

  return (
    <View style={styles.formGroup}>
      <View style={styles.formLabelRow}>
        <Text style={styles.formLabel}>Pin the exact location</Text>
        <View style={styles.locationActions}>
          <Pressable
            accessibilityHint="Places the pin where this device is now"
            accessibilityLabel="Use my current location"
            accessibilityRole="button"
            disabled={locating || status !== "ready"}
            onPress={useMyLocation}
            style={[styles.subtypePill, webPointer]}
          >
            <LocateFixed color="#5C6B66" size={14} />
            <Text style={styles.subtypePillText}>{locating ? "Locating…" : "Use my location"}</Text>
          </Pressable>
          {value ? (
            <Pressable
              accessibilityLabel="Remove the pin"
              accessibilityRole="button"
              onPress={clearPin}
              style={[styles.subtypePill, webPointer]}
            >
              <X color="#5C6B66" size={14} />
              <Text style={styles.subtypePillText}>Clear</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.mapContainer}>
        <div
          aria-label="Map. Click or tap to place the pin."
          ref={hostRef}
          role="application"
          style={{ width: "100%", height: "100%", background: "#F4F6F5" }}
        />
        {status === "loading" ? <Text style={styles.mapStatus}>Loading map…</Text> : null}
        {status === "error" ? (
          <Text style={styles.mapStatus}>The map couldn't load. Paste a Google Maps link below instead.</Text>
        ) : null}
      </View>

      <Text style={styles.formHelperText}>
        {notice ??
          (value
            ? "Drag the pin to fine-tune it."
            : "Click or tap the map to drop a pin on the exact spot.")}
      </Text>
    </View>
  );
}
