import { create } from "zustand";

interface AiFinderModalState {
  visible: boolean;
  open: () => void;
  close: () => void;
}

export const useAiFinderModalStore = create<AiFinderModalState>((set) => ({
  visible: false,
  open: () => set({ visible: true }),
  close: () => set({ visible: false }),
}));
