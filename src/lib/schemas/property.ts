import { z } from "zod";
import type { PropertyType, ListingType } from "@/types/api";

const propertyTypes: [PropertyType, ...PropertyType[]] = [
  "residential",
  "commercial",
  "land",
  "parking",
];

const listingTypes: [ListingType, ...ListingType[]] = ["sale", "rent"];

/**
 * Schema for the multi-step PropertyForm (create / edit).
 *
 * Step 0 — Details:  title, description, type, listing_type, price
 * Step 1 — Location: area_id, address
 * Step 2 — Features: bedrooms, bathrooms, area_size
 * Step 3 — Images:   (managed outside the form via local state)
 *
 * All fields are required strings (with empty-string defaults via useForm).
 * Optional fields like description use min(0) so they pass with "".
 */
export const propertyFormSchema = z.object({
  // Step 0 — Details
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  type: z.enum(propertyTypes),
  listing_type: z.enum(listingTypes),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Enter a valid price"),

  // Step 1 — Location
  area_id: z.string().min(1, "Area is required"),
  address: z.string(),

  // Step 2 — Features
  bedrooms: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)), "Must be a number"),
  bathrooms: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)), "Must be a number"),
  area_size: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)), "Must be a number"),
});

export type PropertyFormData = z.infer<typeof propertyFormSchema>;

/** Field names belonging to each wizard step — used for per-step trigger(). */
export const PROPERTY_STEP_FIELDS: Record<number, (keyof PropertyFormData)[]> = {
  0: ["title", "description", "type", "listing_type", "price"],
  1: ["area_id", "address"],
  2: ["bedrooms", "bathrooms", "area_size"],
  // Step 3 = images, not validated via zod
};
