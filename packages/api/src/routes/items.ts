import type { FastifyInstance } from 'fastify';

export async function itemsRoutes(app: FastifyInstance): Promise<void> {
  // PATCH /api/items/:id - Update item
  app.patch('/:id', async (request, reply) => {
    // TODO: Implement update item
    reply.status(501).send({ error: 'Not implemented' });
  });

  // DELETE /api/items/:id - Delete item
  app.delete('/:id', async (request, reply) => {
    // TODO: Implement delete item
    reply.status(501).send({ error: 'Not implemented' });
  });

  // POST /api/items/:id/complete - Mark item as complete
  app.post('/:id/complete', async (request, reply) => {
    // TODO: Implement complete item
    reply.status(501).send({ error: 'Not implemented' });
  });

  // PATCH /api/items/reorder - Batch reorder items
  app.patch('/reorder', async (request, reply) => {
    // TODO: Implement batch reorder
    reply.status(501).send({ error: 'Not implemented' });
  });
}
