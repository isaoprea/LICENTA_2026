import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
// 1. Importăm biblioteca dotenv
import * as dotenv from 'dotenv';

// 2. Forțăm încărcarea variabilelor din fișierul .env
dotenv.config();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Adăugăm un mic test: dacă linia de mai jos afișează "undefined", înseamnă că .env nu e citit
    console.log('Conectare la:', process.env.DATABASE_URL);

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}