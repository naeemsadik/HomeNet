import type { Property } from "@/features/property/types/property";

/** Who is advertising a listing, ready to show on a card. */
export interface ListerDisplay {
  /** The company's name for a company, otherwise the person's own. */
  name: string;
  /** The company's logo for a company (then the person's photo), otherwise the photo. */
  logoUrl: string | null;
  isCompany: boolean;
}

type ListerUser = NonNullable<Property["user"]>;

/**
 * A company lister advertises under its own name and logo, the way an agent
 * does on Rightmove. An individual shows their own name and photo. A company
 * with no name set yet falls back to the person, so a card is never blank.
 */
export function listerDisplay(user: ListerUser | null | undefined, fallbackName: string): ListerDisplay {
  const company = user?.account_type === "company" && Boolean(user.company_name?.trim());
  if (company && user) {
    return {
      name: user.company_name!.trim(),
      logoUrl: user.company_logo_url || user.avatar_url || null,
      isCompany: true,
    };
  }
  return {
    name: user?.full_name?.trim() || fallbackName,
    logoUrl: user?.avatar_url ?? null,
    isCompany: false,
  };
}

/**
 * The number to ring: the one the owner put on the listing, else the one on
 * their account.
 */
export function contactPhone(property: Pick<Property, "phone" | "user">): string | null {
  const own = property.phone?.find((p) => p?.trim());
  if (own) return own.trim();
  return property.user?.auth_identities?.find((id) => id.phone)?.phone ?? null;
}

/**
 * A phone number in the international form WhatsApp needs, +880 for Bangladesh.
 * "01711000000" → "+8801711000000"; "00880 1711 000000" → "+8801711000000".
 * The one rule for saving a WhatsApp number and for building a link to one.
 */
export function toWhatsAppFormat(phone: string): string {
  let cleaned = phone.trim().replace(/[\s\-().]/g, "");
  if (!cleaned) return "";
  // 00 is the dialling prefix for "international" ("00880…"), the same as "+".
  if (cleaned.startsWith("00")) cleaned = `+${cleaned.slice(2)}`;
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("880")) return `+${cleaned}`;
  if (cleaned.startsWith("0") && cleaned.length >= 10) return `+880${cleaned.slice(1)}`;
  if (/^1[3-9]\d{8}$/.test(cleaned)) return `+880${cleaned}`;
  return cleaned;
}

/** A wa.me link for a WhatsApp number, or null when it has too few digits to be one. */
export function whatsappUrl(number: string | null | undefined, message?: string): string | null {
  const digits = toWhatsAppFormat(number ?? "").replace(/\D/g, "");
  if (digits.length < 7) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
