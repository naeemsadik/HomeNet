import { usePropertyWizardStore } from "@/features/property/stores/propertyWizardStore";
import { useInstantValuationStore } from "../stores/useInstantValuationStore";
import type { ValuationResponseData } from "../types/valuationTypes";

const result = {
  estimatedValue: 31_500_000,
  estimatedValueFormatted: "BDT 3.15 Cr",
  estimatedMonthlyRent: 95_000,
  estimatedMonthlyRentFormatted: "BDT 95,000/mo",
} as ValuationResponseData;

function prefill(purpose: "sale" | "rent", over: Partial<ValuationResponseData> | null = {}) {
  const store = useInstantValuationStore;
  store.setState({
    form: { ...store.getState().form, purpose, areaName: "Gulshan", sizeInput: "1800", sizeUnit: "sqft" },
    result: over === null ? null : ({ ...result, ...over } as ValuationResponseData),
  });
  store.getState().prefillPropertyWizard();
  return usePropertyWizardStore.getState();
}

describe("listing a property from its valuation", () => {
  it("lists a sale at the estimated value", () => {
    const wizard = prefill("sale");
    expect(wizard.listingType).toBe("sale");
    expect(wizard.price).toBe("31500000");
    expect(wizard.description).toContain("Estimated market valuation: BDT 3.15 Cr.");
  });

  it("lists a rent at the estimated monthly rent, not at the sale value", () => {
    const wizard = prefill("rent");
    expect(wizard.listingType).toBe("rent");
    expect(wizard.price).toBe("95000");
    expect(wizard.description).toContain("Estimated monthly rent: BDT 95,000/mo.");
    expect(wizard.description).not.toContain("market valuation");
  });

  it("leaves a rent's price empty when there is no estimate, rather than a made-up sale price", () => {
    expect(prefill("rent", null).price).toBe("");
  });
});
