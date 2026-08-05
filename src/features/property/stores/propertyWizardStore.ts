import { create } from "zustand";

type PropertyType = "residential" | "commercial" | "land" | "parking";
type ListingType = "sale" | "rent";

export interface WizardMediaItem {
  id: string;
  url: string;
  displayOrder: number;
}

export interface WizardState {
  // Step 1 — Basics
  title: string;
  type: PropertyType;
  subtype: string;
  listingType: ListingType;
  price: string;
  areaSize: string;
  areaId: string;
  areaName: string;
  address: string;
  description: string;
  locationLat: number | null;
  locationLng: number | null;

  // Step 2 — Media
  media: WizardMediaItem[];
  primaryMediaIndex: number;

  // Step 3 — Review
  amenities: Record<string, boolean>;
  virtualTourUrl: string;

  // Meta
  propertyId: string | null;
  currentStep: 1 | 2 | 3;
  isSubmitting: boolean;

  // Actions
  setBasics: (data: Partial<Pick<WizardState, "title" | "type" | "subtype" | "listingType" | "price" | "areaSize" | "areaId" | "areaName" | "address" | "description" | "locationLat" | "locationLng">>) => void;
  setMedia: (media: WizardMediaItem[]) => void;
  addMedia: (item: WizardMediaItem) => void;
  removeMedia: (id: string) => void;
  setPrimaryMedia: (index: number) => void;
  setAmenities: (amenities: Record<string, boolean>) => void;
  toggleAmenity: (key: string) => void;
  setVirtualTourUrl: (url: string) => void;
  setPropertyId: (id: string) => void;
  setCurrentStep: (step: 1 | 2 | 3) => void;
  setIsSubmitting: (v: boolean) => void;
  reset: () => void;
  loadFromProperty: (data: {
    id: string;
    title: string;
    type: PropertyType;
    subtype: string | null;
    listingType: ListingType;
    price: number;
    areaSize: number | null;
    areaId: string;
    areaName: string;
    address: string | null;
    description: string | null;
    locationLat: number | null;
    locationLng: number | null;
    media: { id: string; url: string; display_order: number }[];
    amenities: Record<string, boolean> | null;
    virtualTourUrl: string | null;
  }) => void;
}

const initialState = {
  title: "",
  type: "residential" as PropertyType,
  subtype: "",
  listingType: "sale" as ListingType,
  price: "",
  areaSize: "",
  areaId: "",
  areaName: "",
  address: "",
  description: "",
  locationLat: null as number | null,
  locationLng: null as number | null,
  media: [] as WizardMediaItem[],
  primaryMediaIndex: 0,
  amenities: {} as Record<string, boolean>,
  virtualTourUrl: "",
  propertyId: null as string | null,
  currentStep: 1 as 1 | 2 | 3,
  isSubmitting: false,
};

export const usePropertyWizardStore = create<WizardState>((set) => ({
  ...initialState,

  setBasics: (data) => set((s) => ({ ...s, ...data })),

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

  loadFromProperty: (data) =>
    set({
      propertyId: data.id,
      title: data.title,
      type: data.type,
      subtype: data.subtype ?? "",
      listingType: data.listingType,
      price: String(data.price),
      areaSize: data.areaSize != null ? String(data.areaSize) : "",
      areaId: data.areaId,
      areaName: data.areaName,
      address: data.address ?? "",
      description: data.description ?? "",
      locationLat: data.locationLat,
      locationLng: data.locationLng,
      media: data.media.map((m, i) => ({
        id: m.id,
        url: m.url,
        displayOrder: m.display_order ?? i,
      })),
      amenities: data.amenities ?? {},
      virtualTourUrl: data.virtualTourUrl ?? "",
      currentStep: 1,
      isSubmitting: false,
    }),
}));
