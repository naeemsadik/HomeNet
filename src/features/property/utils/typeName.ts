import { displaySubtype } from "../constants/holidayStay";

/** "apartment_project" -> "Apartment Project", "flat-house" -> "Flat House". */
function titleCase(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * The kind of property, as a person reads it: the subtype if there is one,
 * else the type. Stored values are codes ("apartment_project"), which cards
 * showed as they were; a holiday stay keeps its own name.
 */
export function listingTypeName(property: { subtype?: string | null; type?: string | null }): string | null {
  if (property.subtype) return titleCase(displaySubtype(property.subtype));
  if (property.type) return titleCase(property.type);
  return null;
}

/**
 * The listing's address line: street address, then area and city, leaving out
 * a part an earlier one already names ("North Badda" covers "Badda").
 */
export function listingAddress(property: {
  address?: string | null;
  area?: { name?: string | null; city?: string | null } | null;
}): string | null {
  return (
    [property.address, property.area?.name, property.area?.city]
      .filter((part): part is string => Boolean(part && part.trim()))
      .filter((part, i, all) => !all.slice(0, i).some((earlier) => earlier.toLowerCase().includes(part.toLowerCase())))
      .join(", ") || null
  );
}
