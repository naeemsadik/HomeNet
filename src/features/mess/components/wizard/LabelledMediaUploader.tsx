import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera, Plus, X } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { cdnImage } from "@/lib/cloudinaryImage";
import type { UploadInput } from "@/services/upload";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { OPTIONAL_MEDIA_LABELS, REQUIRED_MEDIA_LABELS } from "../../constants/vocabulary";
import { useDeleteMessMedia, useUploadMessMedia } from "../../hooks/useMessMutations";
import type { MediaLabel, MessMedia } from "../../types/mess";

const MAX_PHOTOS = 20;

/** Opens the photo library and returns the picks as uploadable files. */
async function pickPhotos(limit: number): Promise<UploadInput[]> {
  // No permission request: the system photo picker needs none (see ImageUploader).
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: limit > 1,
    selectionLimit: Math.max(1, Math.min(limit, 5)),
    quality: 0.85,
  });
  if (result.canceled || !result.assets?.length) return [];
  return Promise.all(
    result.assets.map(async (asset): Promise<UploadInput> => {
      const name = asset.fileName || "photo.jpg";
      const type = asset.mimeType || "image/jpeg";
      if (typeof File === "undefined") return { uri: asset.uri, name, type };
      // Web: the picker hands back a blob: URL; upload the bytes.
      const blob = await (await fetch(asset.uri)).blob();
      return new File([blob], name, { type: blob.type || type });
    }),
  );
}

/**
 * Photos in labelled slots: room, washroom and building entrance are required,
 * the rest optional (PRD D8). Each photo uploads to the draft as soon as it is
 * picked, with its label.
 */
export function LabelledMediaUploader({
  propertyId,
  media,
  onChange,
  errors = {},
}: {
  propertyId: string;
  media: MessMedia[];
  onChange: (next: MessMedia[]) => void;
  errors?: Partial<Record<MediaLabel, string>>;
}) {
  const { t } = useTranslation();
  const upload = useUploadMessMedia();
  const remove = useDeleteMessMedia();
  const [busy, setBusy] = useState<MediaLabel | null>(null);
  const [failed, setFailed] = useState<MediaLabel | null>(null);

  const add = async (label: MediaLabel) => {
    if (busy) return;
    const files = await pickPhotos(MAX_PHOTOS - media.length);
    if (!files.length) return;
    setBusy(label);
    setFailed(null);
    let next = [...media];
    try {
      for (const file of files) {
        const saved = await upload.mutateAsync({ id: propertyId, file, label, displayOrder: next.length });
        next = [...next, saved];
        onChange(next);
      }
    } catch {
      setFailed(label);
    } finally {
      setBusy(null);
    }
  };

  const drop = async (item: MessMedia) => {
    onChange(media.filter((row) => row.id !== item.id));
    try {
      await remove.mutateAsync(item.id);
    } catch {
      onChange(media);
    }
  };

  const slot = (label: MediaLabel, required: boolean) => {
    const items = media.filter((item) => item.label === label);
    const labelText = t(`mess.mediaLabel.${label}`);
    return (
      <View key={label} style={styles.slot}>
        <Text style={styles.slotLabel}>
          {labelText}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
        <View style={styles.tiles}>
          {items.map((item) => (
            <View key={item.id} style={styles.tile}>
              <Image source={{ uri: cdnImage(item.url, 320) }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel={labelText} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t("mess.wizard.photos.remove")}: ${labelText}`}
                hitSlop={6}
                onPress={() => void drop(item)}
                style={[styles.removeButton, webPointer]}
              >
                <X size={14} color={colorTokens.surface} />
              </Pressable>
            </View>
          ))}
          {media.length < MAX_PHOTOS ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${items.length ? t("mess.wizard.photos.addMore") : t("mess.wizard.photos.add")}: ${labelText}`}
              disabled={busy !== null}
              onPress={() => void add(label)}
              style={[styles.tile, styles.addTile, errors[label] && styles.addTileError, webPointer]}
            >
              {busy === label ? (
                <>
                  <ActivityIndicator color={colorTokens.brand} />
                  <Text style={styles.addText}>{t("mess.wizard.photos.uploading")}</Text>
                </>
              ) : (
                <>
                  {items.length ? <Plus size={20} color={colorTokens.brandText} /> : <Camera size={20} color={colorTokens.brandText} />}
                  <Text style={styles.addText}>{items.length ? t("mess.wizard.photos.addMore") : t("mess.wizard.photos.add")}</Text>
                </>
              )}
            </Pressable>
          ) : null}
        </View>
        {failed === label ? <Text style={styles.error}>{t("mess.wizard.photos.uploadFailed")}</Text> : null}
        {errors[label] ? <Text style={styles.error}>{errors[label]}</Text> : null}
      </View>
    );
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.section}>{t("mess.wizard.photos.required")}</Text>
      <Text style={styles.hint}>{t("mess.wizard.photos.requiredHelp")}</Text>
      {REQUIRED_MEDIA_LABELS.map((label) => slot(label, true))}
      <Text style={[styles.section, styles.optional]}>{t("mess.wizard.photos.optional")}</Text>
      {OPTIONAL_MEDIA_LABELS.map((label) => slot(label, false))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  section: { fontFamily: fonts.headingBold, fontSize: 17, color: colorTokens.ink },
  optional: { marginTop: 8 },
  hint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colorTokens.muted, marginTop: -8 },
  slot: { gap: 8 },
  slotLabel: { fontFamily: fonts.semiBold, fontSize: 14, color: colorTokens.ink },
  required: { color: colorTokens.errorText },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile: { width: 112, height: 88, borderRadius: radius.md, overflow: "hidden", backgroundColor: colorTokens.surfaceSunken },
  addTile: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colorTokens.brandBorder,
    backgroundColor: colorTokens.surface,
  },
  addTileError: { borderColor: colorTokens.errorText },
  addText: { fontFamily: fonts.semiBold, fontSize: 12, color: colorTokens.brandText, textAlign: "center" },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: "rgba(11, 26, 23, 0.7)",
  },
  error: { fontFamily: fonts.medium, fontSize: 13, color: colorTokens.errorText },
});
