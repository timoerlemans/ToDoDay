import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { sql } from 'drizzle-orm';
import { env } from './config/env';
import { db } from './db';
import { authRoutes } from './routes/auth';
import { daysRoutes } from './routes/days';
import { itemsRoutes } from './routes/items';
import { settingsRoutes } from './routes/settings';
import { errorHandler } from './middleware/error-handler';
import { cleanupExpiredSessions } from './services/auth.service';

// Extend FastifyRequest to include user
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string; email: string };
    user: { userId: string; email: string };
  }
}

async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: { colorize: true },
            }
          : undefined,
    },
    // Trust proxy headers in production for correct client IP detection
    trustProxy: env.NODE_ENV === 'production',
  });

  // Register CORS
  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(','),
    credentials: true,
  });

  // Register Cookie plugin
  await app.register(cookie);

  // Register rate limiting
  await app.register(rateLimit, {
    global: false,
  });

  // Register JWT plugin
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: '15m',
    },
    cookie: {
      cookieName: 'accessToken',
      signed: false,
    },
  });

  // Error handler
  app.setErrorHandler(errorHandler);

  // Health check helper function
  const getHealthStatus = async () => {
    const timestamp = new Date().toISOString();
    let dbStatus: 'ok' | 'error' = 'ok';
    let dbError: string | undefined;
    let dbResponseTime: number | undefined;

    try {
      const start = Date.now();
      await db.execute(sql`SELECT 1`);
      dbResponseTime = Date.now() - start;
    } catch (error) {
      dbStatus = 'error';
      dbError = error instanceof Error ? error.message : 'Unknown database error';
    }

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      timestamp,
      services: {
        api: { status: 'ok' },
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
          error: dbError,
        },
      },
    };
  };

  // Health check endpoints
  app.get('/health', async () => getHealthStatus());
  app.get('/api/health', async () => getHealthStatus());

  // API routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(daysRoutes, { prefix: '/api/days' });
  await app.register(itemsRoutes, { prefix: '/api/items' });
  await app.register(settingsRoutes, { prefix: '/api/settings' });

  return app;
}

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`Server listening on ${env.HOST}:${env.PORT}`);

    // Run session cleanup on startup and every hour
    const runCleanup = async () => {
      try {
        const count = await cleanupExpiredSessions();
        if (count > 0) {
          app.log.info(`Cleaned up ${count} expired sessions`);
        }
      } catch (err) {
        app.log.error({ err }, 'Failed to cleanup expired sessions');
      }
    };

    await runCleanup();
    setInterval(runCleanup, 60 * 60 * 1000); // Every hour
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

export { buildApp };
