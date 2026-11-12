import { SEO_AREAS } from "@/content/areas";
import { knownAreaCenter } from "@/features/property/constants/areaCenters";
import { distanceKm } from "@/features/property/utils/placeFromPin";
import type { Area } from "@/types/api";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface CityInfo {
  name: string;
  aliases: string[];
  center: GeoPoint;
}

/**
 * Primary Bangladesh cities and divisional/district centres for nationwide
 * discovery and city-scoped location resolution.
 */
export const BANGLADESH_CITIES: readonly CityInfo[] = [
  { name: "Dhaka", aliases: ["Dacca"], center: { lat: 23.8103, lng: 90.4125 } },
  { name: "Chattogram", aliases: ["Chittagong"], center: { lat: 22.3569, lng: 91.7832 } },
  { name: "Sylhet", aliases: [], center: { lat: 24.8949, lng: 91.8687 } },
  { name: "Rajshahi", aliases: [], center: { lat: 24.3745, lng: 88.6042 } },
  { name: "Khulna", aliases: [], center: { lat: 22.8456, lng: 89.5403 } },
  { name: "Cox's Bazar", aliases: ["Coxs Bazar", "Cox's Bazaar", "Coxs Bazaar"], center: { lat: 21.4272, lng: 92.0058 } },
  { name: "Gazipur", aliases: [], center: { lat: 23.9999, lng: 90.4203 } },
  { name: "Narayanganj", aliases: ["Narayangonj"], center: { lat: 23.6238, lng: 90.5000 } },
  { name: "Cumilla", aliases: ["Comilla"], center: { lat: 23.4607, lng: 91.1809 } },
  { name: "Bogura", aliases: ["Bogra"], center: { lat: 24.8481, lng: 89.3730 } },
  { name: "Barishal", aliases: ["Barisal"], center: { lat: 22.7010, lng: 90.3535 } },
  { name: "Rangpur", aliases: [], center: { lat: 25.7439, lng: 89.2752 } },
  { name: "Mymensingh", aliases: [], center: { lat: 24.7471, lng: 90.4203 } },
  { name: "Jashore", aliases: ["Jessore"], center: { lat: 23.1634, lng: 89.2182 } },
  { name: "Savar", aliases: [], center: { lat: 23.8583, lng: 90.2667 } },
];

const CITY_LOOKUP = new Map<string, string>();
for (const entry of BANGLADESH_CITIES) {
  CITY_LOOKUP.set(squashCityKey(entry.name), entry.name);
  for (const alias of entry.aliases) {
    CITY_LOOKUP.set(squashCityKey(alias), entry.name);
  }
}

function squashCityKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function stripCityAdminSuffix(raw: string): string {
  return raw
    .replace(/\b(district|division|zilla|zila|metropolitan|city corporation|city|sadar)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalizes Bangladesh city/district names across colonial/Google spellings
 * and administrative suffixes (e.g. "Chittagong District" -> "Chattogram",
 * "Bogra" -> "Bogura", "Dhaka Division" -> "Dhaka").
 */
export function normalizeCityName(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = stripCityAdminSuffix(raw);
  if (!cleaned) return null;
  const known = CITY_LOOKUP.get(squashCityKey(cleaned));
  if (known) return known;
  return CITY_LOOKUP.get(squashCityKey(raw)) ?? cleaned;
}

export function isKnownBangladeshCity(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const cleaned = stripCityAdminSuffix(raw);
  return CITY_LOOKUP.has(squashCityKey(cleaned)) || CITY_LOOKUP.has(squashCityKey(raw));
}

export function isNationwideValue(raw: string | null | undefined): boolean {
  if (!raw) return true;
  const v = raw.trim().toLowerCase();
  return v === "" || v === "all" || v === "bangladesh" || v === "all bangladesh" || v === "all cities";
}

/**
 * Fallback map from well-known Bangladesh neighborhoods to their canonical city
 * used ONLY when `area.city` is null in legacy API payloads and parent/coordinate
 * metadata is absent. Explicitly omits names that commonly exist in multiple
 * districts (such as Shajahanpur in Dhaka vs Bogura) so those rely on `city` or coords.
 */
const KNOWN_AREA_TO_CITY: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  const add = (city: string, names: string[]) => {
    for (const n of names) map[squashCityKey(n)] = city;
  };
  for (const seo of SEO_AREAS) {
    if (seo.parent) map[squashCityKey(seo.name)] = seo.city;
  }
  add("Dhaka", [
    "Adabor", "Adabar", "Agargaon", "Ahmed Nagar", "Amulia", "Armanitola",
    "Azimpur", "Badda", "Banglamotor", "Banasree", "Baridhara", "Basabo",
    "Bashundhara", "Cantonment", "Chawkbazar", "Dakkhinkhan", "Demra",
    "Dhanmondi", "Eskaton", "Farmgate", "Gandaria", "Gulshan", "Hatirpool",
    "Hazaribagh", "Ibrahimpur", "Jatrabari", "Kafrul", "Kakrail", "Kalabagan",
    "Kallyanpur", "Kamrangirchar", "Karwan Bazar", "Kazipara", "Keraniganj",
    "Khilgaon", "Khilkhet", "Kotwali", "Kuril", "Lalbagh", "Lalmatia",
    "Maghbazar", "Malibagh", "Mirpur", "Mirpur DOHS", "Mohakhali",
    "Mohammadpur", "Motijheel", "Mugda", "Nadda", "Nawabpur", "New Market",
    "Niketan", "Nikunja", "Old Dhaka", "Pallabi", "Paltan", "Panthapath",
    "Purbachal", "Rajarbagh", "Rampura", "Rayerbagh", "Rayerbazar", "Sabujbagh",
    "Shantinagar", "Sher-e-Bangla Nagar", "Shewrapara", "Shyampur", "Siddheshwari",
    "Sutrapur", "Tejgaon", "Turag", "Uttara", "Uttarkhan", "Vatara", "Wari",
  ]);
  add("Chattogram", [
    "Agrabad", "Bakalia", "Bayazid", "Chandgaon", "Dampara", "GEC",
    "Halishahar", "Jamal Khan", "Khulshi", "Muradpur", "Nasirabad",
    "Pahartali", "Panchlaish", "Patenga",
  ]);
  add("Sylhet", [
    "Amberkhana", "Kumarpara", "Lama Bazar", "Shibganj", "Shahjalal Upashahar",
    "Subid Bazar", "Uposhohor", "Zindabazar",
  ]);
  add("Cox's Bazar", ["Kolatoli", "Laboni", "Sugandha"]);
  return map;
})();

const COORDINATE_INFERRABLE_CITY_RADIUS_KM = 45;

/**
 * Resolves which Bangladesh city an `Area` belongs to, supporting legacy API
 * rows where `area.city` is `null`.
 */
export function inferAreaCity(area: Area, areasById?: Map<string, Area>): string | null {
  const direct = normalizeCityName(area.city);
  if (direct) return direct;

  if (area.parent_area_id && areasById) {
    const seen = new Set<string>([area.id]);
    let parentId: string | null = area.parent_area_id;
    while (parentId && !seen.has(parentId)) {
      seen.add(parentId);
      const parent = areasById.get(parentId);
      if (!parent) break;
      const parentCity = normalizeCityName(parent.city);
      if (parentCity) return parentCity;
      parentId = parent.parent_area_id;
    }
  }

  if (area.center_lat != null && area.center_lng != null) {
    const point = { lat: area.center_lat, lng: area.center_lng };
    let nearestCity: string | null = null;
    let nearestDist = Infinity;
    for (const city of BANGLADESH_CITIES) {
      const dist = distanceKm(point, city.center);
      if (dist <= COORDINATE_INFERRABLE_CITY_RADIUS_KM && dist < nearestDist) {
        nearestDist = dist;
        nearestCity = city.name;
      }
    }
    if (nearestCity) return nearestCity;
  }

  const known = KNOWN_AREA_TO_CITY[squashCityKey(area.name)];
  if (known) return known;

  const selfAsCity = CITY_LOOKUP.get(squashCityKey(area.name));
  return selfAsCity ?? null;
}

/** Filters `areas` strictly to those belonging to `city`. */
export function scopeAreasToCity(areas: Area[], city: string | null | undefined): Area[] {
  const target = normalizeCityName(city);
  if (!target || isNationwideValue(target)) return areas;
  const byId = new Map(areas.map((a) => [a.id, a]));
  const targetLower = target.toLowerCase();
  return areas.filter((area) => inferAreaCity(area, byId)?.toLowerCase() === targetLower);
}

/** Collects ordered unique cities across defaults + fetched `areas`. */
export function collectAvailableCities(areas: Area[]): string[] {
  const seen = new Map<string, string>();
  for (const base of BANGLADESH_CITIES.slice(0, 6)) {
    seen.set(base.name.toLowerCase(), base.name);
  }
  const byId = new Map(areas.map((a) => [a.id, a]));
  for (const area of areas) {
    const city = inferAreaCity(area, byId);
    if (city && !seen.has(city.toLowerCase())) {
      seen.set(city.toLowerCase(), city);
    }
  }
  for (const base of BANGLADESH_CITIES) {
    if (!seen.has(base.name.toLowerCase())) {
      seen.set(base.name.toLowerCase(), base.name);
    }
  }
  return Array.from(seen.values());
}

// ---------------------------------------------------------------------------
// Normalization, Transliteration & Similarity
// ---------------------------------------------------------------------------

const ADMIN_NOISE_RE = /\b(thana|upazila|pourashava|municipality|mouza|union)\b/gi;

/** Lowercase, separator-unified normalization without phonetic folding. */
export function normalizeBasicAreaName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\bresidential\s+area\b/g, "ra")
    .replace(/\br\s*\/\s*a\b/g, "ra")
    .replace(ADMIN_NOISE_RE, " ")
    .replace(/['’`]/g, "")
    .replace(/[-_/.,]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalizes Bangladeshi Romanization variations (`o` <-> `a`, `ah` <-> `a`,
 * `ee` <-> `i`, `oo` <-> `u`, `bh` <-> `v`, `ph` <-> `f`) while keeping structural
 * spacing and numbers intact.
 */
export function normalizeBdTransliteration(raw: string): string {
  const basic = normalizeBasicAreaName(raw);
  return basic
    .replace(/ah/g, "a")
    .replace(/ee/g, "i")
    .replace(/oo/g, "u")
    .replace(/o/g, "a")
    .replace(/bh/g, "v")
    .replace(/ph/g, "f")
    .replace(/\s+/g, " ")
    .trim();
}

function extractNumbers(normalized: string): string[] {
  return normalized.match(/\d+/g) ?? [];
}

function hasDohsToken(normalized: string): boolean {
  return /\bdohs\b/.test(normalized);
}

/**
 * Prevents false-positive fuzzy matches across materially distinct zones such as
 * "Mirpur" vs "Mirpur DOHS" or "Gulshan 1" vs "Gulshan 2".
 */
function hasQualifierConflict(queryNorm: string, candidateNorm: string): boolean {
  if (hasDohsToken(queryNorm) !== hasDohsToken(candidateNorm)) {
    return true;
  }
  const qNums = extractNumbers(queryNorm);
  const cNums = extractNumbers(candidateNorm);
  if (qNums.length !== cNums.length) return true;
  for (let i = 0; i < qNums.length; i++) {
    if (qNums[i] !== cNums[i]) return true;
  }
  return false;
}

export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }
  return prev[b.length];
}

export function levenshteinSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

export function jaroWinklerSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;

  const matchDistance = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  const aMatches = new Array<boolean>(a.length).fill(false);
  const bMatches = new Array<boolean>(b.length).fill(false);

  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, b.length);
    for (let j = start; j < end; j++) {
      if (bMatches[j] || a[i] !== b[j]) continue;
      aMatches[i] = true;
      bMatches[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aMatches[i]) continue;
    while (!bMatches[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }

  const m = matches;
  const jaro = (m / a.length + m / b.length + (m - transpositions / 2) / m) / 3;

  let prefix = 0;
  for (let i = 0; i < Math.min(4, a.length, b.length); i++) {
    if (a[i] === b[i]) prefix++;
    else break;
  }
  return jaro + prefix * 0.1 * (1 - jaro);
}

function areaCenterPoint(area: Area, allAreas: Area[]): GeoPoint | null {
  if (area.center_lat != null && area.center_lng != null) {
    return { lat: area.center_lat, lng: area.center_lng };
  }
  return knownAreaCenter(area.id, area.name, allAreas);
}

function candidateLabels(area: Area): string[] {
  return area.aliases?.length ? [area.name, ...area.aliases] : [area.name];
}

function fuzzyScore(query: string, area: Area): number {
  const qBasic = normalizeBasicAreaName(query);
  const qTrans = normalizeBdTransliteration(query);
  if (!qBasic) return 0;

  let best = 0;
  for (const label of candidateLabels(area)) {
    const cBasic = normalizeBasicAreaName(label);
    const cTrans = normalizeBdTransliteration(label);
    if (!cBasic || hasQualifierConflict(qBasic, cBasic)) continue;

    if (qTrans === cTrans) {
      best = Math.max(best, 0.98);
      continue;
    }

    const qTight = qTrans.replace(/\s+/g, "");
    const cTight = cTrans.replace(/\s+/g, "");
    if (qTight === cTight) {
      best = Math.max(best, 0.96);
      continue;
    }

    const jw = jaroWinklerSimilarity(qTight, cTight);
    const lev = levenshteinSimilarity(qTight, cTight);
    const combined = 0.55 * jw + 0.45 * lev;
    best = Math.max(best, combined);
  }
  return best;
}

// ---------------------------------------------------------------------------
// Multi-Layer Area Resolution
// ---------------------------------------------------------------------------

export type AreaMatchType = "exact" | "fuzzy" | "proximity" | "ambiguous" | "none";

export interface AreaResolutionResult {
  matchType: AreaMatchType;
  matchedArea: Area | null;
  /** Non-empty when matchType is "ambiguous" (near-identical fuzzy candidates). */
  candidates: Area[];
  confidence: number;
  distanceKm: number | null;
  city: string | null;
  coordinates: GeoPoint | null;
}

export interface ResolveAreaMatchInput {
  query?: string | null;
  city?: string | null;
  areas: Area[];
  coordinates?: GeoPoint | null;
  similarityThreshold?: number;
  ambiguityMargin?: number;
  maxDistanceKm?: number;
}

const DEFAULT_SIMILARITY_THRESHOLD = 0.82;
const DEFAULT_AMBIGUITY_MARGIN = 0.05;
const DEFAULT_MAX_DISTANCE_KM = 3;

/**
 * Resolves a search string / Google Place locality to a backend `Area`, strictly
 * scoped within the active `city` when provided:
 * 1. Exact case-insensitive normalized match against `name` & `aliases`.
 * 2. Transliteration-aware fuzzy match (>= 0.82) with qualifier & tie guards.
 * 3. Coordinate Haversine proximity fallback (<= 3 km within the active City).
 */
export function resolveAreaMatch({
  query,
  city,
  areas,
  coordinates = null,
  similarityThreshold = DEFAULT_SIMILARITY_THRESHOLD,
  ambiguityMargin = DEFAULT_AMBIGUITY_MARGIN,
  maxDistanceKm = DEFAULT_MAX_DISTANCE_KM,
}: ResolveAreaMatchInput): AreaResolutionResult {
  const normalizedCity = normalizeCityName(city);
  const scoped = normalizedCity && !isNationwideValue(normalizedCity)
    ? scopeAreasToCity(areas, normalizedCity)
    : areas;

  const trimmedQuery = query?.trim() ?? "";

  if (trimmedQuery) {
    const qNorm = normalizeBasicAreaName(trimmedQuery);
    const qTight = qNorm.replace(/\s+/g, "");

    // Layer 1: Exact normalized match (including aliases)
    const exactMatches = scoped.filter((area) =>
      candidateLabels(area).some((label) => {
        const cNorm = normalizeBasicAreaName(label);
        return cNorm === qNorm || cNorm.replace(/\s+/g, "") === qTight;
      }),
    );

    if (exactMatches.length === 1) {
      const winner = exactMatches[0];
      const pt = coordinates ? areaCenterPoint(winner, scoped) : null;
      return {
        matchType: "exact",
        matchedArea: winner,
        candidates: [winner],
        confidence: 1,
        distanceKm: pt && coordinates ? distanceKm(coordinates, pt) : null,
        city: normalizedCity,
        coordinates,
      };
    }

    if (exactMatches.length > 1) {
      const ranked = rankByCoordinates(exactMatches, coordinates, scoped);
      if (ranked.clearWinner) {
        return {
          matchType: "exact",
          matchedArea: ranked.clearWinner.area,
          candidates: [ranked.clearWinner.area],
          confidence: 1,
          distanceKm: ranked.clearWinner.dist,
          city: normalizedCity,
          coordinates,
        };
      }
      return {
        matchType: "ambiguous",
        matchedArea: null,
        candidates: exactMatches,
        confidence: 1,
        distanceKm: null,
        city: normalizedCity,
        coordinates,
      };
    }

    // Layer 2: Controlled transliteration-aware fuzzy match
    const scored = scoped
      .map((area) => ({ area, score: fuzzyScore(trimmedQuery, area) }))
      .filter((entry) => entry.score >= similarityThreshold)
      .sort((a, b) => b.score - a.score);

    if (scored.length > 0) {
      const top = scored[0];
      const nearTied = scored.filter((entry) => top.score - entry.score <= ambiguityMargin);

      if (nearTied.length === 1) {
        const pt = coordinates ? areaCenterPoint(top.area, scoped) : null;
        return {
          matchType: "fuzzy",
          matchedArea: top.area,
          candidates: [top.area],
          confidence: top.score,
          distanceKm: pt && coordinates ? distanceKm(coordinates, pt) : null,
          city: normalizedCity,
          coordinates,
        };
      }

      // Near-tie: use coordinate proximity if available and clearly disambiguates;
      // otherwise return ambiguous candidates rather than guessing blindly.
      const tiedAreas = nearTied.map((t) => t.area);
      const ranked = rankByCoordinates(tiedAreas, coordinates, scoped);
      if (ranked.clearWinner) {
        return {
          matchType: "fuzzy",
          matchedArea: ranked.clearWinner.area,
          candidates: [ranked.clearWinner.area],
          confidence: top.score,
          distanceKm: ranked.clearWinner.dist,
          city: normalizedCity,
          coordinates,
        };
      }

      return {
        matchType: "ambiguous",
        matchedArea: null,
        candidates: tiedAreas,
        confidence: top.score,
        distanceKm: null,
        city: normalizedCity,
        coordinates,
      };
    }
  }

  // Layer 3: Google Maps coordinate proximity fallback inside active city
  if (coordinates) {
    let bestArea: Area | null = null;
    let bestDist = Infinity;
    for (const area of scoped) {
      const pt = areaCenterPoint(area, scoped);
      if (!pt) continue;
      const dist = distanceKm(coordinates, pt);
      if (dist <= maxDistanceKm && dist < bestDist) {
        bestDist = dist;
        bestArea = area;
      }
    }
    if (bestArea) {
      return {
        matchType: "proximity",
        matchedArea: bestArea,
        candidates: [bestArea],
        confidence: Math.max(0.5, 1 - bestDist / Math.max(1, maxDistanceKm * 2)),
        distanceKm: bestDist,
        city: normalizedCity,
        coordinates,
      };
    }
  }

  return {
    matchType: "none",
    matchedArea: null,
    candidates: [],
    confidence: 0,
    distanceKm: null,
    city: normalizedCity,
    coordinates,
  };
}

function rankByCoordinates(
  candidates: Area[],
  coordinates: GeoPoint | null,
  allAreas: Area[],
): { clearWinner: { area: Area; dist: number } | null } {
  if (!coordinates) return { clearWinner: null };
  const withDist = candidates
    .map((area) => {
      const pt = areaCenterPoint(area, allAreas);
      return pt ? { area, dist: distanceKm(coordinates, pt) } : null;
    })
    .filter((entry): entry is { area: Area; dist: number } => entry !== null)
    .sort((a, b) => a.dist - b.dist);

  if (withDist.length === 0) return { clearWinner: null };
  if (withDist.length === 1 && withDist[0].dist <= 10) return { clearWinner: withDist[0] };
  if (withDist.length > 1 && withDist[0].dist <= 10 && withDist[1].dist - withDist[0].dist >= 0.3) {
    return { clearWinner: withDist[0] };
  }
  return { clearWinner: null };
}

// ---------------------------------------------------------------------------
// Google Places address_components & geometry extraction
// ---------------------------------------------------------------------------

export interface GoogleAddressComponentLike {
  longText?: string;
  shortText?: string;
  long_name?: string;
  short_name?: string;
  types?: string[];
}

export interface GoogleLatLngLike {
  lat: number | (() => number);
  lng: number | (() => number);
}

export interface GooglePlaceLike {
  addressComponents?: GoogleAddressComponentLike[];
  address_components?: GoogleAddressComponentLike[];
  location?: GoogleLatLngLike | null;
  geometry?: { location?: GoogleLatLngLike | null } | null;
  formattedAddress?: string | null;
  formatted_address?: string | null;
  displayName?: string | null;
  name?: string | null;
}

export interface ParsedGooglePlace {
  city: string | null;
  subArea: string | null;
  coordinates: GeoPoint | null;
  formattedAddress: string | null;
}

function readComponentName(c: GoogleAddressComponentLike | undefined): string | null {
  if (!c) return null;
  const val = c.longText ?? c.long_name ?? c.shortText ?? c.short_name;
  return val?.trim() || null;
}

function findComponent(
  components: GoogleAddressComponentLike[],
  type: string,
): string | null {
  return readComponentName(components.find((c) => c.types?.includes(type)));
}

function extractCoordinates(loc: GoogleLatLngLike | null | undefined): GeoPoint | null {
  if (!loc) return null;
  const lat = typeof loc.lat === "function" ? loc.lat() : loc.lat;
  const lng = typeof loc.lng === "function" ? loc.lng() : loc.lng;
  if (typeof lat !== "number" || typeof lng !== "number" || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }
  return { lat, lng };
}

/**
 * Extracts canonical Bangladesh `city` (`locality` / `administrative_area_level_2`),
 * `subArea` (`sublocality_level_1` / `neighborhood` / `sublocality`), and
 * coordinates from either Google Places API (New) or legacy Maps responses.
 */
export function parseGooglePlace(place: GooglePlaceLike): ParsedGooglePlace {
  const components = place.addressComponents ?? place.address_components ?? [];
  const rawLocality = findComponent(components, "locality");
  const rawAdmin2 = findComponent(components, "administrative_area_level_2");
  const rawAdmin1 = findComponent(components, "administrative_area_level_1");

  const normLocality = normalizeCityName(rawLocality);
  const normAdmin2 = normalizeCityName(rawAdmin2);
  const normAdmin1 = normalizeCityName(rawAdmin1);

  let city: string | null = null;
  if (normLocality && isKnownBangladeshCity(normLocality)) {
    city = normLocality;
  } else if (normAdmin2) {
    city = normAdmin2;
  } else if (normLocality) {
    city = normLocality;
  } else if (normAdmin1) {
    city = normAdmin1;
  }

  let subArea =
    findComponent(components, "sublocality_level_1") ??
    findComponent(components, "neighborhood") ??
    findComponent(components, "sublocality") ??
    findComponent(components, "sublocality_level_2") ??
    null;

  // Towns inside a district (e.g. locality="Savar", admin_area_level_2="Dhaka")
  if (!subArea && rawLocality && city && normalizeCityName(rawLocality)?.toLowerCase() !== city.toLowerCase()) {
    subArea = rawLocality;
  }

  // Fallback to displayName only if no structured sub-area exists and it isn't the city itself
  const display = place.displayName?.trim() || place.name?.trim() || null;
  if (!subArea && display && (!city || normalizeCityName(display)?.toLowerCase() !== city.toLowerCase())) {
    subArea = display;
  }

  if (subArea && city && normalizeBasicAreaName(subArea) === normalizeBasicAreaName(city)) {
    subArea = null;
  }

  const coordinates = extractCoordinates(place.location ?? place.geometry?.location);
  const formattedAddress = place.formattedAddress ?? place.formatted_address ?? null;

  return { city, subArea, coordinates, formattedAddress };
}

export function resolveAreaFromGooglePlace(
  place: GooglePlaceLike,
  areas: Area[],
  options?: Omit<ResolveAreaMatchInput, "query" | "city" | "areas" | "coordinates">,
): { parsed: ParsedGooglePlace; resolution: AreaResolutionResult } {
  const parsed = parseGooglePlace(place);
  const resolution = resolveAreaMatch({
    query: parsed.subArea,
    city: parsed.city,
    coordinates: parsed.coordinates,
    areas,
    ...options,
  });
  return { parsed, resolution };
}
