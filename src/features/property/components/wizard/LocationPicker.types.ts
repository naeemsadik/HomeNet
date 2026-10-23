import type { MapPoint } from "../../constants/areaCenters";

export interface LocationPickerProps {
  /** The pin to show, or null for none. The map follows this when it changes from outside (typed coordinates). */
  value: MapPoint | null;
  /** Where to open the map while there is no pin. */
  openAt: MapPoint;
  /** The owner placed, moved or cleared the pin. */
  onChange: (next: MapPoint | null) => void;
}
