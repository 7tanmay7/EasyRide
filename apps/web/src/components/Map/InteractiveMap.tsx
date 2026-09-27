import React, { useEffect, useRef } from 'react';
import { LocationPoint, DriverProfile, DemandZoneState } from '@easyride/shared-types';

interface InteractiveMapProps {
  center?: [number, number];
  zoom?: number;
  pickup?: LocationPoint | null;
  dropoff?: LocationPoint | null;
  drivers?: DriverProfile[];
  zones?: DemandZoneState[];
  polyline?: [number, number][];
  onLocationSelect?: (lat: number, lng: number) => void;
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  center = [12.9352, 77.6245], // Default Koramangala, Bengaluru
  zoom = 13,
  pickup,
  dropoff,
  drivers = [],
  zones = [],
  polyline = [],
  onLocationSelect,
  className = 'h-full w-full min-h-[380px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Dynamically load Leaflet instance
    import('leaflet').then((L) => {
      if (mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current!, {
        center,
        zoom,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add official free OpenStreetMap tile layer (No watermark, 100% free)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      map.on('click', (e: any) => {
        if (onLocationSelect) {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map layers whenever props change
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    import('leaflet').then((L) => {
      const layerGroup = layerGroupRef.current;
      layerGroup.clearLayers();

      // 1. Render Demand Zones
      zones.forEach((zone) => {
        if (zone.bounds && zone.bounds.length > 0) {
          let fillColor = '#10B981'; // GREEN for BALANCED
          if (zone.status === 'HIGH') fillColor = '#F59E0B'; // AMBER
          if (zone.status === 'CRITICAL') fillColor = '#EF4444'; // RED

          const polygon = L.polygon(zone.bounds as any, {
            color: fillColor,
            weight: 1.5,
            fillColor: fillColor,
            fillOpacity: 0.15,
          });

          polygon.bindTooltip(`<b>${zone.name}</b><br/>Demand/Supply: ${zone.demandSupplyRatio}x (${zone.status})`);
          layerGroup.addLayer(polygon);
        }
      });

      // 2. Render Route Polyline
      if (polyline && polyline.length > 0) {
        const routeLine = L.polyline(polyline as any, {
          color: '#111111',
          weight: 5,
          opacity: 0.8,
          lineJoin: 'round',
        });
        layerGroup.addLayer(routeLine);
      } else if (pickup && dropoff) {
        const straightLine = L.polyline(
          [
            [pickup.lat, pickup.lng],
            [dropoff.lat, dropoff.lng],
          ],
          {
            color: '#2563EB',
            weight: 4,
            dashArray: '8, 8',
          }
        );
        layerGroup.addLayer(straightLine);
      }

      // 3. Render Pickup Marker
      if (pickup) {
        const pickupIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `<div class="bg-black text-white p-2 rounded-full shadow-lg border-2 border-white flex items-center justify-center font-bold text-xs w-8 h-8">📍</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        const m = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).bindPopup(`<b>Pickup Location</b><br/>${pickup.address}`);
        layerGroup.addLayer(m);
      }

      // 4. Render Dropoff Marker
      if (dropoff) {
        const dropIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `<div class="bg-emerald-600 text-white p-2 rounded-full shadow-lg border-2 border-white flex items-center justify-center font-bold text-xs w-8 h-8">🏁</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        const m = L.marker([dropoff.lat, dropoff.lng], { icon: dropIcon }).bindPopup(`<b>Dropoff Location</b><br/>${dropoff.address}`);
        layerGroup.addLayer(m);
      }

      // 5. Render Drivers
      drivers.forEach((drv) => {
        const vType = drv.vehicle?.type || 'SEDAN';
        let emoji = '🚗';
        if (vType === 'BIKE' || vType === 'SCOOTER') emoji = '🛵';
        if (vType === 'AUTO') emoji = '🛺';
        if (vType === 'VAN' || vType === 'TRUCK') emoji = '🚚';

        const driverIcon = L.divIcon({
          className: 'custom-driver-icon',
          html: `<div class="bg-white text-black p-1 rounded-full shadow-md border-2 border-slate-900 text-sm w-7 h-7 flex items-center justify-center">${emoji}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const m = L.marker([drv.currentLat, drv.currentLng], { icon: driverIcon }).bindPopup(
          `<b>${drv.user?.name || 'Driver'}</b><br/>Vehicle: ${vType}<br/>Rating: ⭐${drv.rating}`
        );
        layerGroup.addLayer(m);
      });

      // Recenter bounds if pickup and dropoff present
      if (pickup && dropoff) {
        const bounds = L.latLngBounds([
          [pickup.lat, pickup.lng],
          [dropoff.lat, dropoff.lng],
        ]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    });
  }, [pickup, dropoff, drivers, zones, polyline]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border shadow-sm ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full bg-slate-100 min-h-[380px]" />
    </div>
  );
};
