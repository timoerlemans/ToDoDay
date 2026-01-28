import type { FastifyInstance } from 'fastify';

export async function daysRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/days/:date - Get day with items
  app.get('/:date', async (request, reply) => {
    // TODO: Implement get day
    reply.status(501).send({ error: 'Not implemented' });
  });

  // POST /api/days - Create day
  app.post('/', async (request, reply) => {
    // TODO: Implement create day
    reply.status(501).send({ error: 'Not implemented' });
  });

  // GET /api/days/:date/items - Get all items for day
  app.get('/:date/items', async (request, reply) => {
    // TODO: Implement get day items
    reply.status(501).send({ error: 'Not implemented' });
  });

  // POST /api/days/:date/items - Create item for day
  app.post('/:date/items', async (request, reply) => {
    // TODO: Implement create item
    reply.status(501).send({ error: 'Not implemented' });
  });

  // GET /api/days/:date/schedule - Get computed schedule with positions
  app.get('/:date/schedule', async (request, reply) => {
    // TODO: Implement get schedule
    reply.status(501).send({ error: 'Not implemented' });
  });
}
