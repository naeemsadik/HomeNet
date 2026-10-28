import { router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";

/** Where "List your property" leads: the listing form, not the /sell marketing page. */
export const LIST_PROPERTY_PATH = "/property/create";

/**
 * Starts listing a property. Signed-in people go straight to the form; everyone
 * else gets the sign-in prompt first and lands on the form once they are in.
 */
export function startListing() {
  const open = () => router.push(LIST_PROPERTY_PATH as never);
  if (useAuthStore.getState().user) open();
  else useAuthModalStore.getState().open(open);
}
