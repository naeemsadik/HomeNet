import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { MessListingForm, WizardStep } from "../utils/wizardForm";

/**
 * An unfinished new listing, kept on the device so a reload or a closed tab
 * resumes where the lister was. Editing an existing listing reads it from the
 * server instead and keeps nothing here.
 */
export interface MessWizardState {
  propertyId: string | null;
  step: WizardStep;
  values: MessListingForm | null;
  save: (patch: Partial<Pick<MessWizardState, "propertyId" | "step" | "values">>) => void;
  reset: () => void;
}

export const useMessWizardStore = create<MessWizardState>()(
  persist(
    (set) => ({
      propertyId: null,
      step: "place",
      values: null,
      save: (patch) => set(patch),
      reset: () => set({ propertyId: null, step: "place", values: null }),
    }),
    {
      name: "homenet_mess_wizard",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ propertyId: state.propertyId, step: state.step, values: state.values }),
    },
  ),
);
