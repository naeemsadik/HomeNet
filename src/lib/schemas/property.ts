import { z } from "@/lib/zod";
import type { PropertyType, ListingType } from "@/types/api";

export const propertyTypes: [PropertyType, ...PropertyType[]] = [
  "residential",
  "commercial",
  "land",
  "parking",
];

export const listingTypes: [ListingType, ...ListingType[]] = ["sale", "rent"];

export const areaUnits = ["sqft", "katha", "bigha", "sqm"] as const;

/**
 * Schema for the multi-step PropertyForm (create / edit).
 *
 * Step 0 — Details:  title, description, type, listing_type, price
 * Step 1 — Location: area_id, address
 * Step 2 — Features: bedrooms, bathrooms, area_size
 * Step 3 — Images:   (managed outside the form via local state)
 *
 * All fields are strictly validated against type, length, and format.
 */
export const propertyFormSchema = z
  .object({
    // Step 0 — Details
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(150, "Title must be at most 150 characters")
      .refine((v) => !/[<>{}\x00-\x1F]/.test(v), "Title contains invalid characters"),
    description: z
      .string()
      .max(5000, "Description must be at most 5,000 characters")
      .refine((v) => !/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(v), "Description contains invalid characters"),
    type: z.enum(propertyTypes),
    listing_type: z.enum(listingTypes),
    price: z
      .string()
      .min(1, "Price is required")
      .max(15, "Price exceeds maximum digits")
      .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid price amount")
      .refine((v) => {
        const n = Number(v);
        return !isNaN(n) && n > 0 && n <= 1_000_000_000_000;
      }, "Enter a valid price between 1 and 1,000,000,000,000"),

    // Step 1 — Location
    area_id: z
      .string()
      .min(1, "Area is required")
      .max(64, "Area ID too long")
      .regex(/^[a-zA-Z0-9_-]+$/, "Area ID contains invalid characters"),

    address: z
      .string()
      .max(300, "Address must be at most 300 characters")
      .refine((v) => !/[<>{}\x00-\x1F]/.test(v), "Address contains invalid characters"),

    // Step 2 — Features
    bedrooms: z
      .string()
      .max(4, "Invalid number of bedrooms")
      .regex(/^(\d+)?$/, "Bedrooms must be a whole number")
      .refine((v) => !v || (Number(v) >= 0 && Number(v) <= 100), "Bedrooms must be between 0 and 100"),
    bathrooms: z
      .string()
      .max(4, "Invalid number of bathrooms")
      .regex(/^(\d+)?$/, "Bathrooms must be a whole number")
      .refine((v) => !v || (Number(v) >= 0 && Number(v) <= 100), "Bathrooms must be between 0 and 100"),
    area_size: z
      .string()
      .max(10, "Invalid area size")
      .regex(/^(\d+(\.\d{1,2})?)?$/, "Area size must be a valid number")
      .refine((v) => !v || (Number(v) > 0 && Number(v) <= 1_000_000), "Area size must be greater than 0"),
  })
  .strict();

export type PropertyFormData = z.infer<typeof propertyFormSchema>;

/** Field names belonging to each wizard step — used for per-step trigger(). */
export const PROPERTY_STEP_FIELDS: Record<number, (keyof PropertyFormData)[]> = {
  0: ["title", "description", "type", "listing_type", "price"],
  1: ["area_id", "address"],
  2: ["bedrooms", "bathrooms", "area_size"],
  // Step 3 = images, not validated via zod
};

/**
 * Strict schema for UpsertPropertyDto validated before sending to the API.
 */
export const upsertPropertyDtoSchema = z
  .object({
    property_id: z.string().max(64).regex(/^[a-zA-Z0-9_-]+$/).optional(),
    area_id: z
      .string()
      .min(1, "Area is required")
      .max(64)
      .regex(/^[a-zA-Z0-9_-]+$/)
      .optional(),
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(150, "Title must be at most 150 characters")
      .refine((v) => !/[<>{}\x00-\x1F]/.test(v), "Title contains invalid characters")
      .optional(),
    description: z
      .string()
      .max(5000, "Description must be at most 5,000 characters")
      .refine((v) => !/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(v), "Description contains invalid characters")
      .optional(),
    type: z.enum(propertyTypes).optional(),
    subtype: z
      .string()
      .min(2, "Subtype must be at least 2 characters")
      .max(40, "Subtype must be at most 40 characters")
      .refine((v) => !/[<>{}\x00-\x1F]/.test(v), "Subtype contains invalid characters")
      .optional(),
    listing_type: z.enum(listingTypes).optional(),
    price: z.number().finite().positive().max(1_000_000_000_000).optional(),
    price_currency: z.literal("BDT").optional(),
    area_size: z.number().finite().positive().max(1_000_000).optional(),
    area_unit: z.enum(areaUnits).optional(),
    location_lat: z.number().finite().min(-90).max(90).optional(),
    location_lng: z.number().finite().min(-180).max(180).optional(),
    address: z
      .string()
      .max(300)
      .refine((v) => !/[<>{}\x00-\x1F]/.test(v), "Address contains invalid characters")
      .optional(),
    amenities: z.record(z.string().max(50), z.unknown()).optional(),
    virtual_tour_url: z
      .string()
      .url("Must be a valid URL")
      .max(2048)
      .refine((url) => /^https?:\/\//i.test(url), "URL must start with http:// or https://")
      .optional(),
    status: z.enum(["draft", "pending", "active", "sold", "archived"]).optional(),
  })
  .strict();

