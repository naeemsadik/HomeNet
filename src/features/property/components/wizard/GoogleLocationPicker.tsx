import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { LocateFixed, X } from "@/components/icons";
import { loadGoogleMaps, onGoogleMapsKeyRefused } from "@/lib/googleMapsLoader";
import { webPointer } from "@/theme";
import type { MapPoint } from "../../constants/areaCenters";
import { MAP_PIN_ZOOM } from "../../constants/map";
import { styles } from "../../screens/PropertyCreateWizard.styles";
import type { LocationPickerProps } from "./LocationPicker.types";
import { LOCATION_MESSAGES, PIN_SVG, round, sameSpot, zoomFor } from "./locationPickerShared";

/** The picker, on Google Maps: click to drop a pin, drag it, search a place, or use the device location. */
export function GoogleLocationPicker({
  value,
  openAt,
  onChange,
  onUnavailable,
}: LocationPickerProps & { /** Google could not be used; the caller shows the OpenStreetMap map instead. */ onUnavailable: () => void }) {
  const { lat: openLat, lng: openLng } = openAt;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  // Map event handlers outlive a render; they call whichever callbacks are current.
  const onChangeRef = useRef(onChange);
  const onUnavailableRef = useRef(onUnavailable);
  useEffect(() => {
    onChangeRef.current = onChange;
    onUnavailableRef.current = onUnavailable;
  });

  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  /** Puts the pin at a point, creating it if needed. Does not tell the form. */
  const showPin = useCallback((point: MapPoint) => {
    const map = mapRef.current;
    if (!map) return;
    if (markerRef.current) {
      markerRef.current.setPosition(point);
      return;
    }
    const marker = new google.maps.Marker({
      map,
      position: point,
      draggable: true,
      clickable: false,
      icon: {
        url: `data:image/svg+xml;utf8,${encodeURIComponent(PIN_SVG)}`,
        scaledSize: new google.maps.Size(36, 46),
        anchor: new google.maps.Point(18, 45),
      },
    });
    marker.addListener("dragend", () => {
      const at = marker.getPosition();
      if (!at) return;
      // Settle on the rounded value the form will hold, so the pin and the form agree exactly.
      const next = { lat: round(at.lat()), lng: round(at.lng()) };
      marker.setPosition(next);
      onChangeRef.current(next);
    });
    markerRef.current = marker;
  }, []);

  /** The owner chose a spot: pin it and tell the form. `recentre` also moves the view there. */
  const pickPoint = useCallback(
    (point: MapPoint, recentre = false) => {
      const map = mapRef.current;
      const next = { lat: round(point.lat), lng: round(point.lng) };
      showPin(next);
      if (recentre && map) {
        map.panTo(next);
        map.setZoom(Math.max(map.getZoom() ?? 0, MAP_PIN_ZOOM));
      }
      onChangeRef.current(next);
    },
    [showPin],
  );

  // Create the map once, and the place search above it.
  useEffect(() => {
    let cancelled = false;
    // A key Google refuses only after loading leaves a broken map and a place search
    // that errors on every keystroke: switch to the OpenStreetMap map instead.
    const stopListening = onGoogleMapsKeyRefused(() => {
      if (!cancelled) onUnavailableRef.current();
    });
    (async () => {
      try {
        await loadGoogleMaps();
        const { Map } = (await google.maps.importLibrary("maps")) as google.maps.MapsLibrary;
        if (cancelled || !hostRef.current) return;

        const start = value ?? openAt;
        const map = new Map(hostRef.current, {
          center: start,
          zoom: value ? MAP_PIN_ZOOM : zoomFor(openAt),
          minZoom: 6,
          clickableIcons: false,
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          gestureHandling: "greedy",
        });
        map.addListener("click", (event: google.maps.MapMouseEvent) => {
          if (event.latLng) pickPoint({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        });
        mapRef.current = map;
        if (value) showPin(value);
        setStatus("ready");

        // The place search is an extra: without Places the map still works.
        try {
          const { PlaceAutocompleteElement } = (await google.maps.importLibrary("places")) as google.maps.PlacesLibrary;
          if (cancelled || !searchRef.current) return;
          const search = new PlaceAutocompleteElement({ includedRegionCodes: ["bd"] });
          search.style.width = "100%";
          // Google's box turns black when the browser is in dark mode; the form is always light.
          search.style.colorScheme = "light";
          search.style.backgroundColor = "#FFFFFF";
          search.style.border = "1.2px solid rgba(11,26,23,0.12)";
          search.style.borderRadius = "16px";
          search.addEventListener("gmp-select", (async (event: { placePrediction: { toPlace: () => google.maps.places.Place } }) => {
            const place = event.placePrediction.toPlace();
            await place.fetchFields({ fields: ["location"] });
            if (place.location) pickPoint({ lat: place.location.lat(), lng: place.location.lng() }, true);
          }) as unknown as EventListener);
          searchRef.current.appendChild(search);
        } catch (error) {
          console.warn("GoogleLocationPicker: place search is unavailable", error);
        }
      } catch (error) {
        // Wrong key or referrer, an API not enabled, billing off, offline: use the OpenStreetMap map.
        console.error("GoogleLocationPicker: Google Maps could not load", error);
        if (!cancelled) onUnavailableRef.current();
      }
    })();

    return () => {
      cancelled = true;
      stopListening();
      markerRef.current?.setMap(null);
      markerRef.current = null;
      mapRef.current = null;
      if (searchRef.current) searchRef.current.replaceChildren();
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
      markerRef.current?.setMap(null);
      markerRef.current = null;
      return;
    }
    const current = markerRef.current?.getPosition();
    if (current && sameSpot({ lat: current.lat(), lng: current.lng() }, value)) return;
    showPin(value);
    map.panTo(value);
    map.setZoom(Math.max(map.getZoom() ?? 0, MAP_PIN_ZOOM));
  }, [value?.lat, value?.lng, status, showPin]); // eslint-disable-line react-hooks/exhaustive-deps

  // Choosing a different area re-centres the map, but never moves an existing pin.
  useEffect(() => {
    if (status !== "ready" || markerRef.current) return;
    const map = mapRef.current;
    if (!map) return;
    map.setCenter({ lat: openLat, lng: openLng });
    map.setZoom(zoomFor({ lat: openLat, lng: openLng }));
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
    markerRef.current?.setMap(null);
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

      <div ref={searchRef} style={{ width: "100%", marginBottom: 8 }} />

      <View style={styles.mapContainer}>
        <div
          aria-label="Map. Click or tap to place the pin."
          ref={hostRef}
          role="application"
          style={{ width: "100%", height: "100%", background: "#F4F6F5" }}
        />
        {status === "loading" ? <Text style={styles.mapStatus}>Loading map…</Text> : null}
      </View>

      <Text style={styles.formHelperText}>
        {notice ??
          (value
            ? "Drag the pin to fine-tune it."
            : "Search a place, or click the map to drop a pin on the exact spot.")}
      </Text>
    </View>
  );
}
