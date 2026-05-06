import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { RegisterInput, LoginInput, GoogleAuthInput, UpdateProfileInput } from './auth.validation';

const JWT_SECRET = process.env.JWT_SECRET || 'nexhire-secret-2026';
const JWT_EXPIRES = '7d';

export const generateToken = (user: { id: string; email: string; role: string; name: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
};

export const authService = {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw { status: 400, message: 'Email already registered' };

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
      select: { id: true, name: true, email: true, role: true, image: true, createdAt: true },
    });

    const token = generateToken(user);
    logger.info(`User registered: ${user.email} as ${user.role}`);
    return { user, token };
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.password) throw { status: 401, message: 'Invalid credentials' };

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) throw { status: 401, message: 'Invalid credentials' };

    const token = generateToken(user);
    logger.info(`User logged in: ${user.email}`);
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image },
      token,
    };
  },

  async googleAuth(data: GoogleAuthInput) {
    let user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          image: data.image,
          emailVerified: true,
          role: 'SEEKER',
        },
      });

      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: data.googleId || data.email,
          providerId: 'google',
        },
      });
      logger.info(`New Google user: ${user.email}`);
    }

    const token = generateToken(user);
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image },
      token,
    };
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, role: true, image: true,
        phone: true, bio: true, location: true, website: true,
        skills: true, resume: true, createdAt: true,
        company: { select: { id: true, name: true, slug: true, logo: true } },
      },
    });
    if (!user) throw { status: 404, message: 'User not found' };
    return user;
  },

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, name: true, email: true, role: true, image: true,
        phone: true, bio: true, location: true, website: true, skills: true,
      },
    });
    return user;
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw { status: 400, message: 'Cannot change password for OAuth accounts' };

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw { status: 400, message: 'Current password is incorrect' };

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
    logger.info(`Password changed for: ${user.email}`);
  },
};
