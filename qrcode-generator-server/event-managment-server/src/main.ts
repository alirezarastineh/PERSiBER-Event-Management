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
    ].filter((url): url is string => Boolean(url));
    allowedOrigins.push(...envOrigins);
  }

  const allAllowedOrigins = allowedOrigins;

  // Register Fastify CORS plugin
  const fastifyCors = await import('@fastify/cors');
  await app.register(fastifyCors.default, {
    origin: allAllowedOrigins.length > 0 ? allAllowedOrigins : true,
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
