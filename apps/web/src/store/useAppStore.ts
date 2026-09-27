import { create } from 'zustand';
import { User, DriverProfile, Booking, DemandZoneState, ServiceCategory } from '@easyride/shared-types';
import { BENGALURU_ZONES } from '@easyride/config';

interface AppState {
  currentUser: User;
  driverProfile: DriverProfile | null;
  activeRole: 'CUSTOMER' | 'DRIVER' | 'BUSINESS' | 'ADMIN';
  selectedServiceCategory: ServiceCategory;
  activeBooking: Booking | null;
  onlineDrivers: DriverProfile[];
  demandZones: DemandZoneState[];
  simulationRunning: boolean;

  setCurrentUser: (user: User) => void;
  setActiveRole: (role: 'CUSTOMER' | 'DRIVER' | 'BUSINESS' | 'ADMIN') => void;
  setSelectedServiceCategory: (cat: ServiceCategory) => void;
  setActiveBooking: (booking: Booking | null) => void;
  setOnlineDrivers: (drivers: DriverProfile[]) => void;
  setDemandZones: (zones: DemandZoneState[]) => void;
  toggleSimulation: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: {
    id: 'usr-cust-demo',
    name: 'Priya Sharma (Customer)',
    email: 'customer@easyride.com',
    phone: '+919876543210',
    role: 'CUSTOMER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  driverProfile: {
    id: 'drv-demo',
    userId: 'usr-drv-demo',
    licenseNumber: 'KA-01-2023-998811',
    status: 'ONLINE',
    rating: 4.9,
    acceptanceRate: 96,
    cancellationRate: 1,
    totalTrips: 450,
    totalEarnings: 84500,
    currentLat: 12.9352,
    currentLng: 77.6245,
    heading: 90,
    speed: 20,
    lastLocationAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    vehicle: {
      id: 'veh-demo',
      driverId: 'drv-demo',
      type: 'SEDAN',
      brand: 'Honda',
      model: 'City',
      registrationNumber: 'KA-01-AB-1234',
      capacity: 4,
      status: 'ACTIVE',
    },
  },
  activeRole: 'CUSTOMER',
  selectedServiceCategory: 'RIDE',
  activeBooking: null,
  onlineDrivers: [],
  demandZones: BENGALURU_ZONES.map((z) => ({
    id: z.id,
    name: z.name,
    center: z.center,
    bounds: z.bounds,
    currentDemand: Math.floor(z.baseDemandFactor * 25),
    currentSupply: 20,
    demandSupplyRatio: z.baseDemandFactor,
    status: z.baseDemandFactor > 1.5 ? 'HIGH' : 'BALANCED',
    surgeMultiplier: z.baseDemandFactor > 1.5 ? 1.2 : 1.0,
    updatedAt: new Date().toISOString(),
  })),
  simulationRunning: false,

  setCurrentUser: (user) => set({ currentUser: user }),
  setActiveRole: (role) => set({ activeRole: role }),
  setSelectedServiceCategory: (cat) => set({ selectedServiceCategory: cat }),
  setActiveBooking: (booking) => set({ activeBooking: booking }),
  setOnlineDrivers: (drivers) => set({ onlineDrivers: drivers }),
  setDemandZones: (zones) => set({ demandZones: zones }),
  toggleSimulation: () => set((state) => ({ simulationRunning: !state.simulationRunning })),
}));
