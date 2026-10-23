import { MapPin } from "@/components/icons";
import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { useTranslation } from "@/i18n";
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
  const { t } = useTranslation();
  const { isPhone } = useResponsive();
  const store = usePropertyWizardStore();
  const areas = useAllAreas();
  const areaItems = areas.data?.items;

  const shortLinkHelp = ON_WEB
    ? t("wizard.location.linkHelpWeb")
    : t("wizard.location.linkHelpMobile");

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
        if (attempt === latestLink.current) setLink({ kind: "error", message: shortLinkHelp });
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
        <Text style={styles.formLabel}>{ON_WEB ? t("wizard.location.mapLinkWeb") : t("wizard.location.mapLinkMobile")}</Text>
        <TextInput
          accessibilityLabel={t("wizard.location.mapLinkAria")}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          onBlur={() => void readLink(linkText, true)}
          onChangeText={(text) => {
            setLinkText(text);
            void readLink(text, false);
          }}
          placeholder={t("wizard.location.mapLinkPlaceholder")}
          placeholderTextColor="#899790"
          style={styles.formInput}
          value={linkText}
        />
        {link.kind === "reading" ? <Text style={styles.formHelperText}>{t("wizard.location.readingLink")}</Text> : null}
        {link.kind === "ok" ? (
          <Text style={styles.locationLinkOk}>
            {ON_WEB ? t("wizard.location.linkOkWeb") : t("wizard.location.linkOkMobile")}
          </Text>
        ) : null}
        {link.kind === "error" ? <Text style={styles.locationLinkError}>{link.message}</Text> : null}
        {link.kind === "idle" ? (
          <Text style={styles.formHelperText}>
            {t("wizard.location.linkIdleHelp")}
          </Text>
        ) : null}
        {!ON_WEB && pin && link.kind !== "ok" ? <Text style={styles.locationLinkOk}>{t("wizard.location.locationSaved")}</Text> : null}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>{t("wizard.location.addressLabel")}</Text>
        <TextInput
          onChangeText={(v) => store.setLocation({ address: v })}
          placeholder={t("wizard.location.addressPlaceholder")}
          placeholderTextColor="#899790"
          style={styles.formInput}
          value={store.address}
        />
        {lookupNow.status === "looking" ? (
          <Text style={styles.formHelperText}>{t("wizard.location.lookingUpAddress")}</Text>
        ) : addressFilled ? (
          <Text style={styles.locationLinkOk}>{t("wizard.location.addressFilled")}</Text>
        ) : lookedUp && !store.address.trim() ? (
          <Text style={styles.formHelperText}>
            {lookupNow.status === "failed"
              ? t("wizard.location.addressFailed")
              : t("wizard.location.addressNotFound")}
          </Text>
        ) : null}
      </View>

      <View style={[styles.formRow, isPhone && styles.formRowPhone]}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.formLabel}>{t("wizard.location.areaLabel")}</Text>
          <Pressable
            onPress={onOpenAreaPicker}
            style={({ pressed }) => [styles.formInput, styles.areaPickerButton, pressed && styles.pressed]}
          >
            <MapPin color="#04cf92" size={17} />
            <Text style={[styles.areaPickerText, !store.areaId && styles.areaPickerPlaceholder]}>
              {store.areaId
                ? [store.areaName, store.district].filter(Boolean).join(", ")
                : t("wizard.location.selectArea")}
            </Text>
          </Pressable>
          {areaFilled ? (
            <Text style={styles.locationLinkOk}>
              {lookupNow.areaFrom === "nearest"
                ? t("wizard.location.areaNearest")
                : t("wizard.location.areaFromPin")}
            </Text>
          ) : lookedUp && !store.areaId ? (
            <Text style={styles.formHelperText}>{t("wizard.location.areaUndetermined")}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
