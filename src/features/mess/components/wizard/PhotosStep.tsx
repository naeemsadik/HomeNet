import { Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowUp, Phone } from "@/components/icons";
import { formatLocalizedNumber, useTranslation } from "@/i18n";
import { getUser } from "@/services/userApi";
import { useAuthStore } from "@/stores/authStore";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { SELECTABLE_CONTACT_CHANNELS } from "../../constants/vocabulary";
import type { ContactChannel, MediaLabel, MessMedia } from "../../types/mess";
import { MessChip } from "../MessChip";
import { FieldBlock, StepCard, ToggleRow, useWizardField } from "./fields";
import { LabelledMediaUploader } from "./LabelledMediaUploader";

/** The account's phone number, which Call and WhatsApp reveal (PRD 2.3.4, rule 6). */
function useAccountPhone() {
  const userId = useAuthStore((s) => s.user?.id);
  const profile = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => (await getUser(userId as string)).data,
    enabled: Boolean(userId),
  });
  return { loaded: profile.isSuccess, phone: profile.data?.auth_identities?.find((identity) => identity.phone)?.phone ?? null };
}

/** Step 5: labelled photos, and how students may contact the lister, in order (PRD D6, D8). */
export function PhotosStep({
  propertyId,
  media,
  onMediaChange,
  photoErrors,
}: {
  propertyId: string;
  media: MessMedia[];
  onMediaChange: (next: MessMedia[]) => void;
  photoErrors: Partial<Record<MediaLabel, string>>;
}) {
  const { t, language } = useTranslation();
  const channels = useWizardField("contact_channels");
  const verifiedOnly = useWizardField("verified_seekers_only");
  const { loaded, phone } = useAccountPhone();
  const needsPhone = channels.value.some((channel) => channel === "phone" || channel === "whatsapp");

  const ordered: ContactChannel[] = [...channels.value, ...SELECTABLE_CONTACT_CHANNELS.filter((channel) => !channels.value.includes(channel))];

  const toggle = (channel: ContactChannel) =>
    channels.onChange(channels.value.includes(channel) ? channels.value.filter((value) => value !== channel) : [...channels.value, channel]);

  const moveUp = (index: number) => {
    const next = [...channels.value];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    channels.onChange(next);
  };

  return (
    <>
      <StepCard>
        <LabelledMediaUploader propertyId={propertyId} media={media} onChange={onMediaChange} errors={photoErrors} />
      </StepCard>

      <StepCard>
        <FieldBlock label={t("mess.wizard.photos.contact")} hint={t("mess.wizard.photos.contactHelp")} error={channels.error}>
          <View style={styles.channels}>
            {ordered.map((channel) => {
              const position = channels.value.indexOf(channel);
              const on = position >= 0;
              const label = t(`mess.channel.${channel}`);
              return (
                <View key={channel} style={[styles.channelRow, on && styles.channelRowOn]}>
                  {on ? <Text style={styles.position}>{formatLocalizedNumber(position + 1, language)}</Text> : <View style={styles.positionEmpty} />}
                  <MessChip label={label} selected={on} onPress={() => toggle(channel)} style={styles.channelChip} />
                  {on && position > 0 ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t("mess.wizard.photos.moveUp", { channel: label })}
                      onPress={() => moveUp(position)}
                      style={[styles.moveUp, webPointer]}
                    >
                      <ArrowUp size={16} color={colorTokens.brandText} />
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        </FieldBlock>

        {needsPhone && loaded ? (
          phone ? (
            <View style={styles.phone}>
              <Phone size={16} color={colorTokens.brandText} />
              <Text style={styles.phoneText}>{t("mess.wizard.photos.phoneOnAccount", { phone })}</Text>
            </View>
          ) : (
            <View style={[styles.phone, styles.phoneMissing]}>
              <AlertCircle size={16} color={colorTokens.warningText} />
              <Text style={[styles.phoneText, styles.phoneMissingText]}>{t("mess.wizard.photos.phoneMissing")}</Text>
            </View>
          )
        ) : null}

        <ToggleRow label={t("mess.wizard.photos.verifiedOnly")} value={verifiedOnly.value} onChange={verifiedOnly.onChange} />
      </StepCard>
    </>
  );
}

const styles = StyleSheet.create({
  channels: { gap: 8 },
  channelRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 8, borderRadius: radius.md, borderWidth: 1, borderColor: colorTokens.border },
  channelRowOn: { borderColor: colorTokens.brandBorder },
  position: { width: 24, textAlign: "center", fontFamily: fonts.bold, fontSize: 15, color: colorTokens.brandText },
  positionEmpty: { width: 24 },
  channelChip: { flexShrink: 1 },
  moveUp: { marginLeft: "auto", width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: radius.pill },
  phone: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: radius.md, backgroundColor: colorTokens.brandSurface },
  phoneText: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colorTokens.brandText },
  phoneMissing: { backgroundColor: colorTokens.warningSurface },
  phoneMissingText: { color: colorTokens.warningText },
});
