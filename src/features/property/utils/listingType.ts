import { HOLIDAY_STAY_LABEL } from "../constants/holidayStay";

/**
 * The API stores `sale`, `rent` or `short_let`. A holiday stay is not a rental
 * by the month and not a sale, so it must not be shown as either.
 */
export type StoredListingType = "sale" | "rent" | "short_let" | string | null | undefined;

export const isHolidayStayType = (listingType: StoredListingType): boolean => listingType === "short_let";

/** English label for places that are not translated (the detail page, the owner's list). */
export function listingTypeLabel(listingType: StoredListingType): string {
  if (isHolidayStayType(listingType)) return HOLIDAY_STAY_LABEL;
  return listingType === "rent" ? "For Rent" : "For Sale";
}

/** The price suffix: rentals are per month. A holiday stay is quoted per night or per month, which the API does not record, so none is claimed. */
export const pricePeriodFor = (listingType: StoredListingType): string => (listingType === "rent" ? "/mo" : "");

/** What the listing is called when the owner creates it: a holiday stay is saved as `short_let`. */
export const storedListingTypeFor = (listingType: "sale" | "rent" | "short_let", subtype: string | undefined) =>
  subtype === "short-let" ? ("short_let" as const) : listingType;
