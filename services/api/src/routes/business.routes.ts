import { Router, Request, Response } from 'express';
import { CreateBusinessDeliverySchema } from '@easyride/validation';
import { DeliveryJob, Booking } from '@easyride/shared-types';
import { db } from '../db';
import { PricingService } from '../services/pricing.service';
import { DispatchService } from '../services/dispatch.service';

export const businessRouter = Router();

businessRouter.get('/dashboard', (req: Request, res: Response) => {
  const businessId = (req.query.businessId as string) || 'biz-demo';
  const jobs = Array.from(db.deliveryJobs.values()).filter((j) => j.businessId === businessId);

  const completed = jobs.filter((j) => j.status === 'DELIVERED').length;
  const active = jobs.filter((j) => j.status === 'DISPATCHED' || j.status === 'ASSIGNED').length;
  const pending = jobs.filter((j) => j.status === 'PENDING').length;

  return res.json({
    success: true,
    data: {
      totalDeliveries: jobs.length,
      activeDeliveries: active,
      completedDeliveries: completed,
      pendingDeliveries: pending,
      avgDeliveryTimeMin: 22,
      completionRatePercent: jobs.length > 0 ? Math.round((completed / jobs.length) * 100) : 98,
      apiKeyPrefix: 'er_live_apex01',
    },
  });
});

businessRouter.post('/deliveries', async (req: Request, res: Response) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : [req.body];
    const createdJobs: DeliveryJob[] = [];

    for (const item of payload) {
      const parse = CreateBusinessDeliverySchema.safeParse(item);
      if (!parse.success) {
        return res.status(400).json({ success: false, message: 'Invalid payload item', error: parse.error.format() });
      }

      const { orderReference, priority, packageSize, packageWeightKg, pickup, dropoff } = parse.data;
      const businessId = (req.body.businessId as string) || 'biz-demo';

      // Create linked booking
      const fare = PricingService.calculateFare('service-qcommerce', pickup, dropoff);
      const bookingId = `bk-biz-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const booking: Booking = {
        id: bookingId,
        customerId: 'usr-cust-demo',
        businessId,
        serviceTypeId: 'service-qcommerce',
        serviceCategory: 'QUICK_COMMERCE',
        pickup,
        dropoff,
        distanceKm: fare.distanceFare / 10,
        estimatedDurationMin: 20,
        fare,
        status: 'REQUESTED',
        businessReference: orderReference,
        requestedAt: new Date().toISOString(),
      };
      db.bookings.set(booking.id, booking);

      const jobId = `job-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const job: DeliveryJob = {
        id: jobId,
        businessId,
        bookingId: booking.id,
        orderReference,
        priority,
        packageSize,
        packageWeightKg,
        pickup,
        dropoff,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      db.deliveryJobs.set(job.id, job);
      createdJobs.push(job);

      // Execute dispatch
      DispatchService.executeDispatch(booking.id);
    }

    return res.status(201).json({
      success: true,
      message: `${createdJobs.length} delivery job(s) dispatches initiated`,
      data: createdJobs.length === 1 ? createdJobs[0] : createdJobs,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

businessRouter.get('/deliveries', (req: Request, res: Response) => {
  const businessId = (req.query.businessId as string) || 'biz-demo';
  const jobs = Array.from(db.deliveryJobs.values()).filter((j) => j.businessId === businessId);
  return res.json({ success: true, data: jobs });
});

businessRouter.get('/analytics', (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      dailyVolume: [
        { day: 'Mon', count: 120 },
        { day: 'Tue', count: 145 },
        { day: 'Wed', count: 160 },
        { day: 'Thu', count: 155 },
        { day: 'Fri', count: 210 },
        { day: 'Sat', count: 240 },
        { day: 'Sun', count: 190 },
      ],
      costPerOrderAvg: 85.5,
      avgCompletionTime: '21.4 min',
      slaComplianceRate: '99.2%',
    },
  });
});
