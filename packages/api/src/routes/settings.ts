import type { FastifyInstance } from 'fastify';

export async function settingsRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/settings - Get user settings
  app.get('/', async (request, reply) => {
    // TODO: Implement get settings
    reply.status(501).send({ error: 'Not implemented' });
  });

  // PATCH /api/settings - Update user settings
  app.patch('/', async (request, reply) => {
    // TODO: Implement update settings
    reply.status(501).send({ error: 'Not implemented' });
  });
}
