/**
 * Property Types & Classifications Specification Definitions
 * Aligned with PROPERTY_TYPES_SPECIFICATION.md
 */

import {
  Building2,
  Car,
  Compass,
  Home,
  LucideIcon,
} from "@/components/icons";
import type { PropertyType } from "@/types/api";

export interface PropertySubtypeOption {
  value: string;
  label: string;
  description: string;
}

export interface AmenityOption {
  key: string;
  label: string;
}

export interface PropertyTypeConfig {
  value: PropertyType;
  label: string;
  icon: LucideIcon;
  description: string;
  defaultSubtype: string;
  subtypes: PropertySubtypeOption[];
  /**
   * Whether an owner may type a subtype that isn't listed. The API takes any
   * text, except for parking, where it accepts only covered, open and garage
   * (backend property.rules.ts).
   */
  allowsCustomSubtype: boolean;
  allowedUnits: ("sqft" | "katha" | "bigha" | "sqm")[];
  defaultUnit: "sqft" | "katha" | "bigha" | "sqm";
  amenities: AmenityOption[];
  hasBedrooms: boolean;
  hasBathrooms: boolean;
  hasFloor: boolean;
  hasFacing: boolean;
}

export const PROPERTY_TYPE_CONFIGS: Record<PropertyType, PropertyTypeConfig> = {
  residential: {
    value: "residential",
    label: "Residential",
    icon: Home,
    description: "Apartments, independent houses, villas, and living units",
    defaultSubtype: "apartment",
    subtypes: [
      { value: "apartment", label: "Apartment / Flat", description: "Standard flat or apartment unit" },
      { value: "house", label: "Independent House", description: "Standalone house, bungalow, or villa" },
      { value: "duplex", label: "Duplex", description: "Two-story independent or semi-detached residential unit" },
      { value: "condo", label: "Condominium", description: "Condominium unit with shared community amenities" },
      { value: "short-let", label: "Short Let / Serviced", description: "Furnished serviced apartments for daily/monthly stays" },
      { value: "penthouse", label: "Penthouse", description: "Top-floor luxury suite" },
      { value: "studio", label: "Studio", description: "Single-room open-plan living unit" },
    ],
    allowsCustomSubtype: true,
    allowedUnits: ["sqft", "sqm"],
    defaultUnit: "sqft",
    hasBedrooms: true,
    hasBathrooms: true,
    hasFloor: true,
    hasFacing: true,
    amenities: [
      { key: "parking", label: "Parking Space" },
      { key: "lift", label: "Elevator / Lift" },
      { key: "generator", label: "Standby Generator" },
      { key: "security", label: "24/7 Security" },
      { key: "gas", label: "Titas Gas / LPG Line" },
      { key: "pool", label: "Swimming Pool" },
      { key: "gym", label: "Fitness Center / Gym" },
      { key: "rooftop", label: "Rooftop Access" },
      { key: "cctv", label: "CCTV Surveillance" },
      { key: "smart_home", label: "Smart Home Ready" },
      { key: "servant_quarter", label: "Servant Quarter" },
      { key: "mosque", label: "Prayer Room / Mosque" },
    ],
  },
  commercial: {
    value: "commercial",
    label: "Commercial",
    icon: Building2,
    description: "Offices, retail stores, floors, and commercial buildings",
    defaultSubtype: "office",
    subtypes: [
      { value: "office", label: "Office Space", description: "Corporate office or workplace unit" },
      { value: "office-floor", label: "Office Floor", description: "Entire commercial floor" },
      { value: "shop", label: "Shop / Retail", description: "Retail store, showroom, or market stall" },
      { value: "warehouse", label: "Warehouse", description: "Storage or logistics depot" },
      { value: "building", label: "Commercial Building", description: "Full commercial building" },
    ],
    allowsCustomSubtype: true,
    allowedUnits: ["sqft", "sqm"],
    defaultUnit: "sqft",
    hasBedrooms: false,
    hasBathrooms: false,
    hasFloor: true,
    hasFacing: true,
    amenities: [
      { key: "parking", label: "Dedicated Customer Parking" },
      { key: "lift", label: "Passenger & Cargo Lifts" },
      { key: "generator", label: "Full Backup Generator" },
      { key: "security", label: "Guard & Access Control" },
      { key: "loading_dock", label: "Loading Bay / Dock" },
      { key: "cctv", label: "CCTV Surveillance" },
    ],
  },
  land: {
    value: "land",
    label: "Land",
    icon: Compass,
    description: "Residential plots, commercial sites, and development land",
    defaultSubtype: "residential-plot",
    subtypes: [
      { value: "residential-plot", label: "Residential Plot", description: "Land zoned for residential construction" },
      { value: "commercial-plot", label: "Commercial Plot", description: "Land zoned for commercial activities" },
      { value: "plot", label: "General Plot", description: "Demarcated general land parcel" },
      { value: "agricultural", label: "Agricultural Land", description: "Farming, cultivation, or rural land" },
    ],
    allowsCustomSubtype: true,
    allowedUnits: ["katha", "bigha", "sqft", "sqm"],
    defaultUnit: "katha",
    hasBedrooms: false,
    hasBathrooms: false,
    hasFloor: false,
    hasFacing: true,
    amenities: [
      { key: "road_access", label: "Paved Road Access" },
      { key: "electricity", label: "Grid Power Connection" },
      { key: "water", label: "Water Supply Line" },
      { key: "gas", label: "Gas Connection Available" },
    ],
  },
  parking: {
    value: "parking",
    label: "Parking",
    icon: Car,
    description: "Dedicated garages, basement vehicle slots, or open parking bays",
    defaultSubtype: "covered",
    subtypes: [
      { value: "covered", label: "Covered Parking", description: "Basement or covered dedicated parking slot" },
      { value: "open", label: "Open Parking", description: "Open-air designated parking bay" },
      { value: "garage", label: "Enclosed Garage", description: "Private lockable garage enclosure" },
    ],
    // The API rejects any other parking subtype.
    allowsCustomSubtype: false,
    allowedUnits: ["sqft", "sqm"],
    defaultUnit: "sqft",
    hasBedrooms: false,
    hasBathrooms: false,
    hasFloor: false,
    hasFacing: false,
    amenities: [
      { key: "covered", label: "Covered / Indoor Slot" },
      { key: "security", label: "Guarded Compound" },
      { key: "cctv", label: "CCTV Monitored" },
      { key: "ev_charging", label: "EV Charger" },
    ],
  },
};

// ─── Custom subtypes ───────────────────────────────────────────────────────────

export const CUSTOM_SUBTYPE_MIN_LENGTH = 2;
export const CUSTOM_SUBTYPE_MAX_LENGTH = 40;

const squash = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/** What an owner typed, tidied for storage: no control characters or angle brackets, single spaces, trimmed, capped. */
export function cleanCustomSubtype(text: string): string {
  return Array.from(text, (char) => {
    const code = char.codePointAt(0) ?? 0;
    return code < 32 || code === 127 || char === "<" || char === ">" ? " " : char;
  })
    .join("")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, CUSTOM_SUBTYPE_MAX_LENGTH);
}

/**
 * The listed option that a typed subtype means, if any. "duplex", "Duplex" and
 * "flat" (part of "Apartment / Flat") all match, so a custom entry never
 * duplicates a listed subtype under a different spelling.
 */
export function findKnownSubtype(
  config: PropertyTypeConfig,
  text: string,
): PropertySubtypeOption | undefined {
  const needle = squash(text);
  if (!needle) return undefined;
  return config.subtypes.find((option) =>
    [option.value, option.label, ...option.label.split("/")].some((name) => squash(name) === needle),
  );
}

/** A subtype in words for review screens: the listed label, or the owner's own text. */
export function subtypeLabel(config: PropertyTypeConfig, value: string): string {
  return config.subtypes.find((option) => option.value === value)?.label ?? cleanCustomSubtype(value);
}

/** Why a subtype can't be used, in words for the owner; null when it is fine. */
export function validateSubtype(config: PropertyTypeConfig, value: string): string | null {
  const clean = cleanCustomSubtype(value);
  if (!clean) {
    return `Choose a subtype${config.allowsCustomSubtype ? ", or pick Other and type your own" : ""}.`;
  }
  if (config.subtypes.some((option) => option.value === value)) return null;
  if (!config.allowsCustomSubtype) {
    return `Choose one of the ${config.label.toLowerCase()} subtypes listed.`;
  }
  if (clean.length < CUSTOM_SUBTYPE_MIN_LENGTH) {
    return `Enter at least ${CUSTOM_SUBTYPE_MIN_LENGTH} characters for the subtype.`;
  }
  return null;
}

/**
 * The subtype to start the wizard with when a link or the AI suggests one:
 * a listed value, a custom one where allowed, otherwise the category's default.
 */
export function initialSubtype(config: PropertyTypeConfig, suggested: string | undefined): string {
  const clean = cleanCustomSubtype(suggested ?? "");
  if (!clean) return config.defaultSubtype;
  const listed = config.subtypes.find((option) => option.value === clean);
  if (listed) return listed.value;
  return config.allowsCustomSubtype ? clean : config.defaultSubtype;
}
