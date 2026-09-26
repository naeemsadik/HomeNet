import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveProperty, unsaveProperty } from "@/services/propertyApi";
import { useAuthStore } from "@/stores/authStore";
import type { Property } from "@/features/property/types/property";

export interface SavedState {
  savedIds: string[];
  savedProperties: Record<string, any>;
  isSaved: (id: string | number | undefined | null) => boolean;
  toggleSaved: (propertyOrId: Property | any) => Promise<boolean>;
  addSaved: (propertyOrId: Property | any) => Promise<void>;
  removeSaved: (id: string | number) => Promise<void>;
  setSavedProperties: (properties: any[]) => void;
  getSavedList: () => any[];
  clearSaved: () => void;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      savedIds: [],
      savedProperties: {},

      isSaved: (id: string | number | undefined | null) => {
        if (id === undefined || id === null) return false;
        const s = String(id);
        const { savedIds } = get();
        return savedIds.includes(s) || (typeof id === "number" && (savedIds as any[]).includes(id));
      },

      toggleSaved: async (propertyOrId: Property | string | number) => {
        if (!propertyOrId) return false;
        const isObj = typeof propertyOrId === "object" && propertyOrId !== null;
        const id = String(isObj ? (propertyOrId as Property).id : propertyOrId);
        if (!id) return false;

        const currentIds = get().savedIds;
        const isCurrentlySaved =
          currentIds.includes(id) ||
          (isObj && currentIds.includes(String((propertyOrId as any).id)));

        if (isCurrentlySaved) {
          // Unsave
          const nextProps = { ...get().savedProperties };
          delete nextProps[id];
          set({
            savedIds: currentIds.filter((item) => String(item) !== id),
            savedProperties: nextProps,
          });

          // Sync with server if logged in
          const user = useAuthStore.getState().user;
          if (user) {
            try {
              await unsaveProperty(id);
            } catch (err) {
              console.warn("Failed to unsave property on server:", err);
            }
          }
          return false;
        } else {
          // Save
          const nextProps = { ...get().savedProperties };
          if (isObj) {
            nextProps[id] = propertyOrId as Property;
          }
          set({
            savedIds: [...currentIds.filter((item) => String(item) !== id), id],
            savedProperties: nextProps,
          });

          // Sync with server if logged in
          const user = useAuthStore.getState().user;
          if (user) {
            try {
              await saveProperty(id);
            } catch (err) {
              console.warn("Failed to save property on server:", err);
            }
          }
          return true;
        }
      },

      addSaved: async (propertyOrId: Property | string | number) => {
        if (!propertyOrId) return;
        const isObj = typeof propertyOrId === "object" && propertyOrId !== null;
        const id = String(isObj ? (propertyOrId as Property).id : propertyOrId);
        if (!id) return;
        if (!get().isSaved(id)) {
          await get().toggleSaved(propertyOrId);
        }
      },

      removeSaved: async (id: string | number) => {
        if (!id) return;
        const idStr = String(id);
        if (get().isSaved(idStr)) {
          await get().toggleSaved(idStr);
        }
      },

      setSavedProperties: (properties: Property[]) => {
        if (!Array.isArray(properties)) return;
        const currentProps = { ...get().savedProperties };
        const idSet = new Set(get().savedIds.map(String));

        properties.forEach((p) => {
          if (p && p.id) {
            const idStr = String(p.id);
            idSet.add(idStr);
            currentProps[idStr] = p;
          }
        });

        set({
          savedIds: Array.from(idSet),
          savedProperties: currentProps,
        });
      },

      getSavedList: () => {
        const { savedIds, savedProperties } = get();
        return savedIds
          .map((id) => savedProperties[String(id)])
          .filter((p): p is any => Boolean(p && p.id));
      },

      clearSaved: () => {
        set({ savedIds: [], savedProperties: {} });
      },
    }),
    {
      name: "homenet_saved_properties",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        savedIds: state.savedIds,
        savedProperties: state.savedProperties,
      }),
    }
  )
);
