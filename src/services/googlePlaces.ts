import { Platform } from "react-native";
import { GOOGLE_MAPS_API_KEY } from "@/lib/features";
import { loadGoogleMaps } from "@/lib/googleMapsLoader";
import type { GooglePlaceLike } from "@/lib/areaMatcher";

export interface PlaceAutocompleteItem {
  id: string;
  primaryText: string;
  secondaryText: string;
  resolvePlace: () => Promise<GooglePlaceLike | null>;
}

/**
 * Fetches Bangladesh-restricted place predictions via Google Maps Places API (New)
 * on web when a Google Maps key is configured. Fails softly to `[]` so the local
 * database + fuzzy matcher always remains usable offline or on restricted hosts.
 */
export async function fetchGooglePlaceSuggestions(
  query: string,
  city?: string | null,
): Promise<PlaceAutocompleteItem[]> {
  const trimmed = query.trim();
  if (Platform.OS !== "web" || !GOOGLE_MAPS_API_KEY || trimmed.length < 2) {
    return [];
  }

  try {
    await loadGoogleMaps();
    const placesLib = (await google.maps.importLibrary("places")) as google.maps.PlacesLibrary;

    if (!placesLib.AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
      return [];
    }

    const input = city && !trimmed.toLowerCase().includes(city.toLowerCase()) ? `${trimmed}, ${city}` : trimmed;
    const { suggestions = [] } = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input,
      includedRegionCodes: ["bd"],
    });

    return suggestions
      .map((s) => s.placePrediction)
      .filter((p): p is NonNullable<typeof p> => Boolean(p?.placeId))
      .slice(0, 5)
      .map((prediction) => ({
        id: prediction.placeId,
        primaryText: prediction.mainText?.text || prediction.text?.text || trimmed,
        secondaryText: prediction.secondaryText?.text || city || "Bangladesh",
        resolvePlace: async () => {
          const place = prediction.toPlace();
          await place.fetchFields({
            fields: ["location", "addressComponents", "formattedAddress", "displayName"],
          });
          return place as unknown as GooglePlaceLike;
        },
      }));
  } catch {
    return [];
  }
}
