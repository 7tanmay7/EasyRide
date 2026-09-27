import { SERVICE_CATEGORIES, SURGE_CONFIG, BENGALURU_ZONES } from '@easyride/config';
import { BookingFareBreakdown, LocationPoint } from '@easyride/shared-types';
import { db, haversineDistanceKm, round2 } from '../db';

export class PricingService {
  public static calculateFare(
    serviceTypeId: string,
    pickup: LocationPoint,
    dropoff: LocationPoint
  ): BookingFareBreakdown {
    const service = SERVICE_CATEGORIES.find((s) => s.id === serviceTypeId) || SERVICE_CATEGORIES[0];

    // Distance calculation
    const distanceKm = haversineDistanceKm(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
    // Rough estimation of duration: 1 km ~ 3 minutes + 2 mins traffic buffer
    const durationMin = Math.max(5, Math.ceil(distanceKm * 3.2 + 2));

    const baseFare = service.baseFare;
    const distanceFare = round2(distanceKm * service.perKmRate);
    const timeFare = round2(durationMin * service.perMinuteRate);

    // Calculate surge multiplier based on pickup zone DSR
    const surgeMultiplier = this.calculateSurgeMultiplier(pickup);

    const subtotal = round2(baseFare + distanceFare + timeFare);
    const subtotalWithSurge = round2(subtotal * surgeMultiplier);
    const finalFare = Math.max(service.minFare, subtotalWithSurge);

    return {
      baseFare,
      distanceFare,
      timeFare,
      surgeMultiplier,
      discount: 0,
      subtotal,
      finalFare,
    };
  }

  private static calculateSurgeMultiplier(pickup: LocationPoint): number {
    // Match pickup to Bengaluru zone
    const matchedZone = BENGALURU_ZONES.find((z) => {
      const d = haversineDistanceKm(pickup.lat, pickup.lng, z.center[0], z.center[1]);
      return d <= 3.0;
    });

    if (!matchedZone) return 1.0;

    const zoneState = db.demandZones.get(matchedZone.id);
    if (!zoneState) return 1.0;

    const dsr = zoneState.demandSupplyRatio;
    let multiplier = 1.0;

    if (dsr < 1.2) {
      multiplier = 1.0;
    } else if (dsr < 1.5) {
      multiplier = 1.1;
    } else if (dsr < 2.0) {
      multiplier = 1.3;
    } else {
      multiplier = 1.5;
    }

    return Math.min(SURGE_CONFIG.MAX_MULTIPLIER, Math.max(SURGE_CONFIG.MIN_MULTIPLIER, multiplier));
  }
}
