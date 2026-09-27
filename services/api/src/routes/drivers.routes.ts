import { Router, Request, Response } from 'express';
import { DriverLocationBroadcastSchema } from '@easyride/validation';
import { db } from '../db';
import { redis } from '../redis';
import { DispatchService } from '../services/dispatch.service';
import { io } from '../index';

export const driversRouter = Router();

driversRouter.get('/me', (req: Request, res: Response) => {
  const driverId = (req.query.driverId as string) || 'drv-demo';
  const driver = db.driverProfiles.get(driverId) || Array.from(db.driverProfiles.values())[0];

  if (!driver) {
    return res.status(404).json({ success: false, message: 'Driver profile not found' });
  }

  return res.json({ success: true, data: driver });
});

driversRouter.post('/go-online', (req: Request, res: Response) => {
  const { driverId } = req.body;
  const targetId = driverId || Array.from(db.driverProfiles.keys())[0];
  const driver = db.driverProfiles.get(targetId);

  if (!driver) {
    return res.status(404).json({ success: false, message: 'Driver not found' });
  }

  driver.status = 'ONLINE';
  db.driverProfiles.set(driver.id, driver);

  redis.setDriverLocation(driver.id, driver.currentLat, driver.currentLng, 'ONLINE');

  if (io) {
    io.emit('driver:online', { driverId: driver.id, lat: driver.currentLat, lng: driver.currentLng });
  }

  return res.json({ success: true, message: 'Driver is now ONLINE', data: driver });
});

driversRouter.post('/go-offline', (req: Request, res: Response) => {
  const { driverId } = req.body;
  const targetId = driverId || Array.from(db.driverProfiles.keys())[0];
  const driver = db.driverProfiles.get(targetId);

  if (!driver) {
    return res.status(404).json({ success: false, message: 'Driver not found' });
  }

  driver.status = 'OFFLINE';
  db.driverProfiles.set(driver.id, driver);

  redis.setDriverLocation(driver.id, driver.currentLat, driver.currentLng, 'OFFLINE');

  if (io) {
    io.emit('driver:offline', { driverId: driver.id });
  }

  return res.json({ success: true, message: 'Driver is now OFFLINE', data: driver });
});

driversRouter.post('/location', async (req: Request, res: Response) => {
  try {
    const parse = DriverLocationBroadcastSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, message: 'Invalid location payload' });
    }

    const { driverId, lat, lng, heading, speed } = parse.data;
    const driver = db.driverProfiles.get(driverId);

    if (driver) {
      driver.currentLat = lat;
      driver.currentLng = lng;
      if (heading !== undefined) driver.heading = heading;
      if (speed !== undefined) driver.speed = speed;
      driver.lastLocationAt = new Date().toISOString();

      db.driverProfiles.set(driver.id, driver);
      await redis.setDriverLocation(driver.id, lat, lng, driver.status, heading, speed);

      // Emit live driver location through Socket.IO
      if (io) {
        io.emit('driver:location', { driverId: driver.id, lat, lng, heading, speed });
      }
    }

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

driversRouter.get('/jobs', (req: Request, res: Response) => {
  const driverId = (req.query.driverId as string) || 'drv-demo';
  const driver = db.driverProfiles.get(driverId);

  // Find active searching/requested bookings
  const pendingBookings = Array.from(db.bookings.values()).filter(
    (b) => b.status === 'SEARCHING' || b.status === 'REQUESTED' || b.driverId === driverId
  );

  return res.json({ success: true, data: pendingBookings });
});

driversRouter.post('/jobs/:id/accept', async (req: Request, res: Response) => {
  const bookingId = req.params.id;
  const { driverId } = req.body;
  const targetDriverId = driverId || 'drv-demo';

  const success = await DispatchService.handleDriverAcceptance(bookingId, targetDriverId);
  if (!success) {
    return res.status(400).json({ success: false, message: 'Failed to accept job' });
  }

  const booking = db.bookings.get(bookingId);
  return res.json({ success: true, message: 'Job accepted successfully', data: booking });
});

driversRouter.post('/jobs/:id/reject', (req: Request, res: Response) => {
  const bookingId = req.params.id;
  const { driverId } = req.body;

  const attempt = db.dispatchAttempts.find((a) => a.bookingId === bookingId && a.driverId === driverId);
  if (attempt) attempt.result = 'REJECTED';

  // Trigger fallback dispatch to next best driver
  const booking = db.bookings.get(bookingId);
  if (booking) {
    DispatchService.executeDispatch(booking.id);
  }

  return res.json({ success: true, message: 'Job rejected' });
});

driversRouter.post('/jobs/:id/arrived', (req: Request, res: Response) => {
  const bookingId = req.params.id;
  const booking = db.bookings.get(bookingId);

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  booking.status = 'DRIVER_ARRIVED';
  db.bookings.set(booking.id, booking);

  if (io) {
    io.to(`booking:${bookingId}`).emit('booking:driver_arrived', { bookingId, status: 'DRIVER_ARRIVED' });
  }

  return res.json({ success: true, message: 'Driver arrived at pickup', data: booking });
});

driversRouter.post('/jobs/:id/start', (req: Request, res: Response) => {
  const bookingId = req.params.id;
  const { otp } = req.body;
  const booking = db.bookings.get(bookingId);

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  if (booking.otp && otp && booking.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid start OTP' });
  }

  booking.status = 'IN_PROGRESS';
  booking.startedAt = new Date().toISOString();
  db.bookings.set(booking.id, booking);

  if (io) {
    io.to(`booking:${bookingId}`).emit('booking:started', { bookingId, status: 'IN_PROGRESS' });
  }

  return res.json({ success: true, message: 'Trip started', data: booking });
});

driversRouter.post('/jobs/:id/complete', (req: Request, res: Response) => {
  const bookingId = req.params.id;
  const booking = db.bookings.get(bookingId);

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  booking.status = 'COMPLETED';
  booking.completedAt = new Date().toISOString();
  db.bookings.set(booking.id, booking);

  // Update driver earnings & trip stats
  if (booking.driverId) {
    const driver = db.driverProfiles.get(booking.driverId);
    if (driver) {
      driver.status = 'ONLINE';
      driver.totalTrips += 1;
      driver.totalEarnings += Math.round(booking.fare.finalFare * 0.85);
      db.driverProfiles.set(driver.id, driver);
    }
  }

  if (io) {
    io.to(`booking:${bookingId}`).emit('booking:completed', { bookingId, status: 'COMPLETED', fare: booking.fare });
  }

  return res.json({ success: true, message: 'Trip completed successfully', data: booking });
});
