import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  app.use(cookieParser());

  const port = configService.get<number>('PORT', 8000);
  await app.listen(port);
}

bootstrap();
