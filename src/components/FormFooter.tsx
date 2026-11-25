import { Platform } from "react-native";
import { Footer } from "@/components/Footer";

/**
 * The footer under a create or edit form. The website keeps its footer there; the app ends the
 * form at its buttons, where a screen of site links only invited a tap that left the form.
 */
export function FormFooter() {
  return Platform.OS === "web" ? <Footer /> : null;
}
