import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { MessGenderPolicy } from "../types/mess";

/**
 * What a seeker picks once and keeps: their campus and who they are looking
 * with. Remembered on the device; when signed in, also saved to the account
 * (PUT /v1/me/seat-preferences, see useSeatPreferences).
 *
 * Every other filter lives in the URL, so a search can be shared.
 */
export interface MessFilterState {
  campusId: string | null;
  gender: MessGenderPolicy | null;
  setCampus: (campusId: string | null) => void;
  setGender: (gender: MessGenderPolicy | null) => void;
}

export const useMessFilterStore = create<MessFilterState>()(
  persist(
    (set) => ({
      campusId: null,
      gender: null,
      setCampus: (campusId) => set({ campusId }),
      setGender: (gender) => set({ gender }),
    }),
    {
      name: "homenet_mess_filters",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ campusId: state.campusId, gender: state.gender }),
    },
  ),
);
