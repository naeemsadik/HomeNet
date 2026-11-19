import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/services/apiClient";
import { getAdminPropertyById, getMyPropertyById, getProperties, getPropertyById } from "@/services/propertyApi";
import type { ApiResponse } from "@/types/api";
import type { Property } from "../types/property";
import { hasPermission } from "@/lib/permissions";
import { useAuthStore } from "@/stores/authStore";
import { isMessSubtype } from "@/lib/listingPath";

export interface PropertyDetailArea {
  id: string;
  name: string;
  city: string;
  parent: { id: string; name: string } | null;
}

export interface PropertyDetailUser {
  id: string;
  full_name: string;
  avatar_url: string | null;
  account_type?: "individual" | "company";
  company_name?: string | null;
  company_logo_url?: string | null;
  auth_identities: { email: string | null; phone: string | null }[];
}

export interface PropertyDetailMedia {
  id: string;
  media_type: "image" | "video";
  url: string;
  thumbnail_url: string | null;
  display_order: number;
}

export interface PropertyDetail {
  id: string;
  title: string;
  description: string | null;
  type: "residential" | "commercial" | "land" | "parking";
  subtype: string | null;
  listing_type: "sale" | "rent" | "short_let";
  price: number;
  price_currency: string;
  area_size: number | null;
  area_unit: string | null;
  location_lat: number | null;
  location_lng: number | null;
  address: string | null;
  /** Numbers the owner put on the listing, first one first. */
  phone?: string[];
  whatsapp_number?: string | null;
  amenities: Record<string, unknown> | null;
  status: "draft" | "active" | "pending" | "sold" | "archived";
  is_verified: boolean;
  virtual_tour_url: string | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  area: PropertyDetailArea | null;
  user: PropertyDetailUser | null;
  media: PropertyDetailMedia[];
  _count: { media: number };
}

const HYDRATION_WAIT_MS = 5_000;

/** The session is read from storage once at start-up; a listing opened by link can ask before that is done. */
function waitForSession(): Promise<void> {
  if (useAuthStore.getState().hydrated) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(done, HYDRATION_WAIT_MS);
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.hydrated) done();
    });
    function done() {
      clearTimeout(timer);
      unsubscribe();
      resolve();
    }
  });
}

const isStatus = (error: unknown, ...statuses: number[]) =>
  error instanceof ApiError && error.status !== null && statuses.includes(error.status);

/** The API's listing payload, typed as the screen that reads it expects. */
const unwrap = <T,>(response: ApiResponse<Property>): T => {
  if (!response.data) throw new Error(response.message || "Property not found");
  return response.data as unknown as T;
};

/**
 * The listing as its viewer may see it. The public route answers "not found"
 * for a listing that is pending, a draft or archived, so its owner and staff
 * would see the same dead end as everyone else. When the public route says
 * not found and someone is signed in, ask for their own copy, then (for staff
 * with manage_properties) any copy. If none opens it, the public error stands.
 * Any other failure (a 500, no connection) is not a missing listing and is
 * passed on as it is.
 *
 * `knownNonPublic` is for a listing already seen as pending or a draft (a
 * refresh of a listing in review): its own copy is asked for first, and the
 * public route only if that fails, as the listing may have gone live.
 */
export async function fetchPropertyForViewer<T = Property>(
  id: string,
  { knownNonPublic = false }: { knownNonPublic?: boolean } = {},
): Promise<T> {
  const readPublic = async () => unwrap<T>(await getPropertyById(id));

  const readOwn = async (): Promise<T | undefined> => {
    await waitForSession();
    const { user, userRoles } = useAuthStore.getState();
    if (!user) return undefined;
    const reads = [getMyPropertyById];
    if (hasPermission(userRoles, "manage_properties")) reads.push(getAdminPropertyById);
    for (const read of reads) {
      try {
        return unwrap<T>(await read(id));
      } catch (error) {
        // Not theirs (404) or not allowed (403): try the next.
        if (!isStatus(error, 403, 404)) throw error;
      }
    }
    return undefined;
  };

  if (knownNonPublic) return (await readOwn()) ?? readPublic();
  try {
    return await readPublic();
  } catch (publicError) {
    if (!isStatus(publicError, 404)) throw publicError;
    const own = await readOwn();
    if (own !== undefined) return own;
    throw publicError;
  }
}

// A pending listing is polled for its review result: quickly at first, then
// slower, then not at all. Window focus refetches still pick up a late change.
const INITIAL_POLL_INTERVAL_MS = 10_000;
const BACKOFF_POLL_INTERVAL_MS = 30_000;
const INITIAL_POLL_ATTEMPTS = 3; // fetches at the initial interval before backing off
const MAX_POLL_ATTEMPTS = 10;

/**
 * `initial` is the build-time copy a pre-rendered page carries (see
 * listingSnapshot). It renders at once, matching the exported HTML, and is
 * treated as stale so the browser refetches straight away for the current
 * price and the owner's contact details.
 */
export function usePropertyDetail(id: string, initial?: PropertyDetail) {
  const cleanId = (typeof id === "string" ? id : String(id || "")).trim();
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["property", cleanId],
    queryFn: () => {
      // A listing already seen as not public (in review) is asked for as its owner or staff first.
      const seen = queryClient.getQueryData<PropertyDetail>(["property", cleanId]);
      const knownNonPublic = seen !== undefined && seen.status !== "active" && seen.status !== "sold";
      return fetchPropertyForViewer<PropertyDetail>(cleanId, { knownNonPublic });
    },
    initialData: initial,
    initialDataUpdatedAt: 0,
    enabled: Boolean(cleanId && cleanId !== "undefined" && cleanId !== "null"),
    refetchInterval: (query) => {
      const attempts = query.state.dataUpdateCount;
      if (query.state.data?.status !== "pending" || attempts >= MAX_POLL_ATTEMPTS) return false;
      return attempts < INITIAL_POLL_ATTEMPTS ? INITIAL_POLL_INTERVAL_MS : BACKOFF_POLL_INTERVAL_MS;
    },
  });
}

export function useSimilarProperties(
  type: string | undefined,
  areaId: string | undefined,
  excludeId: string,
) {
  return useQuery({
    queryKey: ["properties", "similar", type, areaId, excludeId],
    queryFn: async () => {
      const response = await getProperties({
        type: type as "residential" | "commercial" | "land" | "parking" | undefined,
        area_id: areaId,
        limit: 5,
        status: "active",
      });
      // A mess seat is priced per seat, so it is never "similar" to a flat or a house.
      return (response.data?.items ?? [])
        .filter((property) => property.id !== excludeId && !isMessSubtype(property.subtype))
        .slice(0, 4);
    },
    enabled: !!type,
  });
}
