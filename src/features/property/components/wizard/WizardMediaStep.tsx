import { Camera, Trash2, Video } from "lucide-react-native";
import { ActivityIndicator, Image, Pressable, Text, TextInput, View } from "react-native";
import { webPointer } from "@/theme";
import { usePropertyWizardStore } from "../../stores/propertyWizardStore";
import { styles } from "../../screens/PropertyCreateWizard.styles";

type WizardMediaStepProps = {
  isUploading: boolean;
  onPickMedia: (mediaType: "image" | "video") => Promise<void>;
  onDeleteMedia: (mediaId: string) => Promise<void>;
};

/** Step 4: photos and video. */
export function WizardMediaStep({ isUploading, onPickMedia, onDeleteMedia }: WizardMediaStepProps) {
  const store = usePropertyWizardStore();

  return (
    <View style={styles.stepFormBody}>
      <Text style={styles.formLabel}>Property images</Text>
      <View style={styles.mediaGrid}>
        {store.media.filter((media) => media.mediaType === "image").map((media, idx) => (
          <View key={media.id} style={styles.mediaCard}>
            <Image source={{ uri: media.url }} style={styles.mediaImg} />
            {idx === 0 ? (
              <View style={styles.coverBadge}>
                <Text style={styles.coverBadgeText}>Cover</Text>
              </View>
            ) : null}
            <Pressable onPress={() => void onDeleteMedia(media.id)} style={styles.removeMediaButton}>
              <Trash2 color="#FFFFFF" size={14} />
            </Pressable>
          </View>
        ))}

        <Pressable
          disabled={isUploading}
          onPress={() => void onPickMedia("image")}
          style={({ pressed }) => [styles.addMediaCard, webPointer, pressed && styles.pressed]}
        >
          {isUploading ? (
            <ActivityIndicator color="#04cf92" />
          ) : (
            <Camera color="#5C6B66" size={28} />
          )}
          <Text style={styles.addMediaText}>Add image</Text>
        </Pressable>
      </View>
      <Text style={styles.uploadHint}>JPEG, PNG, or WebP. Up to 20 images, 10 MB each.</Text>

      <View style={{ marginTop: 16 }}>
        <Text style={styles.formLabel}>Property video (optional)</Text>
        {store.media.filter((media) => media.mediaType === "video").map((media) => (
          <View key={media.id} style={styles.uploadedVideoRow}>
            <Video color="#04cf92" size={20} />
            <Text numberOfLines={1} style={styles.uploadedVideoText}>{media.url}</Text>
            <Pressable onPress={() => void onDeleteMedia(media.id)}>
              <Trash2 color="#D4183D" size={17} />
            </Pressable>
          </View>
        ))}
        <Pressable
          disabled={isUploading}
          onPress={() => void onPickMedia("video")}
          style={styles.videoDropzone}
        >
          <Video color="#5C6B66" size={24} />
          <Text style={styles.videoDropzoneText}>Upload a walkthrough video</Text>
        </Pressable>
        <Text style={styles.uploadHint}>MP4 or WebM. Up to 3 videos, 100 MB each.</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Virtual tour URL (optional)</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="url"
          onChangeText={store.setVirtualTourUrl}
          placeholder="https://example.com/virtual-tour"
          placeholderTextColor="#899790"
          style={styles.formInput}
          value={store.virtualTourUrl}
        />
      </View>
    </View>
  );
}
