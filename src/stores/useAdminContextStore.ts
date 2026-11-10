import { create } from "zustand";

/**
 * Whether staff have switched moderation on for the surface they are looking
 * at. Purely cosmetic: it decides what renders, never what is allowed. Every
 * mutation is authorised by the API against the bearer token.
 *
 * Deliberately not persisted. A moderation session that survived a reload
 * would arm the interface for someone who did not ask for it this time.
 */
interface AdminContextState {
  armed: boolean;
  arm: () => void;
  disarm: () => void;
  toggle: () => void;
  /** Called on navigation: arriving somewhere new always starts disarmed. */
  resetForRoute: () => void;
}

export const useAdminContextStore = create<AdminContextState>((set) => ({
  armed: false,
  arm: () => set({ armed: true }),
  disarm: () => set({ armed: false }),
  toggle: () => set((s) => ({ armed: !s.armed })),
  resetForRoute: () => set({ armed: false }),
}));

/** True only when staff have armed moderation on this surface. */
export const useIsModerating = () => useAdminContextStore((s) => s.armed);
