import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'participant'
      }
    }
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.person.create({
            data: {
              name: user.name,
              userId: user.id as string,
            }
          });
        }
      }
    }
  }
});
