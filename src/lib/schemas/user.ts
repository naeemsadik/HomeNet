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
  })
  .strict();

