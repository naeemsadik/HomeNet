import type { Area } from "@/types/api";

export interface MapPoint {
  lat: number;
  lng: number;
}

/** Where the picker opens when nothing else is known: central Dhaka. */
export const DHAKA_CENTER: MapPoint = { lat: 23.8103, lng: 90.4125 };

/**
 * Approximate centres of the neighbourhoods HomeNet lists. They only decide where
 * the map OPENS once an owner picks an area, saving a long pan. They are never
 * stored as a listing's coordinates: those always come from the owner's pin.
 * Accurate to roughly a kilometre; an area missing here opens on Dhaka.
 */
const AREA_CENTERS: Record<string, MapPoint> = {
  gulshan: { lat: 23.7925, lng: 90.4078 },
  banani: { lat: 23.7937, lng: 90.4043 },
  baridhara: { lat: 23.8041, lng: 90.4152 },
  bashundhara: { lat: 23.8193, lng: 90.4526 },
  dhanmondi: { lat: 23.7461, lng: 90.3742 },
  uttara: { lat: 23.8759, lng: 90.3795 },
  mirpur: { lat: 23.8223, lng: 90.3654 },
  mohammadpur: { lat: 23.7662, lng: 90.3589 },
  motijheel: { lat: 23.733, lng: 90.4172 },
  rampura: { lat: 23.7615, lng: 90.4235 },
  banasree: { lat: 23.7634, lng: 90.4338 },
};

const squash = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

/** "Gulshan-2" → gulshan, "Mirpur-10" → mirpur. */
function lookup(name: string): MapPoint | undefined {
  const key = squash(name);
  return AREA_CENTERS[key] ?? AREA_CENTERS[key.replace(/\d+$/, "")];
}

/**
 * The centre of an area, if HomeNet knows it. Sub-areas whose own name doesn't
 * say where they are ("Sector-7") use their parent's centre ("Uttara").
 */
export function knownAreaCenter(areaId: string, areaName: string, areas: Area[]): MapPoint | null {
  const direct = lookup(areaName);
  if (direct) return direct;

  const byId = new Map(areas.map((area) => [area.id, area]));
  let current = byId.get(areaId);
  for (let depth = 0; current?.parent_area_id && depth < 3; depth++) {
    current = byId.get(current.parent_area_id);
    const inherited = current ? lookup(current.name) : undefined;
    if (inherited) return inherited;
  }
  return null;
}

/** Where to open the map for an area: its centre, or Dhaka when it isn't known. */
export function areaCenterFor(areaId: string, areaName: string, areas: Area[]): MapPoint {
  return knownAreaCenter(areaId, areaName, areas) ?? DHAKA_CENTER;
}
