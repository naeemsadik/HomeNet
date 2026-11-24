import { useMemo } from "react";
import { listingTitle } from "@/features/mess/components/SeatListingTools";
import type { MyMessListing } from "@/features/mess/types/mess";
import { formatTakaRange } from "@/features/mess/utils/format";
import {
  formatLocalizedNumber,
  isPriceOnRequest,
  priceOnRequestLabel,
  translateListingStatus,
  translatePropertyType,
  useTranslation,
  type SupportedLanguage,
} from "@/i18n";
import { cdnImage } from "@/lib/cloudinaryImage";
import { isMessSubtype, listingEditPath, listingPath } from "@/lib/listingPath";
import type { PropertyStatus } from "@/types/api";
import type { Property } from "../../types/property";
import { listingCover } from "../../utils/listingMedia";
import { listingTypeLabel, pricePeriodFor } from "../../utils/listingType";
import { listingTypeName } from "../../utils/typeName";
import { isSharedLiving, rowReadyToPublish, rowStatus, statusWording, type MyListingRow } from "../../utils/myListings";

export type StatusTone = "positive" | "review" | "negative" | "neutral" | "quiet";

/** What a table row or a phone card shows for one listing. */
export interface ListingView {
  row: MyListingRow;
  id: string;
  /** The listing page and the edit form: /mess for a seat listing, /property for the rest. */
  href: string;
  editHref: string;
  title: string;
  location: string;
  imageUrl?: string;
  /** Apartment, Duplex… or Mess, Seat share. */
  typeLabel: string;
  /** For Sale / For Rent, or the Shared living tag. */
  badge: string;
  sharedLiving: boolean;
  price: string;
  /** "all-in / month" after a seat listing's range. */
  priceSuffix?: string;
  status: PropertyStatus;
  readyToPublish: boolean;
  statusLabel: string;
  statusTone: StatusTone;
  isVerified: boolean;
  /** Present on a seat listing whose seat details loaded. */
  seat?: MyMessListing;
  /** Page views, when the API counted them (property rows). */
  views?: string;
  /** "Continue editing" for an unfinished seat listing, as the old seat screen said. */
  editLabel: string;
}

type T = ReturnType<typeof useTranslation>["t"];

/** The statuses the chip has words for. The API can send others ("changes_requested"). */
const WORDED_STATUSES: ReadonlySet<string> = new Set<PropertyStatus>(["draft", "pending", "active", "sold", "archived", "rejected"]);

export function useListingViews(rows: readonly MyListingRow[]): ListingView[] {
  const { t, language } = useTranslation();
  return useMemo(() => rows.map((row) => toView(row, t, language)), [rows, t, language]);
}

function toView(row: MyListingRow, t: T, language: SupportedLanguage): ListingView {
  const status = rowStatus(row);
  const wording = statusWording(row);
  const statusLabel =
    wording.kind === "ready"
      ? t("seller.readyToPublish")
      : wording.kind === "review"
        ? t("seller.inReview")
        : wording.kind === "notApproved"
          ? t("seller.notApproved")
          : !WORDED_STATUSES.has(wording.status)
            ? // A status with no words here: name it as the API does, not as a missing key.
              translateListingStatus(wording.status, language)
            : wording.kind === "seat"
              ? t(`mess.my.status.${wording.status}`)
              : t(`seller.filters.${wording.status}`);
  const statusTone: StatusTone =
    wording.kind === "ready" || status === "active"
      ? "positive"
      : wording.kind === "review"
        ? "review"
        : wording.kind === "notApproved"
          ? "negative"
          : status === "archived"
            ? "quiet"
            : "neutral";
  const common = {
    row,
    id: row.id,
    status,
    readyToPublish: rowReadyToPublish(row),
    statusLabel,
    statusTone,
    sharedLiving: isSharedLiving(row),
  };

  if (row.kind === "seat") {
    const { seat, property } = row;
    const ref = { id: seat.id, subtype: seat.subtype };
    const priced = seat.all_in_min > 0;
    return {
      ...common,
      href: listingPath(ref),
      editHref: listingEditPath(ref),
      title: listingTitle(seat, t),
      location: seat.area?.name || property?.address || t("seller.noLocation"),
      imageUrl: seat.cover?.url ? cdnImage(seat.cover.url, 240) : undefined,
      typeLabel: t(`mess.subtype.${seat.subtype}`),
      badge: t("mess.nav"),
      // A no-break space keeps each ৳ with its amount when the range wraps in a narrow column.
      price: priced ? formatTakaRange(seat.all_in_min, seat.all_in_max, language, t).replace(/৳ /g, "৳\u00a0") : t("seller.priceNotSet"),
      priceSuffix: priced ? t("mess.cost.perMonth") : undefined,
      isVerified: Boolean(property?.is_verified),
      seat,
      views: property ? formatLocalizedNumber(property.view_count || 0, language) : undefined,
      editLabel: status === "draft" ? t("mess.my.continue") : t("seller.actions.edit"),
    };
  }

  const p = row.property;
  const cover = listingCover(p.media) || p.media?.[0]?.url;
  return {
    ...common,
    href: listingPath(p),
    editHref: listingEditPath(p),
    title: p.title || t("seller.untitled"),
    location: [p.area?.name, (p.area as { city?: string } | null | undefined)?.city].filter(Boolean).join(", ") || p.address || t("seller.noLocation"),
    imageUrl: cover ? cdnImage(cover, 240) : undefined,
    typeLabel: row.sharedLiving ? messSubtypeLabel(p.subtype, t) : translatePropertyType(listingTypeName(p) ?? "", language),
    badge: row.sharedLiving ? t("mess.nav") : listingTypeLabel(p.listing_type),
    price: propertyPrice(p, language),
    isVerified: Boolean(p.is_verified),
    views: formatLocalizedNumber(p.view_count || 0, language),
    editLabel: t("seller.actions.edit"),
  };
}

function messSubtypeLabel(subtype: string | null, t: T): string {
  const key = subtype?.trim().toLowerCase();
  return isMessSubtype(key) ? t(`mess.subtype.${key as "mess" | "seat_share"}`) : "";
}

function propertyPrice(p: Property, language: SupportedLanguage): string {
  if (isPriceOnRequest(p.price)) return priceOnRequestLabel(language);
  const currency = p.price_currency === "BDT" ? "৳" : p.price_currency || "৳";
  const amount = typeof p.price === "number" ? p.price.toLocaleString("en-BD") : p.price;
  return `${currency} ${amount}${pricePeriodFor(p.listing_type)}`;
}
