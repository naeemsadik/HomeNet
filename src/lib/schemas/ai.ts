import { z } from "@/lib/zod";

/**
 * Strict schema for free-text description sent to AI parse-property endpoint.
 * Requires: string, length 20 to 2,000 characters, no invalid control characters.
 */
export const aiParsePropertyInputSchema = z
  .object({
    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .max(2000, "Description cannot exceed 2,000 characters")
      .refine(
        (v) => !/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(v),
        "Description contains invalid control characters",
      ),
  })
  .strict();

export type AiParsePropertyInput = z.infer<typeof aiParsePropertyInputSchema>;

/**
 * Strict schema for parameters sent to smart-search endpoint.
 * Requires: query string 3 to 300 characters without script or angle brackets,
 * optional page (1-100), optional limit (1-20).
 */
export const smartSearchInputSchema = z
  .object({
    query: z
      .string()
      .min(1, "Search query is required")
      .max(300, "Search query cannot exceed 300 characters")
      .refine(
        (v) => !/[<>{}\x00-\x1F]/.test(v),
        "Search query contains invalid characters",
      ),
    page: z.number().int().min(1).max(100).optional(),
    limit: z.number().int().min(1).max(20).optional(),
  })
  .strict();

export type SmartSearchInput = z.infer<typeof smartSearchInputSchema>;
