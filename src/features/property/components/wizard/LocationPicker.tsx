import type { LocationPickerProps } from "./LocationPicker.types";

/**
 * Native builds: no map yet. The location step offers the Google Maps link box
 * instead. The web build has the pin-drop map (LocationPicker.web.tsx); the
 * native one arrives with the Android build, where it can be tested on a device.
 */
export function LocationPicker(_props: LocationPickerProps) {
  return null;
}
