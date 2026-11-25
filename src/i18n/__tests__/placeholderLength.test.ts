import { bn } from "@/i18n/locales/bn";
import { en } from "@/i18n/locales/en";

/**
 * A hint in a one-line field must fit one line on a narrow phone: Android wraps a longer one
 * and cuts the second line in half, as the property title field did.
 */
const ONE_LINE_HINTS = [
  "filters.locationPlaceholder",
  "areaPicker.searchPlaceholder",
  "guides.archive.searchPlaceholder",
  "wizard.basics.titlePlaceholder",
  "wizard.basics.customSubtypePlaceholder",
  "search.placeholder",
  "hero.placeholders.buyRent",
];

const read = (locale: unknown, path: string) =>
  path.split(".").reduce((node, key) => (node as Record<string, unknown>)[key], locale) as string;

describe("one-line field hints", () => {
  it.each(ONE_LINE_HINTS)("%s is short enough in both languages", (path) => {
    for (const locale of [en, bn]) {
      expect(read(locale, path).length).toBeGreaterThan(0);
      expect(read(locale, path).length).toBeLessThanOrEqual(32);
    }
  });
});
