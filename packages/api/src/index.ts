import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env';
import { authRoutes } from './routes/auth';
import { daysRoutes } from './routes/days';
import { itemsRoutes } from './routes/items';
import { settingsRoutes } from './routes/settings';
import { errorHandler } from './middleware/error-handler';

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
  });

  // Register CORS
  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(','),
    credentials: true,
  });

  // Error handler
  app.setErrorHandler(errorHandler);

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

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
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

export { buildApp };
