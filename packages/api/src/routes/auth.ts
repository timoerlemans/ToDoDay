import type { FastifyInstance } from 'fastify';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/auth/register
  app.post('/register', async (request, reply) => {
    // TODO: Implement registration
    reply.status(501).send({ error: 'Not implemented' });
  });

  // POST /api/auth/login
  app.post('/login', async (request, reply) => {
    // TODO: Implement login
    reply.status(501).send({ error: 'Not implemented' });
  });

  // POST /api/auth/refresh
  app.post('/refresh', async (request, reply) => {
    // TODO: Implement token refresh
    reply.status(501).send({ error: 'Not implemented' });
  });

  // POST /api/auth/logout
  app.post('/logout', async (request, reply) => {
    // TODO: Implement logout
    reply.status(501).send({ error: 'Not implemented' });
  });

  // GET /api/auth/me
  app.get('/me', async (request, reply) => {
    // TODO: Implement get current user
    reply.status(501).send({ error: 'Not implemented' });
  });
}
