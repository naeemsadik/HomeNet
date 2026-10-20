import { useInstantValuationStore } from "../stores/useInstantValuationStore";

export function useInstantValuation() {
  const store = useInstantValuationStore();

  const isStep1Valid = Boolean(
    store.form.areaName.trim().length > 0 &&
    (store.form.roadOrBlock.trim().length > 0 || store.form.address.trim().length > 0)
  );

  const numericSize = parseFloat(store.form.sizeInput);
  const isStep2Valid = Boolean(
    !isNaN(numericSize) && numericSize > 0 && store.form.bedrooms >= 0 && store.form.bathrooms >= 0
  );

  const isStep3Valid = true; // Amenities are optional toggles

  return {
    ...store,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
  };
}
