import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';

async function bootstrap() {
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
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Register Fastify cookie plugin
  await app.register(require('@fastify/cookie'), {
    secret: configService.get<string>('COOKIE_SECRET') ?? 'my-secret-key',
  });

  const port = configService.get<number>('PORT', 8000);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
