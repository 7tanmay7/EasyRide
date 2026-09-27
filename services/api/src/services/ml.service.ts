import {
  CancellationRiskPrediction,
  DemandForecastPrediction,
  DriverAcceptancePrediction,
} from '@easyride/shared-types';
import { db, haversineDistanceKm } from '../db';
import { BENGALURU_ZONES } from '@easyride/config';
import { ENV } from '../config/env';

export class MLService {
  public static async predictCancellation(bookingId: string): Promise<CancellationRiskPrediction> {
    const booking = db.bookings.get(bookingId);
    if (!booking) {
      return { probability: 0.15, riskLevel: 'LOW', factors: ['Default historical low risk'] };
    }

    // Try calling Python ML service if available
    try {
      const res = await fetch(`${ENV.ML_SERVICE_URL}/predict/cancellation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking }),
      });
      if (res.ok) {
        return (await res.json()) as CancellationRiskPrediction;
      }
    } catch (err) {
      // Graceful fallback to deterministic ML logic
    }

    // Deterministic cancellation scoring algorithm
    let prob = 0.08;
    const factors: string[] = [];

    if (booking.fare.surgeMultiplier > 1.3) {
      prob += 0.15;
      factors.push('High surge pricing multiplier');
    }
    if (booking.distanceKm > 15) {
      prob += 0.12;
      factors.push('Long distance route');
    }
    if (booking.estimatedDurationMin > 45) {
      prob += 0.10;
      factors.push('Traffic congestion / long duration');
    }

    const pickupZone = db.demandZones.get(booking.pickup.zoneId || '');
    if (pickupZone && pickupZone.demandSupplyRatio > 1.8) {
      prob += 0.14;
      factors.push('High demand-to-supply ratio at pickup zone');
    }

    prob = Math.min(0.95, Math.max(0.02, prob));

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (prob > 0.6) riskLevel = 'CRITICAL';
    else if (prob > 0.4) riskLevel = 'HIGH';
    else if (prob > 0.2) riskLevel = 'MEDIUM';

    return {
      bookingId,
      probability: Math.round(prob * 100) / 100,
      riskLevel,
      factors: factors.length > 0 ? factors : ['Normal trip parameters'],
    };
  }

  public static async forecastDemand(): Promise<DemandForecastPrediction[]> {
    const forecasts: DemandForecastPrediction[] = [];

    for (const zone of BENGALURU_ZONES) {
      const state = db.demandZones.get(zone.id);
      const curr = state ? state.currentDemand : Math.floor(zone.baseDemandFactor * 25);

      const pred30 = Math.round(curr * (1 + (Math.random() * 0.3 - 0.1)));
      const pred60 = Math.round(pred30 * (1 + (Math.random() * 0.2 - 0.05)));

      forecasts.push({
        zoneId: zone.id,
        zoneName: zone.name,
        currentDemand: curr,
        predictedDemand30m: pred30,
        predictedDemand60m: pred60,
        trend: pred30 > curr ? 'UP' : pred30 < curr ? 'DOWN' : 'STABLE',
        status: state ? state.status : 'BALANCED',
      });
    }

    return forecasts;
  }

  public static async predictDriverAcceptance(driverId: string, bookingId: string): Promise<DriverAcceptancePrediction> {
    const driver = db.driverProfiles.get(driverId);
    const booking = db.bookings.get(bookingId);

    if (!driver || !booking) {
      return { driverId, bookingId, probability: 0.85 };
    }

    const distToPickup = haversineDistanceKm(driver.currentLat, driver.currentLng, booking.pickup.lat, booking.pickup.lng);
    let prob = (driver.acceptanceRate / 100) * 0.6 + 0.4;

    if (distToPickup > 3.0) prob -= 0.15;
    if (booking.fare.finalFare > 300) prob += 0.10;

    return {
      driverId,
      bookingId,
      probability: Math.min(0.99, Math.max(0.2, Math.round(prob * 100) / 100)),
    };
  }
}
