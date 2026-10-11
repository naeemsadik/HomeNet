import { MapPin } from "@/components/icons";
import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { useAllAreas } from "@/hooks/useAllAreas";
import { useResponsive } from "@/hooks/useResponsive";
import { resolveMapLink } from "@/services/mapApi";
import { reverseGeocode, type GeocodedPlace } from "@/services/geocodeApi";
import { areaCenterFor, type MapPoint } from "../../constants/areaCenters";
import { usePropertyWizardStore } from "../../stores/propertyWizardStore";
import { coordinateProblem } from "../../utils/coordinates";
import { parseMapLink } from "../../utils/mapLink";
import { areaFromPlace, nearestArea } from "../../utils/placeFromPin";
import { styles } from "../../screens/PropertyCreateWizard.styles";
import { LocationPicker } from "./LocationPicker";

const ON_WEB = Platform.OS === "web";

/** Shown when a short link can't be followed, which stays true until the API can do it. */
const SHORT_LINK_HELP = ON_WEB
  ? "We can't open short links yet. Open the link, copy the full address from your browser's address bar and paste that, or tap the spot on the map."
  : "We can't open short links yet. Open the link, copy the full address from your browser's address bar and paste that.";

type LinkStatus = { kind: "idle" } | { kind: "reading" } | { kind: "ok" } | { kind: "error"; message: string };

/** What the lookup of the pin has done so far. */
type PlaceLookup = {
  status: "idle" | "looking" | "done" | "failed";
  /** Where the area came from, when the lookup set one. */
  areaFrom: "place" | "nearest" | null;
};

/**
 * Step 3: the exact spot, then the address and area.
 *
 * Owners never see or type coordinates: they tap the map, use their device
 * location, or paste a Google Maps link. Whichever they use, the address and
 * area are then filled in from the pin so they have nothing else to enter;
 * both stay editable, and an owner's own entry is never overwritten.
 */
export function WizardLocationStep({ onOpenAreaPicker }: { onOpenAreaPicker: () => void }) {
  const { isPhone } = useResponsive();
  const store = usePropertyWizardStore();
  const areas = useAllAreas();
  const areaItems = areas.data?.items;

  // Where the map opens: the chosen neighbourhood, else Dhaka.
  const openAt = areaCenterFor(store.areaId, store.areaName, areaItems ?? []);

  // The pin follows the form, but only for a usable pair.
  const pin: MapPoint | null =
    store.locationLat !== null &&
    store.locationLng !== null &&
    coordinateProblem(store.locationLat, store.locationLng) === null
      ? { lat: store.locationLat, lng: store.locationLng }
      : null;

  const [linkText, setLinkText] = useState("");
  const [link, setLink] = useState<LinkStatus>({ kind: "idle" });
  const latestLink = useRef(0);

  /** The pin was placed, dragged or cleared on the map, or read from a link. */
  const handlePick = (next: MapPoint | null) => {
    store.setLocation({ locationLat: next?.lat ?? null, locationLng: next?.lng ?? null });
  };

  /** `final` is true when the owner has left the box, so an unreadable link is worth an error. */
  const readLink = async (text: string, final: boolean) => {
    const attempt = ++latestLink.current;
    if (!text.trim()) return setLink({ kind: "idle" });

    const result = parseMapLink(text);
    if (result.kind === "point") {
      handlePick(result.point);
      return setLink({ kind: "ok" });
    }
    if (result.kind === "short") {
      setLink({ kind: "reading" });
      try {
        const point = await resolveMapLink(result.url);
        if (attempt !== latestLink.current) return; // the owner has typed something else since
        handlePick(point);
        setLink({ kind: "ok" });
      } catch {
        if (attempt === latestLink.current) setLink({ kind: "error", message: SHORT_LINK_HELP });
      }
      return;
    }
    // Half-typed text isn't an error yet.
    setLink(final ? { kind: "error", message: result.message } : { kind: "idle" });
  };

  // ── Filling the address and area from the pin ────────────────────────────────
  // What this step wrote itself, so that only its own values are ever replaced.
  const written = useRef<{ areaId: string | null; address: string | null }>({ areaId: null, address: null });
  const [auto, setAuto] = useState<{ areaId: string | null; address: string | null }>({ areaId: null, address: null });
  const [lookup, setLookup] = useState<PlaceLookup>({ status: "idle", areaFrom: null });
  const latestLookup = useRef(0);

  useEffect(() => {
    if (!pin) return;
    const attempt = ++latestLookup.current;
    // Wait for the pin to settle: dragging it around is one lookup, not dozens.
    const timer = setTimeout(() => {
      void (async () => {
        setLookup({ status: "looking", areaFrom: null });
        let place: GeocodedPlace | null = null;
        let failed = false;
        try {
          place = await reverseGeocode(pin);
        } catch {
          failed = true;
        }
        if (attempt !== latestLookup.current) return; // the pin has moved on

        const list = areaItems ?? [];
        const fromPlace = place ? areaFromPlace(place, list) : null;
        const area = fromPlace ?? nearestArea(pin, list);

        const current = usePropertyWizardStore.getState();
        const patch: { areaId?: string; areaName?: string; district?: string; address?: string } = {};
        // Fill a box only if it is empty or still holds what this step put there.
        if (area && (!current.areaId || current.areaId === written.current.areaId)) {
          patch.areaId = area.id;
          patch.areaName = area.name;
          patch.district = area.city ?? "";
          written.current.areaId = area.id;
        }
        if (place?.address && (!current.address.trim() || current.address === written.current.address)) {
          patch.address = place.address;
          written.current.address = place.address;
        }
        if (Object.keys(patch).length > 0) usePropertyWizardStore.getState().setLocation(patch);
        setAuto({ ...written.current });
        setLookup({ status: failed ? "failed" : "done", areaFrom: area ? (fromPlace ? "place" : "nearest") : null });
      })();
    }, 700);
    return () => clearTimeout(timer);
    // The pin's two numbers and the area list are what a lookup depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin?.lat, pin?.lng, areaItems]);

  // With no pin there is nothing to have looked up.
  const lookupNow: PlaceLookup = pin ? lookup : { status: "idle", areaFrom: null };
  const addressFilled = store.address.trim() !== "" && store.address === auto.address;
  const areaFilled = store.areaId !== "" && store.areaId === auto.areaId;
  const lookedUp = lookupNow.status === "done" || lookupNow.status === "failed";

  return (
    <View style={styles.stepFormBody}>
      <LocationPicker onChange={handlePick} openAt={openAt} value={pin} />

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>{ON_WEB ? "Or paste a Google Maps link" : "Paste a Google Maps link"}</Text>
        <TextInput
          accessibilityLabel="Google Maps link"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          onBlur={() => void readLink(linkText, true)}
          onChangeText={(text) => {
            setLinkText(text);
            void readLink(text, false);
          }}
          placeholder="https://maps.google.com/…"
          placeholderTextColor="#899790"
          style={styles.formInput}
          value={linkText}
        />
        {link.kind === "reading" ? <Text style={styles.formHelperText}>Reading your link…</Text> : null}
        {link.kind === "ok" ? (
          <Text style={styles.locationLinkOk}>
            {ON_WEB ? "Pin placed from your link. Drag it on the map to adjust." : "Location saved from your link."}
          </Text>
        ) : null}
        {link.kind === "error" ? <Text style={styles.locationLinkError}>{link.message}</Text> : null}
        {link.kind === "idle" ? (
          <Text style={styles.formHelperText}>
            In Google Maps, open the place, tap Share, copy the link and paste it here.
          </Text>
        ) : null}
        {!ON_WEB && pin && link.kind !== "ok" ? <Text style={styles.locationLinkOk}>Location saved.</Text> : null}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Property address</Text>
        <TextInput
          onChangeText={(v) => store.setLocation({ address: v })}
          placeholder="e.g. House 12, Road 45, Gulshan 2"
          placeholderTextColor="#899790"
          style={styles.formInput}
          value={store.address}
        />
        {lookupNow.status === "looking" ? (
          <Text style={styles.formHelperText}>Looking up the address from your pin…</Text>
        ) : addressFilled ? (
          <Text style={styles.locationLinkOk}>Filled in from your pin. Check it and add the house or flat number.</Text>
        ) : lookedUp && !store.address.trim() ? (
          <Text style={styles.formHelperText}>
            {lookupNow.status === "failed"
              ? "We couldn't look up the address. Please type it."
              : "We couldn't find an address for this spot. Please type it."}
          </Text>
        ) : null}
      </View>

      <View style={[styles.formRow, isPhone && styles.formRowPhone]}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.formLabel}>Area / Neighbourhood</Text>
          <Pressable
            onPress={onOpenAreaPicker}
            style={({ pressed }) => [styles.formInput, styles.areaPickerButton, pressed && styles.pressed]}
          >
            <MapPin color="#04cf92" size={17} />
            <Text style={[styles.areaPickerText, !store.areaId && styles.areaPickerPlaceholder]}>
              {store.areaId
                ? [store.areaName, store.district].filter(Boolean).join(", ")
                : "Select the area or neighbourhood"}
            </Text>
          </Pressable>
          {areaFilled ? (
            <Text style={styles.locationLinkOk}>
              {lookupNow.areaFrom === "nearest"
                ? "The listed area nearest your pin. Change it if that's wrong."
                : "Set from your pin. Change it if that's wrong."}
            </Text>
          ) : lookedUp && !store.areaId ? (
            <Text style={styles.formHelperText}>We couldn't tell the area from your pin. Choose the closest one.</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
