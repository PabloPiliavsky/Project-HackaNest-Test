import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

// instance a Prisma client so Better Auth can communicate with the BD
const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true, // enables login with email and password
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'participant' // Default role will be participant
      }
    }
  }
});
