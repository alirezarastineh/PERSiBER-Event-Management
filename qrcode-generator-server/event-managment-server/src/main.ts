import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module.js';

const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
);

const configService = app.get(ConfigService);

const isProduction = process.env.NODE_ENV === 'production';

const frontendUrl = isProduction
  ? configService.get<string>('FRONTEND_URL_PRODUCTION')
  : configService.get<string>('FRONTEND_URL_LOCAL');

const allowedOrigins = frontendUrl ? frontendUrl.split(',') : [];

app.enableCors({
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, origin: string | boolean | RegExp) => void,
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
});

// Register Fastify cookie plugin
const fastifyCookie = await import('@fastify/cookie');
await app.register(fastifyCookie.default, {
  secret: configService.get<string>('COOKIE_SECRET') ?? 'my-secret-key',
});

const port = configService.get<number>('PORT', 8000);
await app.listen(port, '0.0.0.0');
