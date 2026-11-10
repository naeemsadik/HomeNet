import { create } from "zustand";
import { router } from "expo-router";
import { usePropertyWizardStore } from "@/features/property/stores/propertyWizardStore";
import { toApiError } from "@/services/apiClient";
import { getInstantValuation } from "../services/valuationService";
import type {
  PropertyCondition,
  LegalPapers,
  PropertyFacing,
  RoadAccess,
  ValuationAmenities,
  ValuationPropertyType,
  ValuationPurpose,
  ValuationRequestPayload,
  ValuationResponseData,
  ValuationStep,
  Waterlogging,
} from "../types/valuationTypes";

export interface ValuationFormState {
  purpose: ValuationPurpose;
  propertyType: ValuationPropertyType;
  areaId: string;
  areaName: string;
  roadOrBlock: string;
  buildingName: string;
  address: string;
  locationLat: number | null;
  locationLng: number | null;

  sizeInput: string;
  sizeUnit: "sqft" | "katha";
  /** null until the owner chooses: a studio is 0, which is an answer. */
  bedrooms: number | null;
  bathrooms: number | null;
  balconies: number;
  /** "" until the owner chooses; nothing is assumed in the meantime. */
  floorLevel: string;
  facing: PropertyFacing | "";
  propertyAge: PropertyCondition | "";

  amenities: ValuationAmenities;

  roadAccess: RoadAccess;
  legalPapers: LegalPapers;
  waterlogging: Waterlogging;
}

/**
 * The form starts empty. It used to open with a sample flat already filled in
 * (Gulshan, Road 92, 2,150 sqft, 6th floor, south-facing, brand new, every
 * amenity ticked), so someone who clicked through got a price for a flat that
 * was never theirs, with the premiums for all of it added.
 */
const defaultFormState: ValuationFormState = {
  purpose: "sale",
  propertyType: "apartment",
  areaId: "",
  areaName: "",
  roadOrBlock: "",
  buildingName: "",
  address: "",
  locationLat: null,
  locationLng: null,

  sizeInput: "",
  sizeUnit: "sqft",
  bedrooms: null,
  bathrooms: null,
  balconies: 0,
  floorLevel: "",
  facing: "",
  propertyAge: "",

  amenities: {
    lift: false,
    generator: false,
    parking: false,
    gas: false,
    cctv: false,
    rooftop: false,
    lakeParkView: false,
  },

  // The neutral choices: they change nothing until the owner says otherwise.
  roadAccess: "wide_road",
  legalPapers: "complete",
  waterlogging: "never",
};

export interface InstantValuationStoreState {
  form: ValuationFormState;
  currentStep: ValuationStep;
  isLoading: boolean;
  error: string | null;
  result: ValuationResponseData | null;

  // Actions
  setFormField: <K extends keyof ValuationFormState>(key: K, value: ValuationFormState[K]) => void;
  updateForm: (partial: Partial<ValuationFormState>) => void;
  toggleAmenity: (key: keyof ValuationAmenities) => void;
  setCurrentStep: (step: ValuationStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setInitialFromHero: (params: { areaName?: string; areaId?: string; purpose?: ValuationPurpose; propertyType?: ValuationPropertyType }) => void;
  executeValuation: () => Promise<void>;
  prefillPropertyWizard: () => void;
  reset: () => void;
}

export const useInstantValuationStore = create<InstantValuationStoreState>((set, get) => ({
  form: defaultFormState,
  currentStep: 1,
  isLoading: false,
  error: null,
  result: null,

  setFormField: (key, value) => {
    set((state) => ({
      form: { ...state.form, [key]: value },
    }));
  },

  updateForm: (partial) => {
    set((state) => ({
      form: { ...state.form, ...partial },
    }));
  },

  toggleAmenity: (key) => {
    set((state) => ({
      form: {
        ...state.form,
        amenities: {
          ...state.form.amenities,
          [key]: !state.form.amenities[key],
        },
      },
    }));
  },

  setCurrentStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < 4) {
      set({ currentStep: (currentStep + 1) as ValuationStep });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: (currentStep - 1) as ValuationStep });
    }
  },

  setInitialFromHero: ({ areaName, areaId, purpose, propertyType }) => {
    set((state) => ({
      form: {
        ...state.form,
        ...(areaName ? { areaName } : {}),
        ...(areaId ? { areaId } : {}),
        ...(purpose ? { purpose } : {}),
        ...(propertyType ? { propertyType } : {}),
      },
      currentStep: 1,
      result: null,
      error: null,
    }));
  },

  executeValuation: async () => {
    const { form } = get();
    set({ isLoading: true, error: null, currentStep: 4 });

    const numericSize = parseFloat(form.sizeInput);
    if (!Number.isFinite(numericSize) || numericSize <= 0) {
      set({ isLoading: false, error: "Enter the size of the property first.", currentStep: 2 });
      return;
    }

    const payload: ValuationRequestPayload = {
      purpose: form.purpose,
      propertyType: form.propertyType,
      areaId: form.areaId || "dhaka-central",
      areaName: form.areaName || "Dhaka",
      roadOrBlock: form.roadOrBlock,
      buildingName: form.buildingName,
      address: form.address,
      locationLat: form.locationLat,
      locationLng: form.locationLng,
      sizeSqft: numericSize,
      sizeUnit: form.sizeUnit,
      bedrooms: form.bedrooms ?? 0,
      bathrooms: form.bathrooms ?? 0,
      balconies: form.balconies,
      floorLevel: form.floorLevel || undefined,
      facing: form.facing || undefined,
      propertyAge: form.propertyAge || undefined,
      amenities: form.amenities,
      roadAccess: form.roadAccess,
      legalPapers: form.legalPapers,
      waterlogging: form.waterlogging,
    };

    try {
      const data = await getInstantValuation(payload);
      set({ result: data, isLoading: false });
    } catch (err: unknown) {
      set({
        error: toApiError(err).message,
        isLoading: false,
      });
    }
  },

  prefillPropertyWizard: () => {
    const { form, result } = get();
    const wizardStore = usePropertyWizardStore.getState();

    wizardStore.reset();

    const title = `${form.bedrooms}BR ${form.propertyType === "apartment" ? "Apartment" : "Property"} in ${form.areaName}`;
    // A rent is listed at the estimated monthly rent, a sale at the estimated value.
    const isRent = form.purpose === "rent";
    const amount = isRent ? result?.estimatedMonthlyRent : result?.estimatedValue;
    const priceStr = amount ? String(amount) : isRent ? "" : "25000000";
    const estimateText = isRent
      ? `Estimated monthly rent: ${result?.estimatedMonthlyRentFormatted || ""}.`
      : `Estimated market valuation: ${result?.estimatedValueFormatted || ""}.`;

    wizardStore.setBasics({
      title,
      type: form.propertyType === "commercial" ? "commercial" : form.propertyType === "land" ? "land" : "residential",
      subtype: form.propertyType === "apartment" ? "apartment" : form.propertyType,
      listingType: form.purpose === "rent" ? "rent" : "sale",
      description: `Spacious ${form.sizeInput} ${form.sizeUnit} property in ${form.areaName}. Features ${form.bedrooms} bedrooms, ${form.bathrooms} bathrooms, ${form.facing}-facing orientation, lift, generator, and dedicated parking. ${estimateText}`,
      price: priceStr,
      areaSize: form.sizeInput,
      areaUnit: form.sizeUnit,
      areaId: form.areaId,
      areaName: form.areaName,
      address: form.address || `${form.roadOrBlock}, ${form.areaName}, Dhaka`,
    });

    wizardStore.setDetails({
      price: priceStr,
      areaSize: form.sizeInput,
      areaUnit: form.sizeUnit,
      bedrooms: String(form.bedrooms),
      bathrooms: String(form.bathrooms),
      floor: form.floorLevel,
      facing: form.facing,
    });

    wizardStore.setLocation({
      district: "Dhaka",
      areaId: form.areaId,
      areaName: form.areaName,
      address: form.address || `${form.roadOrBlock}, ${form.areaName}, Dhaka`,
      locationLat: form.locationLat,
      locationLng: form.locationLng,
    });

    wizardStore.setAmenities({
      lift: form.amenities.lift,
      generator: form.amenities.generator,
      parking: form.amenities.parking,
      gas: form.amenities.gas,
      cctv: form.amenities.cctv,
      rooftop: form.amenities.rooftop,
      lakeView: form.amenities.lakeParkView,
    });

    router.push("/property/create" as never);
  },

  reset: () => {
    set({
      form: defaultFormState,
      currentStep: 1,
      isLoading: false,
      error: null,
      result: null,
    });
  },
}));
