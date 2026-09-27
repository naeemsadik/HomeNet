import { create } from "zustand";

/**
 * Non-blocking, transient feedback. Use `notify()` from `@/lib/alert` instead
 * when the user must acknowledge the message.
 */

export type ToastAction = {
  label: string;
  onPress: () => void;
};

type Toast = {
  id: number;
  message: string;
  action?: ToastAction;
};

type ToastOptions = {
  action?: ToastAction;
  /** Defaults to 4s, or 6s when the toast carries an action. */
  durationMs?: number;
};

interface ToastState {
  toast: Toast | null;
  show: (message: string, options?: ToastOptions) => void;
  dismiss: () => void;
}

let nextId = 1;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  toast: null,

  show: (message, options) => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ toast: { id: nextId++, message, action: options?.action } });
    const duration = options?.durationMs ?? (options?.action ? 6000 : 4000);
    hideTimer = setTimeout(() => set({ toast: null }), duration);
  },

  dismiss: () => {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = null;
    set({ toast: null });
  },
}));

/** Show a toast from anywhere — components, stores or plain helpers. */
export function showToast(message: string, options?: ToastOptions) {
  useToastStore.getState().show(message, options);
}
