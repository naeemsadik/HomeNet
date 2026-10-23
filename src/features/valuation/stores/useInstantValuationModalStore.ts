import { create } from "zustand";
import type { ValuationPropertyType, ValuationPurpose } from "../types/valuationTypes";

interface InstantValuationModalStore {
  visible: boolean;
  initialArea?: string;
  initialPurpose?: ValuationPurpose;
  initialType?: ValuationPropertyType;
  open: (params?: { area?: string; purpose?: ValuationPurpose; type?: ValuationPropertyType }) => void;
  close: () => void;
}

export const useInstantValuationModalStore = create<InstantValuationModalStore>((set) => ({
  visible: false,
  initialArea: undefined,
  initialPurpose: undefined,
  initialType: undefined,
  open: (params) =>
    set({
      visible: true,
      initialArea: params?.area,
      initialPurpose: params?.purpose,
      initialType: params?.type,
    }),
  close: () =>
    set({
      visible: false,
      initialArea: undefined,
      initialPurpose: undefined,
      initialType: undefined,
    }),
}));
