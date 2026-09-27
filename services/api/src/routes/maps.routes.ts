import { Router, Request, Response } from 'express';
import { MapsService } from '../services/maps.service';

export const mapsRouter = Router();

mapsRouter.get('/geocode', async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  if (!query) return res.status(400).json({ success: false, message: 'Query parameter q required' });

  const results = await MapsService.geocode(query);
  return res.json({ success: true, data: results });
});

mapsRouter.get('/reverse-geocode', async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ success: false, message: 'Invalid lat/lng parameters' });
  }

  const result = await MapsService.reverseGeocode(lat, lng);
  return res.json({ success: true, data: result });
});

mapsRouter.get('/route', async (req: Request, res: Response) => {
  const originLat = parseFloat(req.query.originLat as string);
  const originLng = parseFloat(req.query.originLng as string);
  const destLat = parseFloat(req.query.destLat as string);
  const destLng = parseFloat(req.query.destLng as string);

  if (isNaN(originLat) || isNaN(originLng) || isNaN(destLat) || isNaN(destLng)) {
    return res.status(400).json({ success: false, message: 'Invalid route coordinates' });
  }

  const route = await MapsService.getRoute({ lat: originLat, lng: originLng }, { lat: destLat, lng: destLng });
  return res.json({ success: true, data: route });
});
