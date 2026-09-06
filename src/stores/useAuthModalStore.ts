import { create } from "zustand";

interface AuthModalState {
  /** Whether the auth modal is currently visible. */
  visible: boolean;
  /** Optional callback invoked after a successful login or registration. */
  onSuccess?: () => void;
  /** Open the auth modal. Optionally pass a callback to run after successful auth. */
  open: (onSuccess?: () => void) => void;
  /** Close the auth modal and clear the callback. */
  close: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  visible: false,
  onSuccess: undefined,

  open: (onSuccess) => set({ visible: true, onSuccess }),
  close: () => set({ visible: false, onSuccess: undefined }),
}));
