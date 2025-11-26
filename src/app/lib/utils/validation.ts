import { z } from 'zod';

// User validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['superadmin', 'resident', 'guard']),
  propertyId: z.string().optional(),
});

// Visitor validation schemas
export const visitorRegistrationSchema = z.object({
  propertyId: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number').optional(),
  idCardType: z.enum(['aadhaar', 'pan', 'driving_license', 'passport', 'other']).optional(),
  idCardNumber: z.string().optional(),
  photoUrl: z.string(),
  purpose: z.string().min(3, 'Purpose must be at least 3 characters'),
  hostResidentId: z.string(),
  vehicleNumber: z.string().optional(),
  numberOfPersons: z.number().int().positive().default(1),
});

export const otpVerificationSchema = z.object({
  phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number'),
  otp: z.string().regex(/^[0-9]{6}$/, 'OTP must be 6 digits'),
});

// Property validation schemas
export const createPropertySchema = z.object({
  name: z.string().min(3, 'Property name must be at least 3 characters'),
  type: z.enum(['apartment', 'warehouse', 'rwa', 'office']),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string().regex(/^[0-9]{6}$/, 'Invalid pincode'),
    country: z.string().default('India'),
  }),
  contactPerson: z.object({
    name: z.string(),
    phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number'),
    email: z.string().email('Invalid email'),
  }),
  totalUnits: z.number().int().positive().optional(),
});

// Resident validation schemas
export const createResidentSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  propertyId: z.string(),
  unitNumber: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number'),
  alternatePhone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number').optional(),
  numberOfMembers: z.number().int().positive().default(1),
  vehicleNumbers: z.array(z.string()).optional(),
});

// Approval validation
export const approvalSchema = z.object({
  visitorId: z.string(),
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
});

// Check-in validation
export const checkInSchema = z.object({
  visitorId: z.string(),
});

// Mark exit validation
export const markExitSchema = z.object({
  visitorId: z.string(),
});

// Helper function to validate data
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}