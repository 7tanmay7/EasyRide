// EasyRide Shared TypeScript Types & Domain Interfaces

export type UserRole = 'CUSTOMER' | 'DRIVER' | 'BUSINESS' | 'ADMIN';

export type DriverStatus = 'ONLINE' | 'OFFLINE' | 'IN_TRIP' | 'BUSY';

export type VehicleType = 'BIKE' | 'SCOOTER' | 'AUTO' | 'SEDAN' | 'SUV' | 'VAN' | 'TRUCK';

export type ServiceCategory = 'RIDE' | 'PACKAGE' | 'QUICK_COMMERCE' | 'BUSINESS' | 'SERVICE';

export type BookingStatus =
  | 'REQUESTED'
  | 'SEARCHING'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVING'
  | 'DRIVER_ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentMethod = 'RAZORPAY' | 'UPI' | 'CARD' | 'WALLET' | 'CASH';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type ZoneDSRStatus = 'LOW' | 'BALANCED' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  driverId: string;
  type: VehicleType;
  brand: string;
  model: string;
  registrationNumber: string;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface DriverProfile {
  id: string;
  userId: string;
  licenseNumber: string;
  status: DriverStatus;
  rating: number;
  acceptanceRate: number; // 0..100
  cancellationRate: number; // 0..100
  totalTrips: number;
  totalEarnings: number;
  currentLat: number;
  currentLng: number;
  heading?: number;
  speed?: number;
  lastLocationAt: string;
  createdAt: string;
  vehicle?: Vehicle;
  user?: User;
}

export interface LocationPoint {
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
  zoneId?: string;
}

export interface BookingFareBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  discount: number;
  subtotal: number;
  finalFare: number;
}

export interface Booking {
  id: string;
  customerId: string;
  driverId?: string;
  businessId?: string;
  serviceTypeId: string;
  serviceCategory: ServiceCategory;

  pickup: LocationPoint;
  dropoff: LocationPoint;

  distanceKm: number;
  estimatedDurationMin: number;

  fare: BookingFareBreakdown;
  status: BookingStatus;

  otp?: string;

  packageDetails?: {
    itemType: string;
    weightKg: number;
    instructions?: string;
    receiverPhone?: string;
  };

  businessReference?: string;

  requestedAt: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;

  customer?: User;
  driver?: DriverProfile;
}

export interface BookingEvent {
  id: string;
  bookingId: string;
  eventType: BookingStatus | 'LOCATION_UPDATE' | 'DISPATCH_REJECTED';
  actorId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface DriverLocationSample {
  id: string;
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  providerReference?: string;
  createdAt: string;
}

export interface Rating {
  id: string;
  bookingId: string;
  fromUserId: string;
  toUserId: string;
  rating: number; // 1..5
  comment?: string;
  createdAt: string;
}

export interface DemandZoneState {
  id: string;
  name: string;
  center: [number, number];
  bounds: [number, number][];
  currentDemand: number;
  currentSupply: number;
  demandSupplyRatio: number;
  status: ZoneDSRStatus;
  surgeMultiplier: number;
  updatedAt: string;
}

export interface DispatchAttempt {
  id: string;
  bookingId: string;
  driverId: string;
  distanceToPickupKm: number;
  etaMinutes: number;
  acceptanceProbability: number;
  score: number;
  result: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
}

export interface Business {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  apiKeyHash: string;
  apiKeyPrefix: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface DeliveryJob {
  id: string;
  businessId: string;
  bookingId?: string;
  orderReference: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXPRESS';
  packageSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'BULK';
  packageWeightKg: number;
  pickup: LocationPoint;
  dropoff: LocationPoint;
  deliveryWindowStart?: string;
  deliveryWindowEnd?: string;
  status: 'PENDING' | 'ASSIGNED' | 'DISPATCHED' | 'DELIVERED' | 'FAILED';
  createdAt: string;
}

// ML Predictions
export interface CancellationRiskPrediction {
  bookingId?: string;
  probability: number; // 0..1
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: string[];
}

export interface DemandForecastPrediction {
  zoneId: string;
  zoneName: string;
  currentDemand: number;
  predictedDemand30m: number;
  predictedDemand60m: number;
  trend: 'UP' | 'STABLE' | 'DOWN';
  status: ZoneDSRStatus;
}

export interface DriverAcceptancePrediction {
  driverId: string;
  bookingId: string;
  probability: number;
}

export interface ScoredDriverCandidate {
  driverId: string;
  driverName: string;
  phone: string;
  rating: number;
  vehicleType: VehicleType;
  distanceKm: number;
  etaMin: number;
  acceptanceProbability: number;
  utilizationRate: number;
  todayEarnings: number;
  destinationDemandScore: number;
  finalScore: number;
}

// API Responses
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
  driverProfile?: DriverProfile;
  business?: Business;
}
