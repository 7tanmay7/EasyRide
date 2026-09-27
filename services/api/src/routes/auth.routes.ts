import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterUserSchema, LoginUserSchema, SendOtpSchema, VerifyOtpSchema } from '@easyride/validation';
import { User, DriverProfile, Vehicle, AuthTokens } from '@easyride/shared-types';
import { db } from '../db';
import { ENV } from '../config/env';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const parse = RegisterUserSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, message: 'Validation error', error: parse.error.format() });
    }

    const { name, email, phone, password, role, profileImage, licenseNumber, vehicleType, vehicleModel, registrationNumber, companyName, industry } = parse.data;

    // Check existing
    const existingUser = Array.from(db.users.values()).find((u) => u.email === email || u.phone === phone);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email or phone already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newUser: User = {
      id: userId,
      name,
      email,
      phone,
      role,
      profileImage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.set(newUser.id, newUser);

    let driverProfile: DriverProfile | undefined;
    if (role === 'DRIVER') {
      const driverId = `drv-${Date.now()}`;
      const vehicleId = `veh-${Date.now()}`;

      const vehicle: Vehicle = {
        id: vehicleId,
        driverId,
        type: vehicleType || 'SEDAN',
        brand: 'Standard',
        model: vehicleModel || 'Model X',
        registrationNumber: registrationNumber || `KA-${Math.floor(10 + Math.random() * 80)}-AB-${Math.floor(1000 + Math.random() * 9000)}`,
        capacity: vehicleType === 'BIKE' ? 1 : 4,
        status: 'ACTIVE',
      };
      db.vehicles.set(vehicle.id, vehicle);

      driverProfile = {
        id: driverId,
        userId: newUser.id,
        licenseNumber: licenseNumber || `DL-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'ONLINE',
        rating: 5.0,
        acceptanceRate: 100,
        cancellationRate: 0,
        totalTrips: 0,
        totalEarnings: 0,
        currentLat: 12.9352, // Default Koramangala
        currentLng: 77.6245,
        heading: 0,
        speed: 0,
        lastLocationAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        vehicle,
        user: newUser,
      };
      db.driverProfiles.set(driverProfile.id, driverProfile);
    }

    if (role === 'BUSINESS' && companyName) {
      const bizId = `biz-${Date.now()}`;
      db.businesses.set(bizId, {
        id: bizId,
        userId: newUser.id,
        companyName,
        industry: industry || 'E-commerce',
        apiKeyHash: 'hash_live_' + Date.now(),
        apiKeyPrefix: 'er_live_' + companyName.substring(0, 3).toLowerCase(),
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      });
    }

    const accessToken = jwt.sign({ userId: newUser.id, role: newUser.role }, ENV.JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ userId: newUser.id }, ENV.JWT_REFRESH_SECRET, { expiresIn: '30d' });

    const responseData: AuthTokens = {
      accessToken,
      refreshToken,
      user: newUser,
      driverProfile,
    };

    return res.json({ success: true, message: 'Registration successful', data: responseData });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const parse = LoginUserSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, message: 'Validation error', error: parse.error.format() });
    }

    const { email, password } = parse.data;
    const user = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const driverProfile = Array.from(db.driverProfiles.values()).find((d) => d.userId === user.id);
    const business = Array.from(db.businesses.values()).find((b) => b.userId === user.id);

    const accessToken = jwt.sign({ userId: user.id, role: user.role }, ENV.JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ userId: user.id }, ENV.JWT_REFRESH_SECRET, { expiresIn: '30d' });

    const responseData: AuthTokens = {
      accessToken,
      refreshToken,
      user,
      driverProfile,
      business,
    };

    return res.json({ success: true, message: 'Login successful', data: responseData });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

authRouter.post('/send-otp', (req: Request, res: Response) => {
  const parse = SendOtpSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, message: 'Invalid phone number' });
  }
  return res.json({ success: true, message: 'OTP sent successfully (Demo OTP: 1234)' });
});

authRouter.post('/verify-otp', (req: Request, res: Response) => {
  const parse = VerifyOtpSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, message: 'Invalid request' });
  }

  const { phone, otp } = parse.data;
  if (otp !== '1234') {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  let user = Array.from(db.users.values()).find((u) => u.phone === phone);
  if (!user) {
    user = {
      id: `usr-otp-${Date.now()}`,
      name: `User ${phone.slice(-4)}`,
      email: `user_${phone.slice(-4)}@easyride.demo`,
      phone,
      role: 'CUSTOMER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.set(user.id, user);
  }

  const accessToken = jwt.sign({ userId: user.id, role: user.role }, ENV.JWT_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ userId: user.id }, ENV.JWT_REFRESH_SECRET, { expiresIn: '30d' });

  return res.json({
    success: true,
    message: 'OTP verified',
    data: { accessToken, refreshToken, user },
  });
});

authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // Default fallback demo user for instant seamless UI testing
    const defaultUser = Array.from(db.users.values())[0];
    return res.json({ success: true, data: { user: defaultUser } });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, ENV.JWT_SECRET);
    const user = db.users.get(decoded.userId);
    const driverProfile = Array.from(db.driverProfiles.values()).find((d) => d.userId === decoded.userId);
    const business = Array.from(db.businesses.values()).find((b) => b.userId === decoded.userId);

    return res.json({ success: true, data: { user, driverProfile, business } });
  } catch (e) {
    const defaultUser = Array.from(db.users.values())[0];
    return res.json({ success: true, data: { user: defaultUser } });
  }
});
