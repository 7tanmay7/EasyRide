import { BENGALURU_ZONES } from '@easyride/config';
import { LocationPoint } from '@easyride/shared-types';
import { haversineDistanceKm, round2 } from '../db';

export interface RouteResult {
  distanceKm: number;
  durationMin: number;
  polyline: [number, number][]; // Array of [lat, lng]
}

export class MapsService {
  // 1. Nominatim OpenStreetMap Geocoding API
  public static async geocode(addressQuery: string): Promise<LocationPoint[]> {
    const q = addressQuery.trim();
    const results: LocationPoint[] = [];

    try {
      // Query OpenStreetMap Nominatim Free API
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ', Bengaluru, India')}&limit=5`;
      const res = await fetch(searchUrl, {
        headers: { 'User-Agent': 'EasyRide-Mobility-App/1.0' },
      });

      if (res.ok) {
        const data = (await res.json()) as any[];
        if (Array.isArray(data) && data.length > 0) {
          data.forEach((item) => {
            results.push({
              address: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              placeId: `osm-${item.place_id}`,
              zoneId: this.findNearestZoneId(parseFloat(item.lat), parseFloat(item.lon)),
            });
          });
        }
      }
    } catch (e) {
      console.warn('[Nominatim Geocoder Fallback]', e);
    }

    // Local Bengaluru fallback if Nominatim API fails or has no match
    if (results.length === 0) {
      BENGALURU_ZONES.forEach((zone) => {
        if (zone.name.toLowerCase().includes(q.toLowerCase()) || q.toLowerCase().includes(zone.name.toLowerCase().split(' ')[0])) {
          results.push({
            address: `${zone.name}, Bengaluru, Karnataka`,
            lat: zone.center[0],
            lng: zone.center[1],
            placeId: `place-${zone.id}`,
            zoneId: zone.id,
          });
        }
      });

      if (results.length === 0) {
        const targetZone = BENGALURU_ZONES[0];
        results.push({
          address: `${q}, ${targetZone.name}, Bengaluru`,
          lat: targetZone.center[0] + (Math.random() - 0.5) * 0.02,
          lng: targetZone.center[1] + (Math.random() - 0.5) * 0.02,
          placeId: `place-gen-${Date.now()}`,
          zoneId: targetZone.id,
        });
      }
    }

    return results;
  }

  // 2. Nominatim Reverse Geocoding API
  public static async reverseGeocode(lat: number, lng: number): Promise<LocationPoint> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'EasyRide-Mobility-App/1.0' },
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        if (data && data.display_name) {
          return {
            address: data.display_name,
            lat: round2(lat),
            lng: round2(lng),
            placeId: `osm-${data.place_id}`,
            zoneId: this.findNearestZoneId(lat, lng),
          };
        }
      }
    } catch (e) {
      // Fallback
    }

    const nearestZone = this.findNearestZone(lat, lng);
    return {
      address: `${nearestZone.name}, Bengaluru (${round2(lat)}, ${round2(lng)})`,
      lat: round2(lat),
      lng: round2(lng),
      placeId: `place-${nearestZone.id}`,
      zoneId: nearestZone.id,
    };
  }

  // 3. OSRM (Open Source Routing Machine) Turn-by-Turn Real Road Routing API
  public static async getRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): Promise<RouteResult> {
    try {
      // OSRM expects coordinates as: lng,lat;lng,lat
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
      const res = await fetch(osrmUrl);

      if (res.ok) {
        const data = (await res.json()) as any;
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distKm = round2(route.distance / 1000);
          const durationMin = Math.max(3, Math.ceil(route.duration / 60));

          // GeoJSON coordinates are [lng, lat], convert to Leaflet [lat, lng]
          const polyline: [number, number][] = route.geometry.coordinates.map((coord: [number, number]) => [
            round2(coord[1]),
            round2(coord[0]),
          ]);

          return {
            distanceKm: distKm,
            durationMin,
            polyline,
          };
        }
      }
    } catch (e) {
      console.warn('[OSRM Router Fallback]', e);
    }

    // Haversine route fallback
    const dist = haversineDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
    const durationMin = Math.max(4, Math.ceil(dist * 3.2 + 2));

    const points: [number, number][] = [];
    const steps = Math.max(5, Math.ceil(dist * 2));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lat = origin.lat + (destination.lat - origin.lat) * t;
      const lng = origin.lng + (destination.lng - origin.lng) * t;
      points.push([round2(lat), round2(lng)]);
    }

    return {
      distanceKm: dist,
      durationMin,
      polyline: points,
    };
  }

  private static findNearestZone(lat: number, lng: number) {
    let closest = BENGALURU_ZONES[0];
    let minD = Infinity;

    BENGALURU_ZONES.forEach((z) => {
      const d = haversineDistanceKm(lat, lng, z.center[0], z.center[1]);
      if (d < minD) {
        minD = d;
        closest = z;
      }
    });

    return closest;
  }

  private static findNearestZoneId(lat: number, lng: number): string {
    return this.findNearestZone(lat, lng).id;
  }
}
