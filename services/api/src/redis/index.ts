// Redis Cache & Live Geospatial Location Store (with In-Memory Fallback)

interface DriverLocationCache {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  status: string;
  updatedAt: string;
}

class RedisStore {
  private locationMap: Map<string, DriverLocationCache> = new Map();
  private cacheMap: Map<string, { value: any; expiresAt: number }> = new Map();

  public async setDriverLocation(
    driverId: string,
    lat: number,
    lng: number,
    status: string,
    heading?: number,
    speed?: number
  ): Promise<void> {
    this.locationMap.set(driverId, {
      driverId,
      lat,
      lng,
      heading,
      speed,
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  public async getDriverLocation(driverId: string): Promise<DriverLocationCache | undefined> {
    return this.locationMap.get(driverId);
  }

  public async getActiveDrivers(): Promise<DriverLocationCache[]> {
    return Array.from(this.locationMap.values()).filter((d) => d.status === 'ONLINE');
  }

  public async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : Infinity;
    this.cacheMap.set(key, { value, expiresAt });
  }

  public async get(key: string): Promise<any | null> {
    const item = this.cacheMap.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cacheMap.delete(key);
      return null;
    }
    return item.value;
  }
}

export const redis = new RedisStore();
