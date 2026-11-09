import { useState } from "react";
import { Linking, Platform } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/i18n";
import { openExternalUrl } from "@/lib/safeUrl";
import { SITE_URL } from "@/lib/seo";
import { toApiError } from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { contactLister } from "../api/messApi";
import type { ContactChannel } from "../types/mess";

const WHATSAPP_HOSTS = ["wa.me", "api.whatsapp.com"];

/** Only a WhatsApp link is opened from a WhatsApp reveal. */
export function isWhatsAppUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && WHATSAPP_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

/** Adds the prefilled message, unless the server already wrote one. */
export function withWhatsAppText(url: string, text: string): string {
  if (/[?&]text=/.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}text=${encodeURIComponent(text)}`;
}

/** The number in a wa.me link, to show when WhatsApp will not open. */
function phoneFromWhatsAppUrl(url: string): string | null {
  const match = /wa\.me\/(\d{6,15})/.exec(url) ?? /[?&]phone=(\d{6,15})/.exec(url);
  return match ? `+${match[1]}` : null;
}

/**
 * Revealing a lister's number (PRD D6): free, signed-in, logged and rate
 * limited by the API. Signed-out people get the sign-in prompt and the reveal
 * continues once they are in. A phone reveal dials on a phone and shows the
 * number everywhere; WhatsApp opens with a message naming the listing.
 */
export function useContactLister(listing: { id: string; title: string }, campusName: string | null) {
  const { t } = useTranslation();
  const { isPhone } = useResponsive();
  const [phone, setPhone] = useState<string | null>(null);
  const [pending, setPending] = useState<ContactChannel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reveal = async (channel: ContactChannel) => {
    setPending(channel);
    setError(null);
    try {
      const result = await contactLister(listing.id, channel);
      if (channel === "phone" && result.phone) {
        setPhone(result.phone);
        if (Platform.OS !== "web" || isPhone) void Linking.openURL(`tel:${result.phone}`).catch(() => undefined);
        return;
      }
      if (channel === "whatsapp" && result.whatsapp_url && isWhatsAppUrl(result.whatsapp_url)) {
        const message = [
          t("mess.contact.whatsappMessage", { title: listing.title, link: `${SITE_URL}/mess/${listing.id}` }),
          campusName ? t("mess.contact.whatsappCampus", { campus: campusName }) : "",
        ]
          .filter(Boolean)
          .join(" ");
        const number = phoneFromWhatsAppUrl(result.whatsapp_url);
        if (!openExternalUrl(withWhatsAppText(result.whatsapp_url, message)) && number) {
          setError(t("mess.contact.whatsappFailed", { phone: number }));
        }
        if (number) setPhone(number);
        return;
      }
      setError(t("mess.contact.failed"));
    } catch (raw) {
      const status = toApiError(raw).status;
      if (status === 401) {
        useAuthModalStore.getState().open(() => void reveal(channel));
        return;
      }
      setError(
        status === 429
          ? t("mess.contact.rateLimited")
          : status === 403
            ? t("mess.contact.verifiedOnly")
            : status === 400
              ? t("mess.contact.notAccepted")
              : t("mess.contact.failed"),
      );
    } finally {
      setPending(null);
    }
  };

  const contact = (channel: ContactChannel) => {
    if (pending) return;
    if (!useAuthStore.getState().user) {
      useAuthModalStore.getState().open(() => void reveal(channel));
      return;
    }
    void reveal(channel);
  };

  return { contact, phone, pending, error };
}
