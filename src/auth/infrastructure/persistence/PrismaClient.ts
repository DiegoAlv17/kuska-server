import { PrismaClient as PrismaClientLib } from '@prisma/client';

class PrismaClientSingleton {
  private static instance: PrismaClientLib;

  private constructor() {}

  public static getInstance(): PrismaClientLib {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = new PrismaClientLib({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }
    return PrismaClientSingleton.instance;
  }

  public static async disconnect(): Promise<void> {
    if (PrismaClientSingleton.instance) {
      await PrismaClientSingleton.instance.$disconnect();
    }
  }
}

export const prisma = PrismaClientSingleton.getInstance();
export const disconnectPrisma = PrismaClientSingleton.disconnect;
