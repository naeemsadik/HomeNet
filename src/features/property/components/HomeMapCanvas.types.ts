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
  /**
   * Let one finger pan the map on touch screens. Off by default so the page
   * keeps scrolling over an embedded map; a map that is the whole view turns it on.
   */
  touchDrag?: boolean;
  /** Where the zoom buttons sit. Defaults to Leaflet's top left. */
  zoomControlPosition?: "topleft" | "topright" | "bottomleft" | "bottomright";
}
