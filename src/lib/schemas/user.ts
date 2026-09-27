import { z } from "@/lib/zod";

export const editProfileSchema = z.object({
  full_name: z
    .string()
    .min(1, "Full name is required")
    .transform((v) => v.trim()),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;
