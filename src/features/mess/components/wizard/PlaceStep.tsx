import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AreaPicker } from "@/components/AreaPicker";
import { ChevronDown, Footprints, MapPin, X } from "@/components/icons";
import { AppButton } from "@/components/ui";
import { areaCenterFor } from "@/features/property/constants/areaCenters";
import { LocationPicker } from "@/features/property/components/wizard/LocationPicker";
import { parseMapLink } from "@/features/property/utils/mapLink";
import { useAllAreas } from "@/hooks/useAllAreas";
import { formatLocalizedNumber, useTranslation } from "@/i18n";
import { resolveMapLink } from "@/services/mapApi";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { useUniversities } from "../../hooks/useUniversities";
import { nearestCampus } from "../../utils/geo";
import { FieldBlock, Segmented, StepCard, TextField, useWizardField } from "./fields";

/** Step 1: what it is, who it is for, and exactly where (PRD 3.3.1). */
export function PlaceStep() {
  const { t, language } = useTranslation();
  const subtype = useWizardField("subtype");
  const gender = useWizardField("gender_policy");
  const areaId = useWizardField("area_id");
  const areaName = useWizardField("area_name");
  const address = useWizardField("address");
  const location = useWizardField("location");
  const areas = useAllAreas();
  const universities = useUniversities();
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);
  const [link, setLink] = useState("");
  const [linkState, setLinkState] = useState<"idle" | "reading" | "failed">("idle");

  const areaItems = areas.data?.items ?? [];
  const selectedArea = areaItems.find((area) => area.id === areaId.value) ?? null;
  const openAt = areaCenterFor(areaId.value, areaName.value, areaItems);
  const nearest = location.value && universities.data ? nearestCampus(location.value, universities.data) : null;

  const applyLink = async () => {
    const parsed = parseMapLink(link);
    if (parsed.kind === "point") {
      location.onChange(parsed.point);
      setLink("");
      setLinkState("idle");
      return;
    }
    if (parsed.kind === "short") {
      setLinkState("reading");
      try {
        location.onChange(await resolveMapLink(parsed.url));
        setLink("");
        setLinkState("idle");
      } catch {
        setLinkState("failed");
      }
      return;
    }
    setLinkState("failed");
  };

  return (
    <StepCard>
      <FieldBlock label={t("mess.wizard.place.subtype")} hint={t(`mess.subtypeHelp.${subtype.value}`)} error={subtype.error}>
        <Segmented
          label={t("mess.wizard.place.subtype")}
          value={subtype.value}
          onChange={subtype.onChange}
          options={[
            { value: "mess", label: t("mess.subtype.mess") },
            { value: "seat_share", label: t("mess.subtype.seat_share") },
          ]}
        />
      </FieldBlock>

      <FieldBlock label={t("mess.wizard.place.gender")} error={gender.error}>
        <Segmented
          label={t("mess.wizard.place.gender")}
          value={gender.value}
          onChange={gender.onChange}
          options={[
            { value: "male", label: t("mess.gender.male") },
            { value: "female", label: t("mess.gender.female") },
          ]}
        />
      </FieldBlock>

      <FieldBlock label={t("mess.wizard.place.area")} error={areaId.error}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={areaName.value ? `${t("mess.wizard.place.area")}: ${areaName.value}` : t("mess.wizard.place.areaPlaceholder")}
          onPress={() => setAreaPickerOpen(true)}
          style={[styles.select, webPointer]}
        >
          <MapPin size={16} color={colorTokens.muted} />
          <Text style={[styles.selectText, !areaName.value && styles.placeholder]}>{areaName.value || t("mess.wizard.place.areaPlaceholder")}</Text>
          <ChevronDown size={16} color={colorTokens.muted} />
        </Pressable>
      </FieldBlock>

      <FieldBlock label={t("mess.wizard.place.address")} error={address.error}>
        <TextField
          label={t("mess.wizard.place.address")}
          value={address.value}
          onChange={address.onChange}
          placeholder={t("mess.wizard.place.addressPlaceholder")}
          maxLength={300}
        />
      </FieldBlock>

      <FieldBlock label={t("mess.wizard.place.pin")} hint={t("mess.wizard.place.pinHelp")} error={location.error}>
        {Platform.OS === "web" ? (
          <View style={styles.map}>
            <LocationPicker value={location.value} openAt={location.value ?? openAt} onChange={location.onChange} />
          </View>
        ) : null}
        {location.value ? (
          <View style={styles.pinRow}>
            <MapPin size={15} color={colorTokens.brandText} />
            <Text style={styles.pinText}>{t("mess.wizard.place.pinSet")}</Text>
            <Pressable accessibilityRole="button" onPress={() => location.onChange(null)} style={[styles.clearPin, webPointer]}>
              <X size={14} color={colorTokens.muted} />
              <Text style={styles.clearPinText}>{t("mess.wizard.place.clearPin")}</Text>
            </Pressable>
          </View>
        ) : null}
        <Text style={styles.linkLabel}>{t("mess.wizard.place.mapLink")}</Text>
        <View style={styles.linkRow}>
          <View style={styles.linkInput}>
            <TextField
              label={t("mess.wizard.place.mapLink")}
              value={link}
              onChange={(text) => {
                setLink(text);
                if (linkState === "failed") setLinkState("idle");
              }}
              placeholder={t("mess.wizard.place.mapLinkPlaceholder")}
            />
          </View>
          <AppButton
            label={linkState === "reading" ? t("mess.wizard.place.mapLinkReading") : t("mess.wizard.place.mapLinkUse")}
            loading={linkState === "reading"}
            disabled={!link.trim()}
            onPress={() => void applyLink()}
            variant="secondary"
          />
        </View>
        {linkState === "failed" ? <Text style={styles.error}>{t("mess.wizard.place.mapLinkFailed")}</Text> : null}
        {nearest ? (
          <View style={styles.walk}>
            <Footprints size={16} color={colorTokens.brandText} />
            <View style={styles.walkText}>
              <Text style={styles.walkTitle}>
                {t("mess.wizard.place.walkPreview", { minutes: formatLocalizedNumber(nearest.walking_min, language), campus: nearest.shortName })}
              </Text>
              <Text style={styles.walkNote}>{t("mess.wizard.place.walkPreviewNote")}</Text>
            </View>
          </View>
        ) : null}
      </FieldBlock>

      <AreaPicker
        visible={areaPickerOpen}
        onClose={() => setAreaPickerOpen(false)}
        selectedArea={selectedArea}
        initialCity={selectedArea?.city ?? "Dhaka"}
        onSelect={(area) => {
          if (!area) return;
          areaId.onChange(area.id);
          areaName.onChange(area.name);
          setAreaPickerOpen(false);
        }}
      />
    </StepCard>
  );
}

const styles = StyleSheet.create({
  select: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surfaceSunken,
  },
  selectText: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colorTokens.ink },
  placeholder: { color: colorTokens.subtle },
  map: { height: 320, borderRadius: radius.lg, overflow: "hidden", borderWidth: 1, borderColor: colorTokens.border },
  pinRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  pinText: { flex: 1, fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.brandText },
  clearPin: { flexDirection: "row", alignItems: "center", gap: 4, minHeight: 36 },
  clearPinText: { fontFamily: fonts.medium, fontSize: 13, color: colorTokens.muted },
  linkLabel: { fontFamily: fonts.medium, fontSize: 13, color: colorTokens.muted, marginTop: 4 },
  linkRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  linkInput: { flexGrow: 1, flexBasis: 240 },
  error: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colorTokens.errorText },
  walk: { flexDirection: "row", gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: colorTokens.brandSurface },
  walkText: { flex: 1, gap: 2 },
  walkTitle: { fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.brandText },
  walkNote: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colorTokens.body },
});
