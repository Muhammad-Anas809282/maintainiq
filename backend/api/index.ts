import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Request, type Response } from 'express';
import { AppModule } from '../src/app.module';

// Reuse a single Express instance / Nest app across warm serverless invocations.
const server = express();
let bootstrapPromise: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: process.env.PUBLIC_APP_URL ?? true,
    credentials: true,
  });
  await app.init();
}

export default async function handler(req: Request, res: Response) {
  if (!bootstrapPromise) bootstrapPromise = bootstrap();
  await bootstrapPromise;
  server(req, res);
}
