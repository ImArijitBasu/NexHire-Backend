import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from './prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: [process.env.CLIENT_URL || 'http://localhost:3000'],
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/better-auth',
  basePath: '/api/better-auth',
});
