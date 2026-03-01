import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    
    const adapter = new PrismaPg(pool);

    super({ adapter } as any);
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Baza de date conectată cu succes via Adapter!');
    } catch (e) {
      console.error('❌ Eroare la conectarea bazei de date:', e);
    }
  }
}