import { useInstantValuationStore, type ValuationFormState } from "../stores/useInstantValuationStore";

/**
 * Whether each step can go on. The area is the one thing the price cannot do
 * without; the size is the other. The road, the building name and the rooms are
 * optional: they appear on the report and do not change the estimate.
 */
export function stepValidity(form: Pick<ValuationFormState, "areaName" | "sizeInput">) {
  const numericSize = parseFloat(form.sizeInput);
  return {
    isStep1Valid: form.areaName.trim().length > 0,
    isStep2Valid: Number.isFinite(numericSize) && numericSize > 0,
    isStep3Valid: true, // Amenities and site answers are optional
  };
}

export function useInstantValuation() {
  const store = useInstantValuationStore();

  return {
    ...store,
    ...stepValidity(store.form),
  };
}
