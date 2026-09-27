import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSavedProperties, saveProperty, unsaveProperty } from "@/services/propertyApi";
import { useAuthStore } from "@/stores/authStore";
import { queryClient } from "@/lib/queryClient";
import { showToast } from "@/lib/toast";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import type { Property } from "@/features/property/types/property";

/** Anything with an id (Property, PropertyDetail, a card) or the id itself. */
type SaveTarget = { id: string | number } | string | number;

export interface SavedState {
  savedIds: string[];
  isSaved: (id: string | number | undefined | null) => boolean;
  toggleSaved: (propertyOrId: SaveTarget) => Promise<boolean>;
  addSaved: (propertyOrId: SaveTarget) => Promise<void>;
  removeSaved: (id: string | number) => Promise<void>;
  setSavedIds: (ids: (string | number)[]) => void;
  syncGuestSaves: () => Promise<void>;
  clearSaved: () => void;
  // Deprecated backwards-compat methods (kept to prevent breaking callers, does not store entities)
  savedProperties?: Record<string, Property>;
  setSavedProperties: (properties: { id: string | number }[]) => void;
  getSavedList: () => Property[];
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
        // Older persisted state may hold numeric ids, so compare as strings.
        return savedIds.some((saved) => String(saved) === s);
      },

      toggleSaved: async (propertyOrId: SaveTarget) => {
        if (!propertyOrId) return false;
        const isObj = typeof propertyOrId === "object" && propertyOrId !== null;
        const id = String(isObj ? (propertyOrId as { id: string | number }).id : propertyOrId);
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
              // Roll back on failure. The heart flipping back is the user's
              // feedback; the log is for development only, so production
              // consoles stay clean.
              set({ savedIds: currentIds });
              if (__DEV__) console.error("[savedStore] Failed to unsave property on server, rolling back:", err);
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
              if (__DEV__) console.error("[savedStore] Failed to save property on server, rolling back:", err);
              return false;
            }
          }
          // Guest saves live only on this device. Said here, not per screen,
          // so every heart (cards, Browse, AI Finder, detail) behaves the same.
          showToast("Saved on this device. Sign in to sync your saves across devices.", {
            action: { label: "Sign in", onPress: () => useAuthModalStore.getState().open() },
          });
          return true;
        }
      },

      addSaved: async (propertyOrId: SaveTarget) => {
        if (!propertyOrId) return;
        const isObj = typeof propertyOrId === "object" && propertyOrId !== null;
        const id = String(isObj ? (propertyOrId as { id: string | number }).id : propertyOrId);
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
                if (__DEV__) console.warn(`[savedStore] Failed to sync guest property ${id}:`, err);
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
          if (__DEV__) console.error("[savedStore] Failed to fetch server saved properties during sync:", err);
        }
      },

      clearSaved: () => {
        set({ savedIds: [], savedProperties: {} });
        queryClient.removeQueries({ queryKey: ["properties", "saved"] });
      },

      setSavedProperties: (properties: { id: string | number }[]) => {
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
