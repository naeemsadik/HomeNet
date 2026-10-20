import { create } from "zustand";
import { router } from "expo-router";
import { usePropertyWizardStore } from "@/features/property/stores/propertyWizardStore";
import { getInstantValuation } from "../services/valuationService";
import type {
  PropertyCondition,
  PropertyFacing,
  ValuationAmenities,
  ValuationPropertyType,
  ValuationPurpose,
  ValuationRequestPayload,
  ValuationResponseData,
  ValuationStep,
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
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  floorLevel: string;
  facing: PropertyFacing;
  propertyAge: PropertyCondition;

  amenities: ValuationAmenities;
}

const defaultFormState: ValuationFormState = {
  purpose: "sale",
  propertyType: "apartment",
  areaId: "gulshan-2-dhaka",
  areaName: "Gulshan",
  roadOrBlock: "Road 92",
  buildingName: "",
  address: "Gulshan, Dhaka",
  locationLat: 23.7925,
  locationLng: 90.4158,

  sizeInput: "2150",
  sizeUnit: "sqft",
  bedrooms: 3,
  bathrooms: 3,
  balconies: 2,
  floorLevel: "6",
  facing: "south",
  propertyAge: "brand_new",

  amenities: {
    lift: true,
    generator: true,
    parking: true,
    gas: true,
    cctv: true,
    rooftop: true,
    lakeParkView: false,
  },
};

export interface InstantValuationStoreState {
  form: ValuationFormState;
  currentStep: ValuationStep;
  isLoading: boolean;
  loadingStage: string;
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

const LOADING_STAGES = [
  "Analyzing comparable verified listings in Dhaka...",
  "Evaluating per-sqft historical transactions...",
  "Calculating floor & south-facing orientation premiums...",
  "Synthesizing Dhaka infrastructure & utility bonuses...",
  "Finalizing your instant valuation report...",
];

export const useInstantValuationStore = create<InstantValuationStoreState>((set, get) => ({
  form: defaultFormState,
  currentStep: 1,
  isLoading: false,
  loadingStage: "",
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

    const numericSize = parseFloat(form.sizeInput) || 1800;

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
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      balconies: form.balconies,
      floorLevel: form.floorLevel,
      facing: form.facing,
      propertyAge: form.propertyAge,
      amenities: form.amenities,
    };

    // Animate through progression stages
    for (let i = 0; i < LOADING_STAGES.length; i++) {
      set({ loadingStage: LOADING_STAGES[i] });
      await new Promise((r) => setTimeout(r, 280));
    }

    try {
      const data = await getInstantValuation(payload);
      set({ result: data, isLoading: false, loadingStage: "" });
    } catch (err: any) {
      set({
        error: err?.message || "Failed to generate instant valuation. Please check inputs and try again.",
        isLoading: false,
        loadingStage: "",
      });
    }
  },

  prefillPropertyWizard: () => {
    const { form, result } = get();
    const wizardStore = usePropertyWizardStore.getState();

    wizardStore.reset();

    const title = `${form.bedrooms}BR ${form.propertyType === "apartment" ? "Apartment" : "Property"} in ${form.areaName}`;
    const priceStr = result?.estimatedValue ? String(result.estimatedValue) : "25000000";

    wizardStore.setBasics({
      title,
      type: form.propertyType === "commercial" ? "commercial" : form.propertyType === "land" ? "land" : "residential",
      subtype: form.propertyType === "apartment" ? "apartment" : form.propertyType,
      listingType: form.purpose === "rent" ? "rent" : "sale",
      description: `Spacious ${form.sizeInput} ${form.sizeUnit} property in ${form.areaName}. Features ${form.bedrooms} bedrooms, ${form.bathrooms} bathrooms, ${form.facing}-facing orientation, lift, generator, and dedicated parking. Estimated market valuation: ${result?.estimatedValueFormatted || ""}.`,
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
      loadingStage: "",
      error: null,
      result: null,
    });
  },
}));
