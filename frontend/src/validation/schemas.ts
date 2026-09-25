import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  firstName: z.string().trim().max(40, 'First name is too long').optional(),
  lastName: z.string().trim().max(40, 'Last name is too long').optional(),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Use only letters, numbers, and underscores'),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long')
    .regex(/[A-Z]/, 'Add at least one uppercase letter')
    .regex(/[a-z]/, 'Add at least one lowercase letter')
    .regex(/[0-9]/, 'Add at least one number'),
})

export const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Use only letters, numbers, and underscores'),
})

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password is too long')
      .regex(/[A-Z]/, 'Add at least one uppercase letter')
      .regex(/[a-z]/, 'Add at least one lowercase letter')
      .regex(/[0-9]/, 'Add at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const preferencesSchema = z.object({
  defaultLanguage: z
    .string()
    .trim()
    .min(2, 'Enter at least 2 characters (e.g. "en")')
    .max(20, 'Keep it under 20 characters'),
  defaultFormat: z.enum(['SRT', 'VTT'], {
    message: 'Format must be SRT or VTT',
  }),
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
export type ProfileValues = z.infer<typeof profileSchema>
export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>
export type PreferencesValues = z.infer<typeof preferencesSchema>