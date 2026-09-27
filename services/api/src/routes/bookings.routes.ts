import { Router, Request, Response } from 'express';
import { CreateBookingSchema } from '@easyride/validation';
import { Booking } from '@easyride/shared-types';
import { db, haversineDistanceKm } from '../db';
import { PricingService } from '../services/pricing.service';
import { DispatchService } from '../services/dispatch.service';
import { io } from '../index';

export const bookingsRouter = Router();

bookingsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const parse = CreateBookingSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, message: 'Validation error', error: parse.error.format() });
    }

    const { serviceTypeId, serviceCategory, pickup, dropoff, packageDetails, businessReference } = parse.data;
    const customerId = (req.body.customerId as string) || 'usr-cust-demo';

    const fare = PricingService.calculateFare(serviceTypeId, pickup, dropoff);
    const distanceKm = haversineDistanceKm(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
    const estimatedDurationMin = Math.max(5, Math.ceil(distanceKm * 3.2 + 2));

    const bookingId = `bk-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newBooking: Booking = {
      id: bookingId,
      customerId,
      serviceTypeId,
      serviceCategory,
      pickup,
      dropoff,
      distanceKm,
      estimatedDurationMin,
      fare,
      status: 'REQUESTED',
      packageDetails,
      businessReference,
      requestedAt: new Date().toISOString(),
    };

    db.bookings.set(newBooking.id, newBooking);

    // Record creation event
    db.bookingEvents.push({
      id: `evt-${Date.now()}`,
      bookingId: newBooking.id,
      eventType: 'REQUESTED',
      actorId: customerId,
      createdAt: new Date().toISOString(),
    });

    if (io) {
      io.emit('booking:created', { bookingId: newBooking.id, booking: newBooking });
    }

    // Trigger Intelligent Dispatch Engine immediately
    setTimeout(() => {
      DispatchService.executeDispatch(newBooking.id);
    }, 500);

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully and dispatch initiated',
      data: newBooking,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

bookingsRouter.get('/history', (req: Request, res: Response) => {
  const customerId = req.query.customerId as string;
  let list = Array.from(db.bookings.values());

  if (customerId) {
    list = list.filter((b) => b.customerId === customerId);
  }

  list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  return res.json({ success: true, data: list });
});

bookingsRouter.get('/:id', (req: Request, res: Response) => {
  const bookingId = req.params.id;
  const booking = db.bookings.get(bookingId);

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  return res.json({ success: true, data: booking });
});

bookingsRouter.post('/:id/cancel', (req: Request, res: Response) => {
  const bookingId = req.params.id;
  const { reason } = req.body;
  const booking = db.bookings.get(bookingId);

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  booking.status = 'CANCELLED';
  booking.cancelledAt = new Date().toISOString();
  booking.cancelReason = reason || 'Customer cancelled';

  if (booking.driverId) {
    const driver = db.driverProfiles.get(booking.driverId);
    if (driver) {
      driver.status = 'ONLINE';
      db.driverProfiles.set(driver.id, driver);
    }
  }

  db.bookings.set(booking.id, booking);

  if (io) {
    io.to(`booking:${bookingId}`).emit('booking:cancelled', { bookingId, reason: booking.cancelReason });
  }

  return res.json({ success: true, message: 'Booking cancelled', data: booking });
});
