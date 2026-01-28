import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { eq, and, lt, gt } from 'drizzle-orm';
import { db } from '../db';
import { users, sessions, userSettings, type User, type Session } from '../db/schema';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Hash a password using bcrypt with 12 salt rounds
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a cryptographically secure refresh token
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Hash a refresh token using SHA-256 for storage
 */
export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Create a new user with hashed password and default settings
 */
export async function createUser(
  email: string,
  password: string,
  name?: string
): Promise<User> {
  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({
      email: email.toLowerCase().trim(),
      passwordHash,
      name,
    })
    .returning();

  // Create default user settings
  await db.insert(userSettings).values({
    userId: user.id,
  });

  return user;
}

/**
 * Find a user by email
 */
export async function findUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()));

  return user;
}

/**
 * Find a user by ID
 */
export async function findUserById(userId: string): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  return user;
}

/**
 * Create a new session with hashed refresh token
 */
export async function createSession(userId: string, refreshToken: string): Promise<Session> {
  const hashedToken = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      refreshToken: hashedToken,
      expiresAt,
    })
    .returning();

  return session;
}

/**
 * Find a valid session by refresh token
 */
export async function findValidSession(refreshToken: string): Promise<Session | undefined> {
  const hashedToken = hashRefreshToken(refreshToken);

  const [session] = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.refreshToken, hashedToken),
        gt(sessions.expiresAt, new Date())
      )
    );

  return session;
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(refreshToken: string): Promise<void> {
  const hashedToken = hashRefreshToken(refreshToken);

  await db
    .delete(sessions)
    .where(eq(sessions.refreshToken, hashedToken));
}

/**
 * Delete all sessions for a user
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await db
    .delete(sessions)
    .where(eq(sessions.userId, userId));
}

/**
 * Rotate refresh token - delete old session, create new one
 */
export async function rotateRefreshToken(
  oldRefreshToken: string,
  userId: string
): Promise<string> {
  // Delete old session
  await deleteSession(oldRefreshToken);

  // Generate new token
  const newToken = generateRefreshToken();

  // Create new session
  await createSession(userId, newToken);

  return newToken;
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await db
    .delete(sessions)
    .where(lt(sessions.expiresAt, new Date()))
    .returning();

  return result.length;
}

/**
 * Get access token expiry in seconds
 */
export function getAccessTokenExpiry(): number {
  return ACCESS_TOKEN_EXPIRY_MS / 1000;
}

/**
 * Get refresh token expiry in milliseconds
 */
export function getRefreshTokenExpiryMs(): number {
  return REFRESH_TOKEN_EXPIRY_MS;
}

/**
 * Cookie configuration for secure token handling
 */
export function getCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: REFRESH_TOKEN_EXPIRY_MS,
  };
}
