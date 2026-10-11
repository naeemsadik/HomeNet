import type { MapPoint } from "../constants/areaCenters";
import { coordinateProblem, parseCoordinatePair } from "./coordinates";

/**
 * Reading a place out of a Google Maps link an owner pasted.
 *
 * Long links carry the position in the text and are read here. Short links
 * (maps.app.goo.gl, the kind Google Maps' Share button copies on a phone) only
 * point to a long link, so they need the API to follow them: see resolveMapLink.
 */
export type MapLinkResult =
  | { kind: "point"; point: MapPoint }
  | { kind: "short"; url: string }
  | { kind: "invalid"; message: string };

export const NOT_A_MAPS_LINK =
  "That doesn't look like a Google Maps link. Open the place in Google Maps, tap Share, copy the link and paste it here.";
export const NO_EXACT_SPOT =
  "This link names a place but not its exact spot. Open it in Google Maps, tap the spot you want and share that link.";

const NUMBER = String.raw`(-?\d+(?:\.\d+)?)`;
// The place's own pin, as Google writes it in a place link's data part.
const PLACE_PIN = new RegExp(`!3d${NUMBER}!4d${NUMBER}`);
// The map view's centre: /maps/@23.81,90.41,17z or /maps/place/Name/@23.81,90.41,17z
const VIEW_CENTRE = new RegExp(`@${NUMBER},${NUMBER}`);
// ?q=23.81,90.41  ?q=loc:23.81,90.41  ?ll=…  ?query=…  (the comma may be %2C)
const QUERY_POINT = new RegExp(String.raw`^(?:loc:)?\s*${NUMBER}\s*,\s*${NUMBER}`);
const QUERY_KEYS = ["q", "ll", "query", "center", "destination", "daddr"];

const GOOGLE_HOST = /(^|\.)google\.[a-z]{2,3}(\.[a-z]{2})?$/i;
const SHORT_HOSTS = ["maps.app.goo.gl"];

function safeDecode(text: string): string {
  try {
    return decodeURIComponent(text.replace(/\+/g, " "));
  } catch {
    return text;
  }
}

/** The first link in what was pasted. People paste "Location: https://…" from WhatsApp. */
function extractUrl(text: string): string | null {
  const withScheme = text.match(/https?:\/\/[^\s]+/i)?.[0];
  const bare = /^(?:www\.)?(?:maps\.app\.goo\.gl|goo\.gl|maps\.google\.[a-z.]+|google\.[a-z.]+)\//i.test(text)
    ? `https://${text.split(/\s/)[0]}`
    : null;
  const url = withScheme ?? bare;
  return url ? url.replace(/[)\].,;]+$/, "") : null;
}

function point(lat: number, lng: number): MapLinkResult {
  const problem = coordinateProblem(lat, lng);
  return problem ? { kind: "invalid", message: NOT_A_MAPS_LINK } : { kind: "point", point: { lat, lng } };
}

export function parseMapLink(input: string): MapLinkResult {
  const text = input.trim();
  if (!text) return { kind: "invalid", message: NOT_A_MAPS_LINK };

  // "23.8103, 90.4125", as Google Maps copies a spot's coordinates.
  const pair = parseCoordinatePair(text);
  if (pair) return point(pair.lat, pair.lng);

  const url = extractUrl(text);
  if (!url) return { kind: "invalid", message: NOT_A_MAPS_LINK };

  const host = url.match(/^https?:\/\/(?:[^@/]*@)?([^/:?#]+)/i)?.[1]?.toLowerCase() ?? "";
  const path = url.replace(/^https?:\/\/[^/]+/i, "");

  if (SHORT_HOSTS.includes(host) || (host === "goo.gl" && path.startsWith("/maps"))) {
    return { kind: "short", url };
  }
  if (!GOOGLE_HOST.test(host)) return { kind: "invalid", message: NOT_A_MAPS_LINK };

  const decoded = safeDecode(path);

  const pin = decoded.match(PLACE_PIN);
  if (pin) return point(Number(pin[1]), Number(pin[2]));

  const centre = decoded.match(VIEW_CENTRE);
  if (centre) return point(Number(centre[1]), Number(centre[2]));

  const query = path.split("?")[1]?.split("#")[0] ?? "";
  for (const part of query.split("&")) {
    const [key, ...rest] = part.split("=");
    if (!QUERY_KEYS.includes(key)) continue;
    const match = safeDecode(rest.join("=")).match(QUERY_POINT);
    if (match) return point(Number(match[1]), Number(match[2]));
  }

  return { kind: "invalid", message: NO_EXACT_SPOT };
}
