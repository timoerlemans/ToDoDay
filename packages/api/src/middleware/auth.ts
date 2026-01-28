import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { HttpError } from './error-handler';

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
    };
  }
}

/**
 * Authentication middleware that verifies JWT tokens
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Verify the JWT token (sets request.user automatically via @fastify/jwt)
    await request.jwtVerify();
  } catch (error) {
    throw HttpError.unauthorized('Invalid or expired token');
  }
}

/**
 * Optional authentication - doesn't fail if no token provided
 */
export async function optionalAuthenticate(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    // Token is invalid or not provided, but we don't fail
    request.user = undefined;
  }
}

/**
 * Setup JWT plugin on Fastify instance
 */
export function setupJwt(app: FastifyInstance, secret: string): void {
  app.register(import('@fastify/jwt'), {
    secret,
    sign: {
      expiresIn: '15m',
    },
  });

  // Decorate request with user after verification
  app.decorateRequest('user', null);

  // Add a hook to set user after JWT verification
  app.addHook('preHandler', async (request) => {
    // If JWT was verified, decode and set user
    if (request.headers.authorization) {
      try {
        const decoded = await request.jwtVerify<{ userId: string; email: string }>();
        request.user = decoded;
      } catch {
        // Token verification failed, user stays null
      }
    }
  });
}
