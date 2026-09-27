import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger/swagger.json';

import { ENV } from './config/env';
import { db } from './db';
import { redis } from './redis';

import { authRouter } from './routes/auth.routes';
import { usersRouter } from './routes/users.routes';
import { driversRouter } from './routes/drivers.routes';
import { bookingsRouter } from './routes/bookings.routes';
import { pricingRouter } from './routes/pricing.routes';
import { mapsRouter } from './routes/maps.routes';
import { businessRouter } from './routes/business.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { genaiRouter } from './routes/genai.routes';

const app = express();
const server = http.createServer(app);

export const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

app.use(cors({ origin: ENV.CORS_ORIGIN }));
app.use(express.json());

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API v1 Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/drivers', driversRouter);
app.use('/api/v1/bookings', bookingsRouter);
app.use('/api/v1/pricing', pricingRouter);
app.use('/api/v1/maps', mapsRouter);
app.use('/api/v1/businesses', businessRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/genai', genaiRouter);

app.get('/health', (req: Request, res: Response) => {
  return res.json({
    status: 'OK',
    service: 'EasyRide API Engine',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Socket.IO Room Management & Event Handlers
io.on('connection', (socket) => {
  // Join user room
  socket.on('join:user', (userId: string) => {
    socket.join(`user:${userId}`);
  });

  // Join driver room
  socket.on('join:driver', (driverId: string) => {
    socket.join(`driver:${driverId}`);
  });

  // Join booking room
  socket.on('join:booking', (bookingId: string) => {
    socket.join(`booking:${bookingId}`);
  });

  // Join admin live room
  socket.on('join:admin', () => {
    socket.join('admin:live');
  });

  // Driver live location ping handler
  socket.on('driver:location_ping', async (data: { driverId: string; lat: number; lng: number; heading?: number; speed?: number }) => {
    const { driverId, lat, lng, heading, speed } = data;
    const driver = db.driverProfiles.get(driverId);
    if (driver) {
      driver.currentLat = lat;
      driver.currentLng = lng;
      if (heading !== undefined) driver.heading = heading;
      if (speed !== undefined) driver.speed = speed;
      driver.lastLocationAt = new Date().toISOString();

      db.driverProfiles.set(driver.id, driver);
      await redis.setDriverLocation(driver.id, lat, lng, driver.status, heading, speed);

      // Broadcast location to subscribers
      io.to('admin:live').emit('driver:location', { driverId: driver.id, lat, lng, heading, speed });
    }
  });

  socket.on('disconnect', () => {
    // Clean disconnection
  });
});

async function main() {
  await db.initialize();
  server.listen(ENV.PORT, () => {
    console.log(`=======================================================`);
    console.log(`  EasyRide Master API running on http://localhost:${ENV.PORT}`);
    console.log(`  API Docs (Swagger): http://localhost:${ENV.PORT}/api/docs`);
    console.log(`=======================================================`);
  });
}

main().catch((err) => {
  console.error('[API Startup Error]', err);
});
