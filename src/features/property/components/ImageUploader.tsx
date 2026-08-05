import React from "react";
import { View, Text, Pressable, ScrollView, Image, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, Trash2, Plus } from "lucide-react-native";
import { colorTokens, fonts } from "@/theme";

interface ImageUploaderProps {
  images: Array<{ uri: string; file?: Blob | File }>;
  onAdd: (images: Array<{ uri: string; file?: Blob | File }>) => void;
  onRemove: (index: number) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onAdd, onRemove, maxImages = 10 }: ImageUploaderProps) {
  const handlePick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow access to your photo library to upload images.");
      return;
    }

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      Alert.alert("Limit reached", `You can upload up to ${maxImages} images.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: Math.min(remaining, 5),
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.length) return;

    const newImages = await Promise.all(
      result.assets.map(async (asset) => {
        let file: Blob | File | undefined;
        if (asset.uri) {
          try {
            const response = await fetch(asset.uri);
            file = await response.blob();
            if ((globalThis as any).File && !(file instanceof (globalThis as any).File)) {
              file = new (globalThis as any).File([file], asset.fileName || "image.jpg", {
                type: file.type || "image/jpeg",
              });
            }
          } catch {
            // ignore
          }
        }
        return { uri: asset.uri, file };
      }),
    );

    onAdd(newImages);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Property Images</Text>
      <Text style={styles.hint}>Upload up to {maxImages} images ({images.length}/{maxImages})</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollArea}>
        <View style={styles.imageRow}>
          {images.map((img, index) => (
            <View key={`${img.uri}-${index}`} style={styles.imageWrap}>
              <Image source={{ uri: img.uri }} style={styles.image} />
              <Pressable
                onPress={() => onRemove(index)}
                style={styles.removeBtn}
                accessibilityLabel={`Remove image ${index + 1}`}
              >
                <Trash2 color={colorTokens.textInverse} size={14} />
              </Pressable>
            </View>
          ))}
          {images.length < maxImages ? (
            <Pressable
              onPress={handlePick}
              style={styles.addBtn}
              accessibilityLabel="Add images"
            >
              <Plus color={colorTokens.textMuted} size={24} />
              <Camera color={colorTokens.textMuted} size={16} />
              <Text style={styles.addBtnText}>Add</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colorTokens.textPrimary,
    marginBottom: 4,
  },
  hint: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colorTokens.textMuted,
    marginBottom: 10,
  },
  scrollArea: {
    marginBottom: 4,
  },
  imageRow: {
    flexDirection: "row",
    gap: 10,
  },
  imageWrap: {
    position: "relative",
    width: 110,
    height: 110,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colorTokens.divider,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  removeBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorTokens.error,
  },
  addBtn: {
    width: 110,
    height: 110,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colorTokens.divider,
    backgroundColor: colorTokens.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addBtnText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colorTokens.textMuted,
  },
});
