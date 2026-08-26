import { create } from "zustand";

type PropertyType = "residential" | "commercial" | "land" | "parking";
type ListingType = "sale" | "rent";

export interface WizardMediaItem {
  id: string;
  url: string;
  displayOrder: number;
  mediaType: "image" | "video";
}

export interface WizardState {
  // Step 1 — Basics
  title: string;
  type: PropertyType;
  subtype: string;
  listingType: ListingType;
  description: string;

  // Step 2 — Details
  price: string;
  areaSize: string;
  bedrooms: string;
  bathrooms: string;
  floor: string;
  facing: string;
  amenities: Record<string, boolean>;

  // Step 3 — Location
  district: string;
  areaId: string;
  areaName: string;
  address: string;
  locationLat: number | null;
  locationLng: number | null;

  // Step 4 — Media
  media: WizardMediaItem[];
  primaryMediaIndex: number;
  virtualTourUrl: string;

  // Meta & Navigation
  propertyId: string | null;
  currentStep: 1 | 2 | 3 | 4 | 5;
  isSubmitting: boolean;

  // Actions
  setBasics: (data: Partial<Pick<WizardState, "title" | "type" | "subtype" | "listingType" | "description" | "price" | "areaSize" | "areaId" | "areaName" | "address">>) => void;
  setDetails: (data: Partial<Pick<WizardState, "price" | "areaSize" | "bedrooms" | "bathrooms" | "floor" | "facing">>) => void;
  setLocation: (data: Partial<Pick<WizardState, "district" | "areaId" | "areaName" | "address" | "locationLat" | "locationLng">>) => void;
  setMedia: (media: WizardMediaItem[]) => void;
  addMedia: (item: WizardMediaItem) => void;
  removeMedia: (id: string) => void;
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
  subtype: "",
  listingType: "sale" as ListingType,
  description: "",

  price: "",
  areaSize: "",
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
