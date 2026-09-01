import { create } from "zustand";
import { savedPropertyIds } from "@/data/properties";

interface SavedState {
  savedIds: Array<string | number>;
  toggleSaved: (id: string | number) => void;
  isSaved: (id: string | number) => boolean;
  addSaved: (id: string | number) => void;
  removeSaved: (id: string | number) => void;
}

export const useSavedStore = create<SavedState>((set, get) => ({
  savedIds: savedPropertyIds,

  toggleSaved: (id: string | number) => {
    set((state) => {
      const exists = state.savedIds.includes(id);
      return {
        savedIds: exists
          ? state.savedIds.filter((item) => item !== id)
          : [...state.savedIds, id],
      };
    });
  },

  isSaved: (id: string | number) => {
    return get().savedIds.includes(id);
  },

  addSaved: (id: string | number) => {
    set((state) => ({
      savedIds: state.savedIds.includes(id)
        ? state.savedIds
        : [...state.savedIds, id],
    }));
  },

  removeSaved: (id: string | number) => {
    set((state) => ({
      savedIds: state.savedIds.filter((item) => item !== id),
    }));
  },
}));
