import { Booking, DriverProfile, ScoredDriverCandidate, DispatchAttempt } from '@easyride/shared-types';
import { DISPATCH_WEIGHTS, SERVICE_CATEGORIES } from '@easyride/config';
import { db, haversineDistanceKm, round2 } from '../db';
import { MLService } from './ml.service';
import { ENV } from '../config/env';
import { io } from '../index';

export class DispatchService {
  public static async findAndScoreDrivers(booking: Booking, maxRadiusKm = 6.0): Promise<ScoredDriverCandidate[]> {
    // 1. Hard Constraints Check
    const serviceCategory = SERVICE_CATEGORIES.find((s) => s.id === booking.serviceTypeId);
    const requiredVehicles = serviceCategory ? serviceCategory.allowedVehicles : [];

    const candidates = db.findOnlineDriversNear(
      booking.pickup.lat,
      booking.pickup.lng,
      maxRadiusKm
    ).filter((drv) => {
      // Must be ONLINE
      if (drv.status !== 'ONLINE') return false;
      // Vehicle compatibility
      if (requiredVehicles.length > 0 && drv.vehicle && !requiredVehicles.includes(drv.vehicle.type)) {
        return false;
      }
      return true;
    });

    if (candidates.length === 0) {
      // Expand radius if no driver found
      const fallbackCandidates = db.findOnlineDriversNear(booking.pickup.lat, booking.pickup.lng, maxRadiusKm * 1.8);
      candidates.push(...fallbackCandidates);
    }

    // 2. Multi-Metric Soft Scoring
    const scoredCandidates: ScoredDriverCandidate[] = [];

    for (const drv of candidates) {
      const distanceKm = haversineDistanceKm(drv.currentLat, drv.currentLng, booking.pickup.lat, booking.pickup.lng);
      const etaMin = Math.max(2, Math.ceil(distanceKm * 3.0 + 1));

      // 0-1 Normalizations
      const proximityScore = Math.max(0, 1 - distanceKm / maxRadiusKm);
      const etaScore = Math.max(0, 1 - etaMin / 15);

      const acceptancePred = await MLService.predictDriverAcceptance(drv.id, booking.id);
      const acceptanceProb = acceptancePred.probability;

      // Utilization score (favor drivers who haven't worked too many trips today to balance supply)
      const utilizationRate = Math.min(1.0, (drv.totalTrips % 15) / 15);
      const utilizationScore = 1.0 - utilizationRate;

      // Earnings score (fair dispatch distribution: lower earnings today get higher priority)
      const earningsScore = Math.max(0, 1.0 - Math.min(drv.totalEarnings, 5000) / 5000);

      // Destination demand score (encourage trips towards high demand zones)
      const destinationDemandScore = 0.8;

      // Master Formula:
      // score = 0.30 * proximity + 0.20 * eta + 0.20 * acceptance + 0.15 * utilization + 0.10 * earnings + 0.05 * destination
      const finalScore = round2(
        DISPATCH_WEIGHTS.proximity * proximityScore +
          DISPATCH_WEIGHTS.eta * etaScore +
          DISPATCH_WEIGHTS.acceptanceProb * acceptanceProb +
          DISPATCH_WEIGHTS.utilization * utilizationScore +
          DISPATCH_WEIGHTS.earnings * earningsScore +
          DISPATCH_WEIGHTS.destinationDemand * destinationDemandScore
      );

      scoredCandidates.push({
        driverId: drv.id,
        driverName: drv.user?.name || 'Partner Driver',
        phone: drv.user?.phone || '+919900000000',
        rating: drv.rating,
        vehicleType: drv.vehicle?.type || 'SEDAN',
        distanceKm,
        etaMin,
        acceptanceProbability: acceptanceProb,
        utilizationRate: round2(utilizationRate),
        todayEarnings: drv.totalEarnings,
        destinationDemandScore,
        finalScore,
      });
    }

    // Sort descending by highest score
    scoredCandidates.sort((a, b) => b.finalScore - a.finalScore);
    return scoredCandidates;
  }

  public static async executeDispatch(bookingId: string): Promise<boolean> {
    const booking = db.bookings.get(bookingId);
    if (!booking) return false;

    booking.status = 'SEARCHING';
    db.bookings.set(bookingId, booking);

    // Emit search status to booking room
    if (io) {
      io.to(`booking:${bookingId}`).emit('booking:searching', { bookingId, status: 'SEARCHING' });
    }

    const scoredCandidates = await this.findAndScoreDrivers(booking);

    if (scoredCandidates.length === 0) {
      console.warn(`[Dispatch Engine] No eligible drivers found near pickup for booking ${bookingId}`);
      return false;
    }

    // Pick top candidate
    const chosenCandidate = scoredCandidates[0];
    const driver = db.driverProfiles.get(chosenCandidate.driverId);

    if (!driver) return false;

    // Record dispatch attempt
    const attempt: DispatchAttempt = {
      id: `disp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      bookingId,
      driverId: driver.id,
      distanceToPickupKm: chosenCandidate.distanceKm,
      etaMinutes: chosenCandidate.etaMin,
      acceptanceProbability: chosenCandidate.acceptanceProbability,
      score: chosenCandidate.finalScore,
      result: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    db.dispatchAttempts.push(attempt);

    // Notify Driver via Socket.IO
    if (io) {
      io.to(`driver:${driver.id}`).emit('dispatch:request', {
        bookingId: booking.id,
        serviceCategory: booking.serviceCategory,
        pickup: booking.pickup,
        dropoff: booking.dropoff,
        distanceKm: booking.distanceKm,
        estimatedEarning: Math.round(booking.fare.finalFare * 0.85),
        etaToPickup: chosenCandidate.etaMin,
        score: chosenCandidate.finalScore,
      });
    }

    return true;
  }

  public static async handleDriverAcceptance(bookingId: string, driverId: string): Promise<boolean> {
    const booking = db.bookings.get(bookingId);
    const driver = db.driverProfiles.get(driverId);

    if (!booking || !driver) return false;

    booking.driverId = driver.id;
    booking.status = 'DRIVER_ASSIGNED';
    booking.acceptedAt = new Date().toISOString();
    booking.driver = driver;
    booking.otp = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit OTP for trip start

    driver.status = 'IN_TRIP';
    db.driverProfiles.set(driver.id, driver);
    db.bookings.set(booking.id, booking);

    // Update dispatch attempt result
    const lastAttempt = db.dispatchAttempts.find((a) => a.bookingId === bookingId && a.driverId === driverId);
    if (lastAttempt) lastAttempt.result = 'ACCEPTED';

    if (io) {
      io.to(`booking:${bookingId}`).emit('booking:driver_assigned', {
        bookingId,
        driver: {
          id: driver.id,
          name: driver.user?.name,
          phone: driver.user?.phone,
          rating: driver.rating,
          vehicle: driver.vehicle,
          currentLat: driver.currentLat,
          currentLng: driver.currentLng,
        },
        otp: booking.otp,
        status: 'DRIVER_ASSIGNED',
      });
    }

    return true;
  }
}
