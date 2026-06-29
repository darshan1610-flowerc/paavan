import { z } from 'zod';

const phoneSchema = z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits');

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const passwordResetRequestSchema = z.object({
  phone: phoneSchema,
});

export const passwordResetConfirmSchema = z.object({
  phone: phoneSchema,
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const inventoryCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(2000).optional(),
  specs: z.record(z.string(), z.string()).default({}),
  pricePerDay: z.number().int().min(0),
  pricePerWeek: z.number().int().min(0),
  pricePerMonth: z.number().int().min(0),
  totalUnits: z.number().int().min(0),
  imagePath: z.string().trim().max(500).optional(),
});

export const inventoryUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(2000).optional(),
  specs: z.record(z.string(), z.string()).optional(),
  pricePerDay: z.number().int().min(0).optional(),
  pricePerWeek: z.number().int().min(0).optional(),
  pricePerMonth: z.number().int().min(0).optional(),
  totalUnits: z.number().int().min(0).optional(),
  availableUnits: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  imagePath: z.string().trim().max(500).optional(),
});

export const aadhaarVerifySchema = z.object({
  userId: z.string().uuid(),
});

export const aadhaarRejectSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().trim().min(1).max(500),
});

export const depositApproveSchema = z.object({
  depositId: z.string().uuid(),
});

export const depositWithholdSchema = z.object({
  depositId: z.string().uuid(),
  reason: z.string().trim().min(1).max(500),
});

export const waitlistNotifySchema = z.object({
  waitlistId: z.string().uuid(),
});

export const waitlistRefundSchema = z.object({
  waitlistId: z.string().uuid(),
});

export const settingsUpdateSchema = z.object({
  platformFee: z.number().int().min(0).optional(),
  depositAmount: z.number().int().min(0).optional(),
  waitlistAdvance: z.number().int().min(0).optional(),
  termsAndConditions: z.string().trim().max(20000).optional(),
  pickupLocations: z.array(z.string().trim().min(1).max(200)).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const addAdminSchema = z.object({
  phone: phoneSchema,
  tempPassword: z.string().min(8, 'Password must be at least 8 characters'),
});
