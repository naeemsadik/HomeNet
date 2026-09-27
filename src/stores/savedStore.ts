import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSavedProperties, saveProperty, unsaveProperty } from "@/services/propertyApi";
import { useAuthStore } from "@/stores/authStore";
import { queryClient } from "@/lib/queryClient";
import type { Property } from "@/features/property/types/property";

export interface SavedState {
  savedIds: string[];
  isSaved: (id: string | number | undefined | null) => boolean;
  toggleSaved: (propertyOrId: Property | string | number | any) => Promise<boolean>;
  addSaved: (propertyOrId: Property | string | number | any) => Promise<void>;
  removeSaved: (id: string | number) => Promise<void>;
  setSavedIds: (ids: (string | number)[]) => void;
  syncGuestSaves: () => Promise<void>;
  clearSaved: () => void;
  // Deprecated backwards-compat methods (kept to prevent breaking callers, does not store entities)
  savedProperties?: Record<string, any>;
  setSavedProperties: (properties: (Property | any)[]) => void;
  getSavedList: () => any[];
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

      toggleSaved: async (propertyOrId: Property | string | number | any) => {
        if (!propertyOrId) return false;
        const isObj = typeof propertyOrId === "object" && propertyOrId !== null;
        const id = String(isObj ? (propertyOrId as Property).id : propertyOrId);
        if (!id) return false;

        const currentIds = get().savedIds.map(String);
        const isCurrentlySaved = currentIds.includes(id);
        const user = useAuthStore.getState().user;

        if (isCurrentlySaved) {
          // Optimistically unsave
          const nextIds = currentIds.filter((item) => item !== id);
          set({ savedIds: nextIds });

          if (user) {
            try {
              await unsaveProperty(id);
              queryClient.invalidateQueries({ queryKey: ["properties", "saved"] });
              return false;
            } catch (err) {
              // Roll back on failure
              set({ savedIds: currentIds });
              console.error("[savedStore] Failed to unsave property on server, rolling back:", err);
              return true;
            }
          }
          return false;
        } else {
          // Optimistically save
          const nextIds = Array.from(new Set([...currentIds, id]));
          set({ savedIds: nextIds });

          if (user) {
            try {
              await saveProperty(id);
              queryClient.invalidateQueries({ queryKey: ["properties", "saved"] });
              return true;
            } catch (err) {
              // Roll back on failure
              set({ savedIds: currentIds });
              console.error("[savedStore] Failed to save property on server, rolling back:", err);
              return false;
            }
          }
          return true;
        }
      },

      addSaved: async (propertyOrId: Property | string | number | any) => {
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

      setSavedIds: (ids: (string | number)[]) => {
        if (!Array.isArray(ids)) return;
        set({ savedIds: Array.from(new Set(ids.map(String))) });
      },

      syncGuestSaves: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const currentIds = get().savedIds.map(String);
        if (currentIds.length > 0) {
          // Sync all local/guest saves to server
          await Promise.allSettled(
            currentIds.map((id) =>
              saveProperty(id).catch((err) => {
                console.warn(`[savedStore] Failed to sync guest property ${id}:`, err);
              })
            )
          );
        }

        // Fetch latest saved properties from server to guarantee sync
        try {
          const res = await getSavedProperties();
          if (res?.data && Array.isArray(res.data)) {
            const serverIds = res.data.map((p) => String(p.id));
            set({ savedIds: serverIds });
          }
          queryClient.invalidateQueries({ queryKey: ["properties", "saved"] });
        } catch (err) {
          console.error("[savedStore] Failed to fetch server saved properties during sync:", err);
        }
      },

      clearSaved: () => {
        set({ savedIds: [], savedProperties: {} });
        queryClient.removeQueries({ queryKey: ["properties", "saved"] });
      },

      setSavedProperties: (properties: (Property | any)[]) => {
        if (!Array.isArray(properties)) return;
        const idSet = new Set(get().savedIds.map(String));
        properties.forEach((p) => {
          if (p && p.id) {
            idSet.add(String(p.id));
          }
        });
        set({ savedIds: Array.from(idSet) });
      },

      getSavedList: () => [],
    }),
    {
      name: "homenet_saved_properties",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        savedIds: state.savedIds,
      }),
    }
  )
);
