import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  Plus,
  X,
  Star,
  Image as ImageIcon,
  Video,
} from "lucide-react-native";
import { colorTokens, fontTokens, webPointer } from "@/theme";
import { usePropertyWizardStore, type WizardMediaItem } from "../stores/propertyWizardStore";
import { useUploadMedia, useDeleteMedia } from "../hooks/usePropertyMutations";

export function WizardStepMedia() {
  const { propertyId, media, primaryMediaIndex, addMedia, removeMedia, setPrimaryMedia } =
    usePropertyWizardStore();
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();
  const [uploading, setUploading] = useState(false);

  const imageCount = media.filter((m) => m.url.includes("image") || !m.url.includes("video")).length;
  const videoCount = media.length - imageCount;

  const handlePickImage = async () => {
    if (!propertyId) {
      Alert.alert("Save first", "Please save the property basics before adding media.");
      return;
    }
    if (imageCount >= 20) {
      Alert.alert("Limit reached", "Maximum 20 images allowed.");
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow access to your photo library.");
      return;
    }

    const remaining = 20 - imageCount;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: Math.min(remaining, 5),
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.length) return;

    setUploading(true);
    try {
      for (const asset of result.assets) {
        let file: Blob | File | null = null;
        if (asset.uri) {
          const response = await fetch(asset.uri);
          file = await response.blob();
        }
        if (!file) continue;

        const uploadResult = await uploadMedia.mutateAsync({
          propertyId,
          file,
          type: "image",
        });

        if (uploadResult.data) {
          addMedia({
            id: `temp-${Date.now()}-${Math.random()}`,
            url: asset.uri,
            displayOrder: media.length,
          });
        }
      }
    } catch {
      Alert.alert("Upload failed", "Could not upload one or more images.");
    } finally {
      setUploading(false);
    }
  };

  const handlePickVideo = async () => {
    if (!propertyId) {
      Alert.alert("Save first", "Please save the property basics before adding media.");
      return;
    }
    if (videoCount >= 3) {
      Alert.alert("Limit reached", "Maximum 3 videos allowed.");
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow access to your photo library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      let file: Blob | File | null = null;
      if (asset.uri) {
        const response = await fetch(asset.uri);
        file = await response.blob();
      }
      if (!file) return;

      const uploadResult = await uploadMedia.mutateAsync({
        propertyId,
        file,
        type: "video",
      });

      if (uploadResult.data) {
        addMedia({
          id: `temp-${Date.now()}`,
          url: asset.uri,
          displayOrder: media.length,
        });
      }
    } catch {
      Alert.alert("Upload failed", "Could not upload the video.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (item: WizardMediaItem) => {
    Alert.alert("Remove media", "Remove this item from your listing?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          if (item.id.startsWith("temp-")) {
            removeMedia(item.id);
            return;
          }
          try {
            await deleteMedia.mutateAsync(item.id);
            removeMedia(item.id);
          } catch {
            Alert.alert("Error", "Could not delete media.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 2 of 3</Text>
        <Text style={styles.title}>Photos & Videos</Text>
        <Text style={styles.subtitle}>
          Add up to 20 images and 3 videos. Tap the star to set a primary photo.
        </Text>
      </View>

      {/* Upload Buttons */}
      <View style={styles.uploadRow}>
        <Pressable
          onPress={handlePickImage}
          disabled={uploading || imageCount >= 20}
          style={({ pressed }) => [
            styles.uploadBtn,
            (uploading || imageCount >= 20) && styles.uploadBtnDisabled,
            pressed && styles.pressed,
          ]}
          accessibilityLabel="Add photos"
        >
          {uploading ? (
            <ActivityIndicator color={colorTokens.primary} size={18} />
          ) : (
            <ImageIcon color={colorTokens.primary} size={20} />
          )}
          <Text style={styles.uploadBtnText}>
            {uploading ? "Uploading..." : "Add Photos"}
          </Text>
          <Text style={styles.uploadCount}>{imageCount}/20</Text>
        </Pressable>

        <Pressable
          onPress={handlePickVideo}
          disabled={uploading || videoCount >= 3}
          style={({ pressed }) => [
            styles.uploadBtn,
            (uploading || videoCount >= 3) && styles.uploadBtnDisabled,
            pressed && styles.pressed,
          ]}
          accessibilityLabel="Add video"
        >
          <Video color={colorTokens.verified} size={20} />
          <Text style={styles.uploadBtnText}>
            Add Video
          </Text>
          <Text style={styles.uploadCount}>{videoCount}/3</Text>
        </Pressable>
      </View>

      {/* Media Grid */}
      {media.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <ImageIcon color={colorTokens.textMuted} size={40} />
          </View>
          <Text style={styles.emptyTitle}>No media yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap "Add Photos" to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={media}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          scrollEnabled={false}
          renderItem={({ item, index }) => {
            const isPrimary = index === primaryMediaIndex;
            return (
              <View style={styles.thumbnailWrap}>
                <Image source={{ uri: item.url }} style={styles.thumbnail} />

                {/* Primary Star */}
                <Pressable
                  onPress={() => setPrimaryMedia(index)}
                  style={[styles.starBtn, isPrimary && styles.starBtnActive]}
                  accessibilityLabel={isPrimary ? "Primary photo" : "Set as primary photo"}
                >
                  <Star
                    color={isPrimary ? colorTokens.warning : colorTokens.textInverse}
                    fill={isPrimary ? colorTokens.warning : "transparent"}
                    size={14}
                  />
                </Pressable>

                {/* Delete */}
                <Pressable
                  onPress={() => handleDelete(item)}
                  style={styles.deleteBtn}
                  accessibilityLabel="Remove media"
                >
                  <X color={colorTokens.textInverse} size={12} />
                </Pressable>

                {/* Primary Badge */}
                {isPrimary ? (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>Primary</Text>
                  </View>
                ) : null}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    gap: 6,
  },
  header: {
    gap: 6,
    marginBottom: 12,
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: fontTokens.bold,
    color: colorTokens.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontFamily: fontTokens.extraBold,
    color: colorTokens.textPrimary,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fontTokens.regular,
    color: colorTokens.textSecondary,
    lineHeight: 18,
  },
  uploadRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  uploadBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colorTokens.primaryLight,
    borderWidth: 1.5,
    borderColor: "#C4E4D5",
  },
  uploadBtnDisabled: {
    opacity: 0.5,
  },
  uploadBtnText: {
    fontSize: 13,
    fontFamily: fontTokens.bold,
    color: colorTokens.primary,
  },
  uploadCount: {
    fontSize: 11,
    fontFamily: fontTokens.regular,
    color: colorTokens.textMuted,
  },
  pressed: {
    opacity: 0.8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 10,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.backgroundAlt,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: fontTokens.bold,
    color: colorTokens.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: fontTokens.regular,
    color: colorTokens.textMuted,
  },
  grid: {
    paddingBottom: 8,
  },
  gridRow: {
    gap: 8,
    marginBottom: 8,
  },
  thumbnailWrap: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    backgroundColor: colorTokens.backgroundAlt,
  },
  starBtn: {
    position: "absolute",
    bottom: 6,
    left: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  starBtnActive: {
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  deleteBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.error,
  },
  primaryBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colorTokens.warning,
  },
  primaryBadgeText: {
    fontSize: 8,
    fontFamily: fontTokens.bold,
    color: colorTokens.textInverse,
    textTransform: "uppercase",
  },
});
