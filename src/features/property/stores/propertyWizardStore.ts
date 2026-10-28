import { create } from "zustand";
import type { UploadInput } from "@/services/upload";

type PropertyType = "residential" | "commercial" | "land" | "parking";
type ListingType = "sale" | "rent";

/**
 * A photo or video in the form. Until the listing is saved it lives on the
 * device: `file` holds it, `id` is a local one and `url` is a local preview.
 * Once uploaded, `file` is gone and `id` and `url` are the server's.
 */
export interface WizardMediaItem {
  id: string;
  url: string;
  displayOrder: number;
  mediaType: "image" | "video";
  file?: UploadInput;
  name?: string;
}

export interface WizardState {
  // Basics
  title: string;
  type: PropertyType;
  subtype: string;
  listingType: ListingType;
  description: string;

  // Details
  price: string;
  areaSize: string;
  areaUnit: "sqft" | "katha" | "bigha" | "sqm";
  bedrooms: string;
  bathrooms: string;
  floor: string;
  facing: string;
  amenities: Record<string, boolean>;

  // Location
  district: string;
  areaId: string;
  areaName: string;
  address: string;
  locationLat: number | null;
  locationLng: number | null;

  // Media
  media: WizardMediaItem[];
  primaryMediaIndex: number;
  virtualTourUrl: string;

  // Meta & Navigation
  propertyId: string | null;
  currentStep: 1 | 2 | 3 | 4 | 5;
  isSubmitting: boolean;

  // Actions
  setBasics: (data: Partial<Pick<WizardState, "title" | "type" | "subtype" | "listingType" | "description" | "price" | "areaSize" | "areaUnit" | "areaId" | "areaName" | "address">>) => void;
  setDetails: (data: Partial<Pick<WizardState, "price" | "areaSize" | "areaUnit" | "bedrooms" | "bathrooms" | "floor" | "facing">>) => void;
  setLocation: (data: Partial<Pick<WizardState, "district" | "areaId" | "areaName" | "address" | "locationLat" | "locationLng">>) => void;
  setMedia: (media: WizardMediaItem[]) => void;
  addMedia: (item: WizardMediaItem) => void;
  removeMedia: (id: string) => void;
  /** Swaps a local item for what the server stored. */
  replaceMedia: (id: string, item: WizardMediaItem) => void;
  setPrimaryMedia: (index: number) => void;
  setAmenities: (amenities: Record<string, boolean>) => void;
  toggleAmenity: (key: string) => void;
  setVirtualTourUrl: (url: string) => void;
  setPropertyId: (id: string | null) => void;
  setCurrentStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  setIsSubmitting: (v: boolean) => void;
  reset: () => void;
}

const initialState = {
  title: "",
  type: "residential" as PropertyType,
  subtype: "apartment",
  listingType: "sale" as ListingType,
  description: "",

  price: "",
  areaSize: "",
  areaUnit: "sqft" as const,
  bedrooms: "",
  bathrooms: "",
  floor: "",
  facing: "",
  amenities: {} as Record<string, boolean>,

  district: "",
  areaId: "",
  areaName: "",
  address: "",
  locationLat: null,
  locationLng: null,

  media: [] as WizardMediaItem[],
  primaryMediaIndex: 0,
  virtualTourUrl: "",

  propertyId: null as string | null,
  currentStep: 1 as 1 | 2 | 3 | 4 | 5,
  isSubmitting: false,
};

export const usePropertyWizardStore = create<WizardState>((set) => ({
  ...initialState,

  setBasics: (data) => set((s) => ({ ...s, ...data })),
  setDetails: (data) => set((s) => ({ ...s, ...data })),
  setLocation: (data) => set((s) => ({ ...s, ...data })),

  setMedia: (media) => set({ media }),

  addMedia: (item) =>
    set((s) => ({
      media: [...s.media, item],
    })),

  removeMedia: (id) =>
    set((s) => ({
      media: s.media.filter((m) => m.id !== id),
      primaryMediaIndex:
        s.primaryMediaIndex >= s.media.length - 1
          ? Math.max(0, s.media.length - 2)
          : s.primaryMediaIndex,
    })),

  replaceMedia: (id, item) =>
    set((s) => ({
      media: s.media.map((m) => (m.id === id ? item : m)),
    })),

  setPrimaryMedia: (index) => set({ primaryMediaIndex: index }),

  setAmenities: (amenities) => set({ amenities }),

  toggleAmenity: (key) =>
    set((s) => ({
      amenities: { ...s.amenities, [key]: !s.amenities[key] },
    })),

  setVirtualTourUrl: (url) => set({ virtualTourUrl: url }),

  setPropertyId: (id) => set({ propertyId: id }),

  setCurrentStep: (step) => set({ currentStep: step }),

  setIsSubmitting: (v) => set({ isSubmitting: v }),

  reset: () => set(initialState),
}));
