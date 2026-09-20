import { z } from "zod";

// ─── Password rules (shared between register & change-password) ────────────

const passwordBase = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine((v) => !/\s/.test(v), "Password cannot contain spaces")
  .refine(
    (v) => /[a-zA-Z]/.test(v) && /[0-9]/.test(v),
    "Password must contain at least one letter and one number",
  );

// ─── Login ─────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ─── Register ──────────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    full_name: z.string().min(1, "Full name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: passwordBase,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Change Password ──────────────────────────────────────────────────────

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: passwordBase,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ─── Auth modal ────────────────────────────────────────────────────────────

/**
 * Sign-up inside the auth modal. No confirm-password field: the modal ships a
 * show-password toggle instead, so a second entry adds friction without catching
 * anything the toggle doesn't.
 */
export const signUpModalSchema = z.object({
  full_name: z
    .string()
    .min(1, "Full name is required")
    .refine((v) => v.trim().length >= 2, "Full name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: passwordBase,
});

export type AuthModalFormData = {
  full_name?: string;
  email: string;
  password: string;
};

/** Resolver schema for the modal, which swaps between sign-in and sign-up. */
export function authModalSchema(mode: "signin" | "signup") {
  return mode === "signin"
    ? loginSchema.extend({ full_name: z.string().optional() })
    : signUpModalSchema;
}
