import { Router, Request, Response } from 'express';
import { EstimatePricingSchema } from '@easyride/validation';
import { PricingService } from '../services/pricing.service';
import { SERVICE_CATEGORIES } from '@easyride/config';

export const pricingRouter = Router();

pricingRouter.post('/estimate', (req: Request, res: Response) => {
  try {
    const parse = EstimatePricingSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, message: 'Invalid payload', error: parse.error.format() });
    }

    const { serviceCategory, pickup, dropoff } = parse.data;

    // Filter available services for requested category
    const categoryServices = SERVICE_CATEGORIES.filter((s) => s.category === serviceCategory);

    const estimates = categoryServices.map((service) => {
      const fare = PricingService.calculateFare(service.id, pickup, dropoff);
      return {
        serviceId: service.id,
        serviceName: service.name,
        description: service.description,
        allowedVehicles: service.allowedVehicles,
        fareBreakdown: fare,
        etaMinutes: Math.max(3, Math.floor(Math.random() * 5 + 3)),
      };
    });

    return res.json({ success: true, data: estimates });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
