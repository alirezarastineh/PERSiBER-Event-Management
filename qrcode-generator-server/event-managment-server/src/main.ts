import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const fastifyAdapter = new FastifyAdapter();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );

  const configService = app.get(ConfigService);

  const isProduction = process.env.NODE_ENV === 'production';

  const frontendUrl = isProduction
    ? configService.get<string>('FRONTEND_URL_PRODUCTION')
    : configService.get<string>('FRONTEND_URL_LOCAL');

  // Get allowed origins from environment variables
  const allowedOrigins = frontendUrl ? frontendUrl.split(',') : [];

  // Fallback to environment variable if FRONTEND_URL_PRODUCTION is not set
  if (isProduction && allowedOrigins.length === 0) {
    const envOrigins = [
      configService.get<string>('FRONTEND_URL'),
      configService.get<string>('BACKEND_URL'),
      'https://persiber.vercel.app', // Production frontend URL
    ].filter((url): url is string => Boolean(url));
    allowedOrigins.push(...envOrigins);
  }

  // Always include production URL in allowed origins for safety
  if (!allowedOrigins.includes('https://persiber.vercel.app')) {
    allowedOrigins.push('https://persiber.vercel.app');
  }

  const allAllowedOrigins = allowedOrigins;

  // Register Fastify CORS plugin
  const fastifyCors = await import('@fastify/cors');
  await app.register(fastifyCors.default, {
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, etc)
      if (!origin) {
        cb(null, true);
        return;
      }

      // Check if origin is allowed
      if (
        allAllowedOrigins.length === 0 ||
        allAllowedOrigins.includes(origin)
      ) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Register Fastify cookie plugin
  const fastifyCookie = await import('@fastify/cookie');
  await app.register(fastifyCookie.default, {
    secret: configService.get<string>('COOKIE_SECRET') ?? 'my-secret-key',
  });

  const port = configService.get<number>('PORT', 8000);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
