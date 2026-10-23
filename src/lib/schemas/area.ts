import { z } from "@/lib/zod";

/**
 * Strict schema for creating an area in administrative tools.
 */
export const createAreaSchema = z
  .object({
    name: z
      .string()
      .min(2, "Area name must be at least 2 characters")
      .max(100, "Area name cannot exceed 100 characters")
      .refine(
        (v) => !/[<>{}\x00-\x1F]/.test(v),
        "Area name contains invalid characters",
      ),
    parent_area_id: z
      .string()
      .max(64)
      .regex(/^[a-zA-Z0-9_-]+$/, "Invalid parent area ID")
      .nullable()
      .optional(),
    city: z
      .string()
      .min(2, "City name must be at least 2 characters")
      .max(100, "City name cannot exceed 100 characters")
      .refine(
        (v) => !/[<>{}\x00-\x1F]/.test(v),
        "City contains invalid characters",
      )
      .optional(),
    boundary: z.string().max(10000).optional(),
    centroid: z.string().max(200).optional(),
  })
  .strict();

export type CreateAreaFormData = z.infer<typeof createAreaSchema>;

export const updateAreaSchema = createAreaSchema.partial().strict();
export type UpdateAreaFormData = z.infer<typeof updateAreaSchema>;
