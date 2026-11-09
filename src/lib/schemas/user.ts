import { z } from "@/lib/zod";
import { nameBase } from "./auth";

export const editProfileSchema = z
  .object({
    full_name: nameBase,
  })
  .strict();

export type EditProfileFormData = z.infer<typeof editProfileSchema>;

export const updateUserDtoSchema = z
  .object({
    full_name: nameBase.optional(),
    account_type: z.enum(["individual", "company"]).optional(),
    company_name: z.string().trim().max(150).optional(),
  })
  .strict();

