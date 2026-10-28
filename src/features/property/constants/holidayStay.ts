/**
 * What people see for a holiday stay. The stored value stays `short-let`: the API,
 * saved listings and the `?subtype=short-let` links all use it, so only the words
 * on screen change.
 *
 * Kept free of imports so any file (filters, adapters, tests) can use it without
 * pulling in the icon set.
 */
export const HOLIDAY_STAY_LABEL = "Holiday stay";

const squash = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/**
 * A listing's stored subtype as a person should read it. Only a holiday stay is
 * renamed; every other subtype is shown exactly as stored.
 */
export function displaySubtype(subtype: string | null | undefined): string {
  if (!subtype) return "";
  return squash(subtype) === "shortlet" ? HOLIDAY_STAY_LABEL : subtype;
}
