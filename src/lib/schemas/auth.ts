import { z } from "@/lib/zod";

// ─── Shared Base Rules ──────────────────────────────────────────────────────

export const passwordBase = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password cannot exceed 128 characters")
  .refine((v) => !/\s/.test(v), "Password cannot contain spaces")
  .refine(
    (v) => /[a-zA-Z]/.test(v) && /[0-9]/.test(v),
    "Password must contain at least one letter and one number",
  );

export const emailBase = z
  .string()
  .min(1, "Email is required")
  .max(254, "Email must not exceed 254 characters")
  .email("Enter a valid email address");

export const nameBase = z
  .string()
  .min(2, "Full name must be at least 2 characters")
  .max(100, "Full name cannot exceed 100 characters")
  .refine((v) => v.trim().length >= 2, "Full name must be at least 2 characters")
  .regex(
    /^[\p{L}\p{M}'\s.-]+$/u,
    "Full name can only contain letters, spaces, hyphens, and periods",
  );

// ─── Login ─────────────────────────────────────────────────────────────────

export const loginSchema = z
  .object({
    email: emailBase,
    password: z
      .string()
      .min(1, "Password is required")
      .max(128, "Password cannot exceed 128 characters"),
  })
  .strict();

export type LoginFormData = z.infer<typeof loginSchema>;

// ─── Google ────────────────────────────────────────────────────────────────

/** The credential Google Identity Services returns is a JWT. */
export const googleLoginSchema = z
  .object({
    id_token: z
      .string()
      .max(4096, "Google sign-in token is too long")
      .regex(/^[\w-]+\.[\w-]+\.[\w-]+$/, "Google sign-in token is not valid"),
  })
  .strict();

// ─── Register ──────────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    full_name: nameBase,
    email: emailBase,
    password: passwordBase,
    confirmPassword: z
      .string()
      .min(1, "Confirm your password")
      .max(128),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const registerDtoSchema = z
  .object({
    full_name: nameBase,
    email: emailBase,
    password: passwordBase,
  })
  .strict();

// ─── Change Password ──────────────────────────────────────────────────────

export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, "Current password is required")
      .max(128, "Current password cannot exceed 128 characters"),
    new_password: passwordBase,
    confirmPassword: z
      .string()
      .min(1, "Confirm your new password")
      .max(128),
  })
  .strict()
  .refine((data) => data.new_password === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const changePasswordDtoSchema = z
  .object({
    current_password: z
      .string()
      .min(1, "Current password is required")
      .max(128, "Current password cannot exceed 128 characters"),
    new_password: passwordBase,
  })
  .strict();



// ─── Auth modal ────────────────────────────────────────────────────────────

/** Messages for the confirm-password checks; the modal passes translated ones. */
export interface SignUpModalMessages {
  confirmPasswordRequired?: string;
  passwordsDoNotMatch?: string;
}

/**
 * Sign-up inside the auth modal. confirmPassword is client-only: it is checked
 * against password here and never sent to the API (registerUser strips it).
 */
function buildSignUpModalSchema(messages?: SignUpModalMessages) {
  return z
    .object({
      full_name: nameBase,
      email: emailBase,
      password: passwordBase,
      confirmPassword: z
        .string()
        .min(1, messages?.confirmPasswordRequired || "Confirm your password")
        .max(128),
    })
    .strict()
    .refine((data) => data.password === data.confirmPassword, {
      message: messages?.passwordsDoNotMatch || "Passwords do not match",
      path: ["confirmPassword"],
    });
}

export const signUpModalSchema = buildSignUpModalSchema();

export type AuthModalFormData = {
  full_name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

/** Resolver schema for the modal, which swaps between sign-in and sign-up. */
export function authModalSchema(mode: "signin" | "signup", messages?: SignUpModalMessages) {
  if (mode === "signin") {
    return loginSchema
      .extend({
        full_name: z.string().max(100).optional(),
        confirmPassword: z.string().max(128).optional(),
      })
      .strict();
  }
  return buildSignUpModalSchema(messages);
}

