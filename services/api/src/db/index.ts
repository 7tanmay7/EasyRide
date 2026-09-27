import fs from 'fs';
import path from 'path';
import {
  User,
  DriverProfile,
  Vehicle,
  Booking,
  BookingEvent,
  Payment,
  Rating,
  DemandZoneState,
  DispatchAttempt,
  Business,
  DeliveryJob,
} from '@easyride/shared-types';
import { BENGALURU_ZONES, SERVICE_CATEGORIES } from '@easyride/config';

// In-Memory Spatial Data Repository (Pre-populated from Bengaluru dataset)
class EasyRideDatabase {
  public users: Map<string, User> = new Map();
  public driverProfiles: Map<string, DriverProfile> = new Map();
  public vehicles: Map<string, Vehicle> = new Map();
  public bookings: Map<string, Booking> = new Map();
  public bookingEvents: BookingEvent[] = [];
  public payments: Map<string, Payment> = new Map();
  public ratings: Map<string, Rating> = new Map();
  public demandZones: Map<string, DemandZoneState> = new Map();
  public dispatchAttempts: DispatchAttempt[] = [];
  public businesses: Map<string, Business> = new Map();
  public deliveryJobs: Map<string, DeliveryJob> = new Map();

  private initialized = false;

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load Zones
    BENGALURU_ZONES.forEach((z) => {
      this.demandZones.set(z.id, {
        id: z.id,
        name: z.name,
        center: z.center,
        bounds: z.bounds,
        currentDemand: Math.floor(z.baseDemandFactor * 25),
        currentSupply: Math.floor(randomRange(15, 35)),
        demandSupplyRatio: z.baseDemandFactor,
        status: z.baseDemandFactor > 1.5 ? 'HIGH' : 'BALANCED',
        surgeMultiplier: z.baseDemandFactor > 1.5 ? 1.2 : 1.0,
        updatedAt: new Date().toISOString(),
      });
    });

    // Try loading generated Bengaluru seed dataset
    const datasetPath = path.join(__dirname, '../../../../database/seeds/bengaluru_mobility_dataset.json');
    if (fs.existsSync(datasetPath)) {
      try {
        const raw = fs.readFileSync(datasetPath, 'utf-8');
        const data = JSON.parse(raw);

        // Load Customers
        data.customers.forEach((c: any) => {
          this.users.set(c.id, {
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            role: c.role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        });

        // Load Businesses
        data.businesses.forEach((b: any) => {
          const user: User = {
            id: b.userId,
            name: b.companyName,
            email: b.email,
            phone: b.phone,
            role: 'BUSINESS',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          this.users.set(user.id, user);

          this.businesses.set(b.id, {
            id: b.id,
            userId: b.userId,
            companyName: b.companyName,
            industry: b.industry,
            apiKeyHash: 'hash_' + b.apiKeyPrefix,
            apiKeyPrefix: b.apiKeyPrefix,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
          });
        });

        // Load Drivers & Vehicles
        data.drivers.forEach((d: any) => {
          const user: User = {
            id: d.userId,
            name: d.name,
            email: d.email,
            phone: d.phone,
            role: 'DRIVER',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          this.users.set(user.id, user);

          const vehicle: Vehicle = {
            id: d.vehicle.id,
            driverId: d.id,
            type: d.vehicle.type,
            brand: d.vehicle.brand,
            model: d.vehicle.model,
            registrationNumber: d.vehicle.registrationNumber,
            capacity: d.vehicle.capacity,
            status: 'ACTIVE',
          };
          this.vehicles.set(vehicle.id, vehicle);

          const profile: DriverProfile = {
            id: d.id,
            userId: d.userId,
            licenseNumber: d.licenseNumber,
            status: d.status,
            rating: d.rating,
            acceptanceRate: d.acceptanceRate,
            cancellationRate: d.cancellationRate,
            totalTrips: d.totalTrips,
            totalEarnings: d.totalEarnings,
            currentLat: d.currentLat,
            currentLng: d.currentLng,
            heading: d.heading,
            speed: d.speed,
            lastLocationAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            vehicle,
            user,
          };
          this.driverProfiles.set(d.id, profile);
        });

        // Load Recent Historical Bookings
        data.bookings.slice(0, 500).forEach((b: any) => {
          this.bookings.set(b.id, b);
        });

        console.log(
          `[EasyRide DB] Seeded ${this.users.size} users, ${this.driverProfiles.size} drivers, ${this.businesses.size} businesses, ${this.bookings.size} active/recent bookings.`
        );
      } catch (err) {
        console.warn('[EasyRide DB] Error loading seed dataset, initializing default demo users:', err);
        this.createDefaultDemoUsers();
      }
    } else {
      this.createDefaultDemoUsers();
    }

    this.initialized = true;
  }

  private createDefaultDemoUsers() {
    // Default Customer
    const cust: User = {
      id: 'usr-cust-demo',
      name: 'Priya Sharma (Customer Demo)',
      email: 'customer@easyride.com',
      phone: '+919876543210',
      role: 'CUSTOMER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(cust.id, cust);

    // Default Driver
    const drvUser: User = {
      id: 'usr-drv-demo',
      name: 'Vikram Rao (Driver Demo)',
      email: 'driver@easyride.com',
      phone: '+919988776655',
      role: 'DRIVER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(drvUser.id, drvUser);

    const vehicle: Vehicle = {
      id: 'veh-demo',
      driverId: 'drv-demo',
      type: 'SEDAN',
      brand: 'Honda',
      model: 'City',
      registrationNumber: 'KA-01-AB-1234',
      capacity: 4,
      status: 'ACTIVE',
    };
    this.vehicles.set(vehicle.id, vehicle);

    const drvProfile: DriverProfile = {
      id: 'drv-demo',
      userId: drvUser.id,
      licenseNumber: 'KA-01-2022-998811',
      status: 'ONLINE',
      rating: 4.9,
      acceptanceRate: 96,
      cancellationRate: 1,
      totalTrips: 450,
      totalEarnings: 84500,
      currentLat: 12.9352,
      currentLng: 77.6245,
      heading: 90,
      speed: 15,
      lastLocationAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      vehicle,
      user: drvUser,
    };
    this.driverProfiles.set(drvProfile.id, drvProfile);

    // Default Business
    const bizUser: User = {
      id: 'usr-biz-demo',
      name: 'Apex Quick Commerce (Demo)',
      email: 'business@easyride.com',
      phone: '+918877665544',
      role: 'BUSINESS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(bizUser.id, bizUser);

    const biz: Business = {
      id: 'biz-demo',
      userId: bizUser.id,
      companyName: 'Apex Quick Commerce',
      industry: 'Quick Commerce',
      apiKeyHash: 'hash_er_demo_key',
      apiKeyPrefix: 'er_live_demo',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    this.businesses.set(biz.id, biz);

    // Admin
    const admin: User = {
      id: 'usr-admin-demo',
      name: 'Operations Admin',
      email: 'admin@easyride.com',
      phone: '+919000000000',
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(admin.id, admin);
  }

  // Geospatial radius search helper
  public findOnlineDriversNear(lat: number, lng: number, maxRadiusKm = 5.0, vehicleType?: string): DriverProfile[] {
    const list: DriverProfile[] = [];
    this.driverProfiles.forEach((drv) => {
      if (drv.status !== 'ONLINE') return;
      if (vehicleType && drv.vehicle?.type !== vehicleType) return;

      const dKm = haversineDistanceKm(lat, lng, drv.currentLat, drv.currentLng);
      if (dKm <= maxRadiusKm) {
        list.push(drv);
      }
    });
    return list;
  }
}

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// Haversine spatial distance formula in kilometers
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return round2(R * c);
}

export function round2(num: number): number {
  return Math.round(num * 100) / 100;
}

export const db = new EasyRideDatabase();
