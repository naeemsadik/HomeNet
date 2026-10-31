export type HomeMapMarkerVariant = "sale" | "rent" | "neutral";

export interface HomeMapMarker {
  id: string;
  lat: number;
  lng: number;
  /** Short price shown on the pin, already localized. */
  label: string;
  variant: HomeMapMarkerVariant;
}

export interface HomeMapCanvasProps {
  markers: HomeMapMarker[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Read out by screen readers for the map region. */
  accessibilityLabel: string;
}
