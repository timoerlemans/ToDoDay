import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  generateRefreshToken,
  createSession,
  findValidSession,
  deleteSession,
  rotateRefreshToken,
  getCookieOptions,
  getAccessTokenExpiry,
  getRefreshTokenExpiryMs,
} from '../services/auth.service';
import { HttpError } from '../middleware/error-handler';
import { env } from '../config/env';

// Rate limit configuration for auth endpoints
const authRateLimit = {
  max: 5,
  timeWindow: '1 minute',
  keyGenerator: (request: FastifyRequest) => request.ip,
};

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/auth/register
  app.post('/register', { config: { rateLimit: authRateLimit } }, async (request, reply) => {
    const body = registerSchema.parse(request.body);

    // Check if user already exists
    const existingUser = await findUserByEmail(body.email);
    if (existingUser) {
      throw HttpError.conflict('User with this email already exists');
    }

    // Create user (also creates default settings)
    const user = await createUser(body.email, body.password, body.name);

    // Generate tokens
    const accessToken = app.jwt.sign({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken();
    await createSession(user.id, refreshToken);

    // Set cookies
    const isProduction = env.NODE_ENV === 'production';
    const cookieOptions = getCookieOptions(isProduction);

    reply.setCookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: getRefreshTokenExpiryMs(),
    });

    return reply.status(201).send({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        accessToken,
        expiresIn: getAccessTokenExpiry(),
      },
    });
  });

  // POST /api/auth/login
  app.post('/login', { config: { rateLimit: authRateLimit } }, async (request, reply) => {
    const body = loginSchema.parse(request.body);

    // Find user
    const user = await findUserByEmail(body.email);
    if (!user) {
      throw HttpError.unauthorized('Invalid email or password');
    }

    // Verify password
    const isValid = await verifyPassword(body.password, user.passwordHash);
    if (!isValid) {
      throw HttpError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const accessToken = app.jwt.sign({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken();
    await createSession(user.id, refreshToken);

    // Set cookies
    const isProduction = env.NODE_ENV === 'production';
    const cookieOptions = getCookieOptions(isProduction);

    reply.setCookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: getRefreshTokenExpiryMs(),
    });

    return reply.send({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        accessToken,
        expiresIn: getAccessTokenExpiry(),
      },
    });
  });

  // POST /api/auth/refresh
  app.post('/refresh', { config: { rateLimit: authRateLimit } }, async (request, reply) => {
    // Get refresh token from cookie or body
    const refreshToken = request.cookies.refreshToken ||
      (request.body as { refreshToken?: string })?.refreshToken;

    if (!refreshToken) {
      throw HttpError.unauthorized('Refresh token is required');
    }

    // Find valid session
    const session = await findValidSession(refreshToken);
    if (!session) {
      throw HttpError.unauthorized('Invalid or expired refresh token');
    }

    // Get user
    const user = await findUserById(session.userId);
    if (!user) {
      throw HttpError.unauthorized('User not found');
    }

    // Rotate refresh token (delete old, create new)
    const newRefreshToken = await rotateRefreshToken(refreshToken, user.id);

    // Generate new access token
    const accessToken = app.jwt.sign({
      userId: user.id,
      email: user.email,
    });

    // Set new refresh token cookie
    const isProduction = env.NODE_ENV === 'production';
    const cookieOptions = getCookieOptions(isProduction);

    reply.setCookie('refreshToken', newRefreshToken, {
      ...cookieOptions,
      maxAge: getRefreshTokenExpiryMs(),
    });

    return reply.send({
      data: {
        accessToken,
        expiresIn: getAccessTokenExpiry(),
      },
    });
  });

  // POST /api/auth/logout
  app.post('/logout', async (request, reply) => {
    const refreshToken = request.cookies.refreshToken;

    if (refreshToken) {
      await deleteSession(refreshToken);
    }

    // Clear cookie
    reply.clearCookie('refreshToken', {
      path: '/',
    });

    return reply.send({
      data: { message: 'Logged out successfully' },
    });
  });

  // GET /api/auth/me - requires authentication
  app.get('/me', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      throw HttpError.unauthorized('Invalid or expired token');
    }

    const { userId } = request.user;
    const user = await findUserById(userId);

    if (!user) {
      throw HttpError.notFound('User not found');
    }

    return reply.send({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      },
    });
  });
}
