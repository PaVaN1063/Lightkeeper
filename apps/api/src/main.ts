import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // The Expo web app runs on another port (8081), and phones call from the LAN.
  app.enableCors({ origin: true });
  app.enableShutdownHooks();
  const port = Number(process.env.PORT ?? 3000);
  // 0.0.0.0 so an Android emulator or a phone on the same Wi-Fi can reach it.
  await app.listen(port, '0.0.0.0');
  Logger.log(`Lightkeeper API listening on http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
