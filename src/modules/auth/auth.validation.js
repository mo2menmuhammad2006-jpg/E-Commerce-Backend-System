import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().email("invalid email");

const passwordSchema = z
  .string()
  .min(8, "password must be at least 8 characters")
  .max(72, "password is too long")
  .regex(/[A-Za-z]/, "password must contain a letter")
  .regex(/\d/, "password must contain a number");

const phoneSchema = z.string().trim().regex(/^\+?[0-9]{7,15}$/, "invalid phone");

export const registerSchema = z.object({
  first_name: z.string().trim().min(1, "first name is required").max(50),
  last_name: z.string().trim().min(1, "last name is required").max(50),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema.optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "password is required").max(72),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "current password is required"),
  newPassword: passwordSchema,
});

export const updateProfileSchema = z.object({
  first_name: z.string().trim().min(1).max(50).optional(),
  last_name: z.string().trim().min(1).max(50).optional(),
  phone: phoneSchema.nullable().optional(),
});