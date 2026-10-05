import { create } from "zustand";

interface AiFinderModalState {
  visible: boolean;
  /** What the seeker already typed in the search box, so the finder starts from it. */
  initialPrompt: string;
  open: (initialPrompt?: string) => void;
  close: () => void;
}

export const useAiFinderModalStore = create<AiFinderModalState>((set) => ({
  visible: false,
  initialPrompt: "",
  open: (initialPrompt = "") => set({ visible: true, initialPrompt }),
  close: () => set({ visible: false }),
}));
