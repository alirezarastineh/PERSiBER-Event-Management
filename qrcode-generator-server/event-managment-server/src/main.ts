import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';

async function bootstrap(): Promise<void> {
  const fastifyAdapter = new FastifyAdapter({
    // Enable logging for debugging
    logger: process.env.NODE_ENV !== 'production',
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );

  const configService = app.get(ConfigService);

  const isProduction = process.env.NODE_ENV === 'production';
  app.useGlobalFilters(new AllExceptionsFilter(isProduction));

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
    ].filter(Boolean) as string[];
    allowedOrigins.push(...envOrigins);
  }

  // Always include production URL in allowed origins for safety
  if (!allowedOrigins.includes('https://persiber.vercel.app')) {
    allowedOrigins.push('https://persiber.vercel.app');
  }

  // In development, also allow localhost variants
  if (!isProduction) {
    const devOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://[::1]:3000',
    ];
    for (const origin of devOrigins) {
      if (!allowedOrigins.includes(origin)) {
        allowedOrigins.push(origin);
      }
    }
  }

  const allAllowedOrigins = allowedOrigins;

  // Register Fastify CORS plugin with enhanced cross-browser support
  const fastifyCors = await import('@fastify/cors');
  await app.register(fastifyCors.default, {
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, Postman, etc)
      // This is important for mobile browser compatibility
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
        // Log rejected origins in development for debugging
        if (!isProduction) {
          // eslint-disable-next-line no-console
          console.warn(`CORS rejected origin: ${origin}`);
        }
        cb(new Error('Not allowed by CORS'), false);
      }
    },
    // Enable credentials for cookie-based authentication
    // Required for Safari's ITP and Firefox's ETP
    credentials: true,
    // HTTP methods - include HEAD for some browsers
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // Allowed headers - comprehensive list for cross-browser support
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Accept-Language',
      'Accept-Encoding',
      'Origin',
      'Cache-Control',
      'Pragma',
      'If-None-Match',
      'If-Modified-Since',
    ],
    // Exposed headers - allow frontend to read these
    exposedHeaders: [
      'Set-Cookie',
      'Content-Length',
      'Content-Type',
      'ETag',
      'X-Request-Id',
    ],
    // Don't pass OPTIONS requests to the next handler
    preflightContinue: false,
    // Status for successful OPTIONS requests
    // 204 is widely supported across all browsers
    optionsSuccessStatus: 204,
    // Max age for preflight cache (in seconds)
    // 86400 = 24 hours - reduces preflight requests
    maxAge: 86400,
    // Allow preflight for older browsers
    strictPreflight: false,
  });

  // Register Fastify cookie plugin with cross-browser compatible settings
  const fastifyCookie = await import('@fastify/cookie');
  await app.register(fastifyCookie.default, {
    secret: configService.get<string>('COOKIE_SECRET') ?? 'my-secret-key',
    parseOptions: {
      // Cookie settings for cross-browser compatibility
      // Lax is more compatible than Strict for cross-origin scenarios
      sameSite: isProduction ? 'none' : 'lax',
      // Secure is required for SameSite=None in production
      secure: isProduction,
      // HttpOnly prevents JavaScript access (security)
      httpOnly: true,
      // Path ensures cookie is sent for all routes
      path: '/',
    },
  });

  // Add global response hooks for cross-browser headers
  const fastifyInstance = app.getHttpAdapter().getInstance();

  fastifyInstance.addHook('onSend', async (request, reply, payload) => {
    // Security headers for all responses
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'SAMEORIGIN');
    reply.header('X-XSS-Protection', '1; mode=block');

    // Referrer policy for privacy
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Cache control for API responses
    // Prevents caching of sensitive data
    if (request.url?.startsWith('/api/')) {
      reply.header(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate',
      );
      reply.header('Pragma', 'no-cache');
      reply.header('Expires', '0');
    }

    // Vary header for proper caching with CORS
    // Important for CDNs and proxy caches
    const existingVary = reply.getHeader('Vary') as string | undefined;
    if (existingVary) {
      reply.header('Vary', `${existingVary}, Origin, Accept-Encoding`);
    } else {
      reply.header('Vary', 'Origin, Accept-Encoding');
    }

    return payload;
  });

  const port = configService.get<number>('PORT', 8000);

  // Listen on all interfaces for container/deployment compatibility
  await app.listen(port, '0.0.0.0');

  // eslint-disable-next-line no-console
  console.log(
    `Server running on port ${port} in ${isProduction ? 'production' : 'development'} mode`,
  );
  // eslint-disable-next-line no-console
  console.log(`Allowed origins: ${allAllowedOrigins.join(', ')}`);
}

bootstrap();
