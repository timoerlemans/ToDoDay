import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { userSettings, type UserSetting } from '../db/schema';
import { HttpError } from '../middleware/error-handler';
import { DEFAULT_SETTINGS } from '@tododay/shared';

// Validation schemas
const updateSettingsSchema = z.object({
  workdayStart: z.number().int().min(0).max(23).optional(),
  workdayEnd: z.number().int().min(0).max(23).optional(),
  defaultDuration: z.number().int().min(5).max(480).optional(),
  timestampFormat: z.enum(['12h', '24h']).optional(),
  colorScheme: z.enum(['light', 'dark', 'system']).optional(),
}).refine(
  data => {
    // Ensure workdayEnd is after workdayStart if both provided
    if (data.workdayStart !== undefined && data.workdayEnd !== undefined) {
      return data.workdayEnd > data.workdayStart;
    }
    return true;
  },
  { message: 'Workday end must be after workday start' }
);

/**
 * Get or create default settings for a user
 */
async function getOrCreateSettings(userId: string): Promise<UserSetting> {
  const [existingSettings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));

  if (existingSettings) {
    return existingSettings;
  }

  // Create default settings
  const [newSettings] = await db
    .insert(userSettings)
    .values({
      userId,
      workdayStart: DEFAULT_SETTINGS.workdayStart,
      workdayEnd: DEFAULT_SETTINGS.workdayEnd,
      defaultDuration: DEFAULT_SETTINGS.defaultDuration,
      timestampFormat: DEFAULT_SETTINGS.timestampFormat,
      colorScheme: DEFAULT_SETTINGS.colorScheme,
    })
    .returning();

  return newSettings;
}

export async function settingsRoutes(app: FastifyInstance): Promise<void> {
  // All settings routes require authentication
  app.addHook('preHandler', async (request) => {
    try {
      await request.jwtVerify();
    } catch {
      throw HttpError.unauthorized('Invalid or expired token');
    }
  });

  // GET /api/settings - Get user settings
  app.get('/', async (request, reply) => {
    const { userId } = request.user;

    const settings = await getOrCreateSettings(userId);

    return reply.send({
      data: {
        workdayStart: settings.workdayStart,
        workdayEnd: settings.workdayEnd,
        defaultDuration: settings.defaultDuration,
        timestampFormat: settings.timestampFormat,
        colorScheme: settings.colorScheme,
        updatedAt: settings.updatedAt,
      },
    });
  });

  // PATCH /api/settings - Update user settings
  app.patch('/', async (request, reply) => {
    const body = updateSettingsSchema.parse(request.body);
    const { userId } = request.user;

    // Get current settings (creates if doesn't exist)
    const currentSettings = await getOrCreateSettings(userId);

    // Check cross-validation with current values
    const newWorkdayStart = body.workdayStart ?? currentSettings.workdayStart;
    const newWorkdayEnd = body.workdayEnd ?? currentSettings.workdayEnd;

    if (newWorkdayEnd <= newWorkdayStart) {
      throw HttpError.badRequest('Workday end must be after workday start');
    }

    // Build update object
    const updateData: Partial<{
      workdayStart: number;
      workdayEnd: number;
      defaultDuration: number;
      timestampFormat: '12h' | '24h';
      colorScheme: 'light' | 'dark' | 'system';
      updatedAt: Date;
    }> = {
      updatedAt: new Date(),
    };

    if (body.workdayStart !== undefined) updateData.workdayStart = body.workdayStart;
    if (body.workdayEnd !== undefined) updateData.workdayEnd = body.workdayEnd;
    if (body.defaultDuration !== undefined) updateData.defaultDuration = body.defaultDuration;
    if (body.timestampFormat !== undefined) updateData.timestampFormat = body.timestampFormat;
    if (body.colorScheme !== undefined) updateData.colorScheme = body.colorScheme;

    const [updatedSettings] = await db
      .update(userSettings)
      .set(updateData)
      .where(eq(userSettings.userId, userId))
      .returning();

    return reply.send({
      data: {
        workdayStart: updatedSettings.workdayStart,
        workdayEnd: updatedSettings.workdayEnd,
        defaultDuration: updatedSettings.defaultDuration,
        timestampFormat: updatedSettings.timestampFormat,
        colorScheme: updatedSettings.colorScheme,
        updatedAt: updatedSettings.updatedAt,
      },
    });
  });
}
