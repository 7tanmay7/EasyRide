// EasyRide Zod Validation Schemas

import { z } from 'zod';

export const LocationPointSchema = z.object({
  address: z.string().min(3, 'Address must be at least 3 characters'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  placeId: z.string().optional(),
  zoneId: z.string().optional(),
});

export const RegisterUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid 10-digit phone required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'DRIVER', 'BUSINESS', 'ADMIN']),
  profileImage: z.string().optional(),
  // Additional fields for driver onboarding
  licenseNumber: z.string().optional(),
  vehicleType: z.enum(['BIKE', 'SCOOTER', 'AUTO', 'SEDAN', 'SUV', 'VAN', 'TRUCK']).optional(),
  vehicleModel: z.string().optional(),
  registrationNumber: z.string().optional(),
  // Additional field for business onboarding
  companyName: z.string().optional(),
  industry: z.string().optional(),
});

export const LoginUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const SendOtpSchema = z.object({
  phone: z.string().min(10, 'Phone number required'),
});

export const VerifyOtpSchema = z.object({
  phone: z.string().min(10, 'Phone number required'),
  otp: z.string().length(4, 'OTP must be 4 digits'),
});

export const EstimatePricingSchema = z.object({
  serviceCategory: z.enum(['RIDE', 'PACKAGE', 'QUICK_COMMERCE', 'BUSINESS', 'SERVICE']),
  pickup: LocationPointSchema,
  dropoff: LocationPointSchema,
});

export const CreateBookingSchema = z.object({
  serviceTypeId: z.string().min(1, 'Service type required'),
  serviceCategory: z.enum(['RIDE', 'PACKAGE', 'QUICK_COMMERCE', 'BUSINESS', 'SERVICE']),
  pickup: LocationPointSchema,
  dropoff: LocationPointSchema,
  packageDetails: z
    .object({
      itemType: z.string(),
      weightKg: z.number().positive(),
      instructions: z.string().optional(),
      receiverPhone: z.string().optional(),
    })
    .optional(),
  businessReference: z.string().optional(),
});

export const DriverLocationBroadcastSchema = z.object({
  driverId: z.string(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  heading: z.number().optional(),
  speed: z.number().optional(),
  timestamp: z.string().optional(),
});

export const CreateBusinessDeliverySchema = z.object({
  orderReference: z.string().min(1, 'Order reference required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EXPRESS']).default('MEDIUM'),
  packageSize: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'BULK']).default('MEDIUM'),
  packageWeightKg: z.number().positive().default(1),
  pickup: LocationPointSchema,
  dropoff: LocationPointSchema,
});

export const RatingSchema = z.object({
  bookingId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});
