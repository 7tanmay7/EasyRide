import { Router, Request, Response } from 'express';
import { db } from '../db';

export const usersRouter = Router();

usersRouter.get('/me', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'usr-cust-demo';
  const user = db.users.get(userId) || Array.from(db.users.values())[0];
  return res.json({ success: true, data: user });
});

usersRouter.patch('/me', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'usr-cust-demo';
  const user = db.users.get(userId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { name, phone, profileImage } = req.body;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (profileImage) user.profileImage = profileImage;
  user.updatedAt = new Date().toISOString();

  db.users.set(user.id, user);
  return res.json({ success: true, data: user });
});
