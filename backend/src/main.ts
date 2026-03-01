import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); 
  await app.listen(3000);
  console.log(`🔑 Valoarea cheii API este: [${process.env.GEMINI_API_KEY}]`);
}
bootstrap();