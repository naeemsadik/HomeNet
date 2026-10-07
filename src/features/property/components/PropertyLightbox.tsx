import { ChevronLeft, ChevronRight, X } from "@/components/icons";
import { useRef, type RefObject } from "react";
import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { webPointer } from "@/theme";
import { useTranslation, formatLocalizedNumber } from "@/i18n";
import { styles } from "../screens/PropertyDetailScreen.styles";

type PropertyLightboxProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  images: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  /** The screen scrolls this strip to keep the active photo in view. */
  thumbScrollRef: RefObject<ScrollView | null>;
};

/** Fullscreen gallery: swipe or arrow through the listing's photos. */
export function PropertyLightbox({
  visible,
  onClose,
  title,
  images,
  activeIndex,
  onSelect,
  onPrev,
  onNext,
  thumbScrollRef,
}: PropertyLightboxProps) {
  const { t, language } = useTranslation();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.lightboxBackdrop}>
        {/* Top Bar */}
        <View style={styles.lightboxHeader}>
          <View style={styles.lightboxTitleArea}>
            <Text style={styles.lightboxTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.lightboxSubtitle}>
              {t("propertyDetail.photoOf", {
                current: formatLocalizedNumber(activeIndex + 1, language),
                total: formatLocalizedNumber(images.length, language),
              })}
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.lightboxCloseBtn, webPointer, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={t("propertyDetail.closeGallery")}
          >
            <X color="#FFFFFF" size={22} />
          </Pressable>
        </View>

        {/* Center Main High-Res Image Viewport */}
        <View
          style={styles.lightboxMainArea}
          onTouchStart={(e) => {
            touchStartX.current = e.nativeEvent.pageX;
            touchStartY.current = e.nativeEvent.pageY;
          }}
          onTouchEnd={(e) => {
            const dx = touchStartX.current - e.nativeEvent.pageX;
            const dy = touchStartY.current - e.nativeEvent.pageY;
            if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
              if (dx > 0) {
                onNext();
              } else {
                onPrev();
              }
            }
          }}
        >
          {activeIndex > 0 ? (
            <Pressable
              onPress={onPrev}
              style={({ pressed }) => [styles.lightboxNavBtn, styles.lightboxNavBtnLeft, webPointer, pressed && styles.pressed]}
              accessibilityLabel={t("propertyDetail.prevPhoto")}
            >
              <ChevronLeft color="#FFFFFF" size={28} />
            </Pressable>
          ) : null}

          <Image
            source={{ uri: images[activeIndex] || images[0] }}
            accessibilityLabel={`Photo ${activeIndex + 1} of ${images.length}`}
            style={styles.lightboxImage}
            resizeMode="contain"
          />

          {activeIndex < images.length - 1 ? (
            <Pressable
              onPress={onNext}
              style={({ pressed }) => [styles.lightboxNavBtn, styles.lightboxNavBtnRight, webPointer, pressed && styles.pressed]}
              accessibilityLabel={t("propertyDetail.nextPhoto")}
            >
              <ChevronRight color="#FFFFFF" size={28} />
            </Pressable>
          ) : null}
        </View>

        {/* Bottom Thumbnail Strip in Lightbox */}
        <View style={styles.lightboxThumbStrip}>
          <ScrollView
            ref={thumbScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.lightboxThumbScrollContent}
          >
            {images.map((img, idx) => (
              <Pressable
                key={idx}
                onPress={() => onSelect(idx)}
                style={[
                  styles.lightboxThumbCard,
                  activeIndex === idx ? styles.lightboxThumbCardActive : styles.thumbnailCardInactive,
                  webPointer,
                ]}
              >
                <Image source={{ uri: img }} accessibilityLabel={`Photo ${idx + 1}`} style={styles.thumbnailImg} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
