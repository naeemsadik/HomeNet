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
} from "lucide-react-native";
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
