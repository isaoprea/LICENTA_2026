import "dotenv/config";
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL, 
  },
  migrations: {
    // Îi spunem Prisma să folosească ts-node pentru a executa fișierul de seed
    seed: 'ts-node ./prisma/seed.ts',
  },
});