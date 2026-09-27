// EasyRide Global Configuration & Constants

export interface ZoneConfig {
  id: string;
  name: string;
  center: [number, number]; // [lat, lng]
  bounds: [number, number][]; // Polygon coordinates [[lat, lng], ...]
  baseDemandFactor: number;
}

export const BENGALURU_ZONES: ZoneConfig[] = [
  {
    id: 'zone-koramangala',
    name: 'Koramangala',
    center: [12.9352, 77.6245],
    bounds: [
      [12.945, 77.615],
      [12.945, 77.635],
      [12.925, 77.635],
      [12.925, 77.615],
    ],
    baseDemandFactor: 1.4,
  },
  {
    id: 'zone-hsr-layout',
    name: 'HSR Layout',
    center: [12.9121, 77.6446],
    bounds: [
      [12.922, 77.635],
      [12.922, 77.655],
      [12.902, 77.655],
      [12.902, 77.635],
    ],
    baseDemandFactor: 1.35,
  },
  {
    id: 'zone-indiranagar',
    name: 'Indiranagar',
    center: [12.9784, 77.6408],
    bounds: [
      [12.988, 77.63],
      [12.988, 77.65],
      [12.968, 77.65],
      [12.968, 77.63],
    ],
    baseDemandFactor: 1.5,
  },
  {
    id: 'zone-whitefield',
    name: 'Whitefield',
    center: [12.9698, 77.7499],
    bounds: [
      [12.985, 77.735],
      [12.985, 77.765],
      [12.955, 77.765],
      [12.955, 77.735],
    ],
    baseDemandFactor: 1.8,
  },
  {
    id: 'zone-electronic-city',
    name: 'Electronic City',
    center: [12.8399, 77.677],
    bounds: [
      [12.855, 77.66],
      [12.855, 77.69],
      [12.825, 77.69],
      [12.825, 77.66],
    ],
    baseDemandFactor: 1.45,
  },
  {
    id: 'zone-bellandur',
    name: 'Bellandur',
    center: [12.926, 77.6762],
    bounds: [
      [12.936, 77.665],
      [12.936, 77.687],
      [12.916, 77.687],
      [12.916, 77.665],
    ],
    baseDemandFactor: 1.6,
  },
  {
    id: 'zone-marathahalli',
    name: 'Marathahalli',
    center: [12.9592, 77.6974],
    bounds: [
      [12.97, 77.685],
      [12.97, 77.71],
      [12.948, 77.71],
      [12.948, 77.685],
    ],
    baseDemandFactor: 1.5,
  },
  {
    id: 'zone-btm-layout',
    name: 'BTM Layout',
    center: [12.9166, 77.6101],
    bounds: [
      [12.926, 77.6],
      [12.926, 77.62],
      [12.906, 77.62],
      [12.906, 77.6],
    ],
    baseDemandFactor: 1.3,
  },
  {
    id: 'zone-silk-board',
    name: 'Silk Board',
    center: [12.9177, 77.6238],
    bounds: [
      [12.925, 77.618],
      [12.925, 77.63],
      [12.91, 77.63],
      [12.91, 77.618],
    ],
    baseDemandFactor: 1.75,
  },
  {
    id: 'zone-majestic',
    name: 'Majestic / City Railway Station',
    center: [12.9767, 77.5713],
    bounds: [
      [12.986, 77.56],
      [12.986, 77.582],
      [12.966, 77.582],
      [12.966, 77.56],
    ],
    baseDemandFactor: 1.65,
  },
  {
    id: 'zone-jayanagar',
    name: 'Jayanagar',
    center: [12.925, 77.5938],
    bounds: [
      [12.935, 77.582],
      [12.935, 77.605],
      [12.915, 77.605],
      [12.915, 77.582],
    ],
    baseDemandFactor: 1.2,
  },
  {
    id: 'zone-jp-nagar',
    name: 'JP Nagar',
    center: [12.9077, 77.5854],
    bounds: [
      [12.918, 77.575],
      [12.918, 77.596],
      [12.896, 77.596],
      [12.896, 77.575],
    ],
    baseDemandFactor: 1.15,
  },
  {
    id: 'zone-banashankari',
    name: 'Banashankari',
    center: [12.9255, 77.5468],
    bounds: [
      [12.936, 77.535],
      [12.936, 77.558],
      [12.914, 77.558],
      [12.914, 77.535],
    ],
    baseDemandFactor: 1.1,
  },
  {
    id: 'zone-hebbal',
    name: 'Hebbal',
    center: [13.0358, 77.597],
    bounds: [
      [13.05, 77.585],
      [13.05, 77.61],
      [13.02, 77.61],
      [13.02, 77.585],
    ],
    baseDemandFactor: 1.4,
  },
  {
    id: 'zone-manyata',
    name: 'Manyata Tech Park',
    center: [13.0451, 77.6204],
    bounds: [
      [13.058, 77.61],
      [13.058, 77.632],
      [13.032, 77.632],
      [13.032, 77.61],
    ],
    baseDemandFactor: 1.7,
  },
  {
    id: 'zone-yelahanka',
    name: 'Yelahanka',
    center: [13.1007, 77.5963],
    bounds: [
      [13.115, 77.58],
      [13.115, 77.61],
      [13.085, 77.61],
      [13.085, 77.58],
    ],
    baseDemandFactor: 1.05,
  },
  {
    id: 'zone-peenya',
    name: 'Peenya Industrial Area',
    center: [13.0329, 77.5273],
    bounds: [
      [13.045, 77.515],
      [13.045, 77.54],
      [13.02, 77.54],
      [13.02, 77.515],
    ],
    baseDemandFactor: 1.25,
  },
  {
    id: 'zone-kengeri',
    name: 'Kengeri',
    center: [12.9081, 77.4856],
    bounds: [
      [12.92, 77.47],
      [12.92, 77.5],
      [12.895, 77.5],
      [12.895, 77.47],
    ],
    baseDemandFactor: 1.0,
  },
  {
    id: 'zone-nagarbhavi',
    name: 'Nagarbhavi',
    center: [12.96, 77.5103],
    bounds: [
      [12.972, 77.5],
      [12.972, 77.522],
      [12.948, 77.522],
      [12.948, 77.5],
    ],
    baseDemandFactor: 1.05,
  },
  {
    id: 'zone-airport',
    name: 'Kempegowda International Airport',
    center: [13.1986, 77.7066],
    bounds: [
      [13.22, 77.68],
      [13.22, 77.73],
      [13.17, 77.73],
      [13.17, 77.68],
    ],
    baseDemandFactor: 1.9,
  },
];

// Service & Pricing Configuration
export interface ServiceCategoryConfig {
  id: string;
  name: string;
  description: string;
  category: 'RIDE' | 'PACKAGE' | 'QUICK_COMMERCE' | 'BUSINESS' | 'SERVICE';
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minFare: number;
  allowedVehicles: string[];
  maxWeightKg?: number;
}

export const SERVICE_CATEGORIES: ServiceCategoryConfig[] = [
  {
    id: 'service-ride-bike',
    name: 'EasyBike (Ride)',
    description: 'Quick single-passenger bike ride',
    category: 'RIDE',
    baseFare: 25,
    perKmRate: 9,
    perMinuteRate: 1.5,
    minFare: 35,
    allowedVehicles: ['BIKE', 'SCOOTER'],
  },
  {
    id: 'service-ride-auto',
    name: 'EasyAuto',
    description: 'Affordable auto-rickshaw rides for up to 3 people',
    category: 'RIDE',
    baseFare: 36,
    perKmRate: 14,
    perMinuteRate: 2.0,
    minFare: 50,
    allowedVehicles: ['AUTO'],
  },
  {
    id: 'service-ride-go',
    name: 'EasyGo (Cab)',
    description: 'Comfortable hatchbacks & sedans',
    category: 'RIDE',
    baseFare: 55,
    perKmRate: 18,
    perMinuteRate: 2.5,
    minFare: 100,
    allowedVehicles: ['SEDAN'],
  },
  {
    id: 'service-ride-xl',
    name: 'EasyXL (SUV)',
    description: 'Spacious 6-seater SUVs for groups and luggage',
    category: 'RIDE',
    baseFare: 90,
    perKmRate: 25,
    perMinuteRate: 3.5,
    minFare: 160,
    allowedVehicles: ['SUV'],
  },
  {
    id: 'service-package-express',
    name: 'EasyPackage Express',
    description: 'Instant document & parcel delivery',
    category: 'PACKAGE',
    baseFare: 30,
    perKmRate: 11,
    perMinuteRate: 1.8,
    minFare: 45,
    allowedVehicles: ['BIKE', 'SCOOTER', 'AUTO'],
    maxWeightKg: 10,
  },
  {
    id: 'service-qcommerce',
    name: 'Quick Commerce Dispatch',
    description: 'Ultra-fast 15-min delivery from dark stores',
    category: 'QUICK_COMMERCE',
    baseFare: 28,
    perKmRate: 10,
    perMinuteRate: 1.5,
    minFare: 40,
    allowedVehicles: ['BIKE', 'SCOOTER'],
    maxWeightKg: 15,
  },
  {
    id: 'service-business-fleet',
    name: 'Business Logistics Truck/Van',
    description: 'Commercial van & mini-truck logistics for B2B',
    category: 'BUSINESS',
    baseFare: 180,
    perKmRate: 32,
    perMinuteRate: 4.0,
    minFare: 300,
    allowedVehicles: ['VAN', 'TRUCK'],
    maxWeightKg: 500,
  },
  {
    id: 'service-technician',
    name: 'Service Tech Express',
    description: 'Dispatch specialized technicians with toolsets',
    category: 'SERVICE',
    baseFare: 120,
    perKmRate: 22,
    perMinuteRate: 3.0,
    minFare: 200,
    allowedVehicles: ['SCOOTER', 'SEDAN', 'VAN'],
  },
];

// Dispatch Engine Scoring Weights
export const DISPATCH_WEIGHTS = {
  proximity: 0.30,
  eta: 0.20,
  acceptanceProb: 0.20,
  utilization: 0.15,
  earnings: 0.10,
  destinationDemand: 0.05,
};

// Demand/Supply Ratio (DSR) Thresholds
export const DSR_THRESHOLDS = {
  LOW: 0.8,
  BALANCED: 1.2,
  HIGH: 2.0,
  CRITICAL: Infinity,
};

// Dynamic Pricing Multiplier Caps
export const SURGE_CONFIG = {
  MIN_MULTIPLIER: 1.0,
  MAX_MULTIPLIER: 2.5,
};
