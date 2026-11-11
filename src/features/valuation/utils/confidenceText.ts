import type { SupportedLanguage, TranslationKey } from "@/i18n";
import type { ConfidenceBasis } from "../types/valuationTypes";

/** Looks a key up and fills in {{placeholders}}. The app passes `t`, the service passes English. */
export type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

interface ReasonContext {
  areaName: string;
  purpose: "sale" | "rent";
  language: SupportedLanguage;
}

/** "October 2026": the month the listings were collected, always read in UTC so the month never slips. */
export function formatCollected(asOf: string, language: SupportedLanguage): string {
  const date = new Date(asOf);
  if (Number.isNaN(date.getTime())) return asOf;
  return date.toLocaleDateString(language === "bn" ? "bn-BD" : "en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * The sentence under the confidence badge, built from the structured basis so it
 * can be shown in either language. One place decides what is said.
 */
export function confidenceReasonText(basis: ConfidenceBasis, context: ReasonContext, tr: Translate): string {
  const area = context.areaName;
  const parts: string[] = [];

  switch (basis.kind) {
    case "listings":
      parts.push(
        tr(context.purpose === "rent" ? "valuation.reason.listingsRent" : "valuation.reason.listingsSale", {
          count: basis.listings ?? 0,
          area,
          date: formatCollected(basis.asOf ?? "", context.language),
        }),
      );
      if (basis.mostlyOneSite) parts.push(tr("valuation.reason.oneSite"));
      if (basis.estimatedYieldInput === "rent") parts.push(tr("valuation.reason.yieldRentEstimated"));
      if (basis.estimatedYieldInput === "sale") parts.push(tr("valuation.reason.yieldSaleEstimated"));
      break;
    case "apartmentsOnly":
      parts.push(tr("valuation.reason.apartmentsOnly", { area }));
      break;
    case "builtInRate":
      parts.push(tr("valuation.reason.builtInRate", { area }));
      break;
    default:
      parts.push(tr("valuation.reason.noData", { area }));
  }
  return parts.join(" ");
}
