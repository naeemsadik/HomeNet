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
  openSignedIn(LIST_PROPERTY_PATH);
}

/** Where "List a vacant seat" leads: the mess listing wizard. */
export const LIST_SEAT_PATH = "/mess/create";

/** Starts listing a vacant mess seat, signing in first when needed. */
export function startSeatListing() {
  openSignedIn(LIST_SEAT_PATH);
}

function openSignedIn(path: string) {
  const open = () => router.push(path as never);
  if (useAuthStore.getState().user) open();
  else useAuthModalStore.getState().open(open);
}
