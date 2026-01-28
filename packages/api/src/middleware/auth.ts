import type { FastifyRequest, FastifyReply } from 'fastify';
import { HttpError } from './error-handler';

/**
 * Authentication middleware that verifies JWT tokens
 */
export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    // Verify the JWT token (sets request.user automatically via @fastify/jwt)
    await request.jwtVerify();
  } catch {
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
    // User type is set via @fastify/jwt module declaration
  }
}
