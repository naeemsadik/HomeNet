import { Camera, Trash2, Video } from "@/components/icons";
import { ActivityIndicator, Image, Pressable, Text, TextInput, View } from "react-native";
import { useTranslation } from "@/i18n";
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
  const { t } = useTranslation();
  const store = usePropertyWizardStore();

  return (
    <View style={styles.stepFormBody}>
      <Text style={styles.formLabel}>{t("wizard.media.imagesLabel")}</Text>
      <View style={styles.mediaGrid}>
        {store.media.filter((media) => media.mediaType === "image").map((media, idx) => (
          <View key={media.id} style={styles.mediaCard}>
            <Image source={{ uri: media.url }} style={styles.mediaImg} />
            {idx === 0 ? (
              <View style={styles.coverBadge}>
                <Text style={styles.coverBadgeText}>{t("wizard.media.coverBadge")}</Text>
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
          <Text style={styles.addMediaText}>{t("wizard.media.addImage")}</Text>
        </Pressable>
      </View>
      <Text style={styles.uploadHint}>{t("wizard.media.uploadHintImages")}</Text>

      <View style={{ marginTop: 16 }}>
        <Text style={styles.formLabel}>{t("wizard.media.videoLabel")}</Text>
        {store.media.filter((media) => media.mediaType === "video").map((media) => (
          <View key={media.id} style={styles.uploadedVideoRow}>
            <Video color="#04cf92" size={20} />
            <Text numberOfLines={1} selectable style={styles.uploadedVideoText}>{media.url}</Text>
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
          <Text style={styles.videoDropzoneText}>{t("wizard.media.uploadVideo")}</Text>
        </Pressable>
        <Text style={styles.uploadHint}>{t("wizard.media.uploadHintVideos")}</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>{t("wizard.media.virtualTourLabel")}</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="url"
          onChangeText={store.setVirtualTourUrl}
          placeholder={t("wizard.media.virtualTourPlaceholder")}
          placeholderTextColor="#899790"
          style={styles.formInput}
          value={store.virtualTourUrl}
        />
      </View>
    </View>
  );
}
