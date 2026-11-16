import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { Phone, ShieldCheck } from "@/components/icons";
import { NoTranslateText } from "@/components/NoTranslateText";
import { WhatsAppIcon } from "@/features/property/components/WhatsAppIcon";
import { useTranslation } from "@/i18n";
import { useAuthStore } from "@/stores/authStore";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { useContactLister } from "../hooks/useContactLister";
import type { ContactChannel } from "../types/mess";

/** Channels this version can open. In-app chat is P1. */
const SUPPORTED: ContactChannel[] = ["phone", "whatsapp"];

/**
 * The lister's contact channels in their order: the first is the main button
 * (PRD D6). Free, behind sign-in, rate limited by the API.
 */
export function ContactChannelBar({
  listing,
  channels,
  verifiedOnly,
  campusName,
  variant = "card",
}: {
  listing: { id: string; title: string };
  channels: ContactChannel[];
  verifiedOnly: boolean;
  campusName: string | null;
  /** "floating": pinned over the page on phones; "card": in the side column. */
  variant?: "card" | "floating";
}) {
  const { t } = useTranslation();
  const signedIn = useAuthStore((s) => s.user !== null);
  const { contact, phone, pending, error } = useContactLister(listing, campusName);
  const usable = channels.filter((channel) => SUPPORTED.includes(channel));
  if (usable.length === 0) return null;

  return (
    <View style={[styles.wrap, variant === "floating" ? styles.floating : styles.card]}>
      {variant === "card" ? (
        <Text style={styles.title} accessibilityRole="header" aria-level={2}>
          {t("mess.contact.title")}
        </Text>
      ) : null}

      {phone ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t("mess.contact.callNumber", { phone })}
          onPress={() => void Linking.openURL(`tel:${phone}`).catch(() => undefined)}
          style={[styles.phoneRow, webPointer]}
        >
          <Phone size={18} color={colorTokens.brandText} />
          <NoTranslateText selectable style={styles.phone}>
            {phone}
          </NoTranslateText>
        </Pressable>
      ) : null}

      <View style={styles.buttons}>
        {usable.map((channel, index) => {
          const primary = index === 0;
          const busy = pending === channel;
          const fg = primary ? colorTokens.onBrand : colorTokens.ink;
          return (
            <Pressable
              key={channel}
              accessibilityRole="button"
              aria-busy={busy} aria-disabled={pending !== null}
              accessibilityLabel={t(`mess.channel.${channel}`)}
              disabled={pending !== null}
              onPress={() => contact(channel)}
              style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                styles.button,
                primary ? styles.primary : styles.secondary,
                hovered && (primary ? styles.primaryHovered : styles.secondaryHovered),
                pressed && styles.pressed,
                webPointer,
              ]}
            >
              {busy ? (
                <ActivityIndicator size="small" color={fg} />
              ) : channel === "phone" ? (
                <Phone size={17} color={fg} />
              ) : (
                <WhatsAppIcon size={17} color={primary ? colorTokens.onBrand : colorTokens.brandText} />
              )}
              <Text style={[styles.buttonText, { color: fg }]}>{t(`mess.channel.${channel}`)}</Text>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <Text accessibilityLiveRegion="polite" role="alert" style={styles.error}>
          {error}
        </Text>
      ) : pending ? (
        <Text accessibilityLiveRegion="polite" style={styles.note}>
          {t("mess.contact.revealing")}
        </Text>
      ) : !signedIn || verifiedOnly ? (
        <View style={styles.noteRow}>
          <ShieldCheck size={14} color={colorTokens.muted} />
          <Text style={styles.note}>{!signedIn ? t("mess.contact.free") : t("mess.contact.verifiedOnlyNote")}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  card: {
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colorTokens.border,
    backgroundColor: colorTokens.surface,
  },
  floating: {
    width: "92%",
    maxWidth: 560,
    padding: 12,
    borderRadius: radius.xl,
    backgroundColor: colorTokens.surface,
    borderWidth: 1,
    borderColor: colorTokens.border,
    ...Platform.select({
      web: { boxShadow: "0px 6px 24px rgba(11, 26, 23, 0.16)" } as ViewStyle,
      default: { elevation: 8, shadowColor: "#000", shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
    }),
  },
  title: { fontFamily: fonts.headingBold, fontSize: 17, color: colorTokens.ink },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 40 },
  phone: { fontFamily: fonts.bold, fontSize: 18, letterSpacing: 0.3, color: colorTokens.ink },
  buttons: { flexDirection: "row", gap: 8 },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
  },
  primary: { backgroundColor: colorTokens.brand },
  primaryHovered: { backgroundColor: colorTokens.brandHover },
  secondary: { backgroundColor: colorTokens.surface, borderWidth: 1, borderColor: colorTokens.brandBorder },
  secondaryHovered: { backgroundColor: colorTokens.brandSurface },
  pressed: { opacity: 0.85 },
  buttonText: { fontFamily: fonts.bold, fontSize: 15 },
  noteRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  note: { flexShrink: 1, fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colorTokens.muted },
  error: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colorTokens.errorText },
});
