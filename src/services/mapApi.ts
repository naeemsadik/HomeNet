import { z } from "@/lib/zod";
import apiClient from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { MapPoint } from "@/features/property/constants/areaCenters";
import { coordinateProblem } from "@/features/property/utils/coordinates";

const pointSchema = z.object({ lat: z.number().finite(), lng: z.number().finite() });

/**
 * Follows a short Google Maps link (maps.app.goo.gl/…) to the place it points at.
 * A browser can't: the redirect is cross-origin and unreadable. So the API does it.
 * Server contract: POST /v1/maps/resolve-link (docs/BACKEND_REQUIREMENTS.md §8).
 * Until that route exists this throws, and the form asks for the full address instead.
 */
export async function resolveMapLink(url: string): Promise<MapPoint> {
  const { data } = await apiClient.post<ApiResponse<unknown>>("/v1/maps/resolve-link", { url }, { timeout: 10_000 });
  const parsed = pointSchema.safeParse(data.data);
  if (!parsed.success || coordinateProblem(parsed.data.lat, parsed.data.lng) !== null) {
    throw new Error("The API returned a location that can't be used.");
  }
  return parsed.data;
}
