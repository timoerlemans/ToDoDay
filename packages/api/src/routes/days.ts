import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getOrCreateDay, getDayByDate, updateDayNotes } from '../services/day.service';
import { createItem, getItemsForDay, type ParsedItemInput } from '../services/item.service';
import { getSchedule } from '../services/scheduler.service';
import { HttpError } from '../middleware/error-handler';

// Validation schemas
const dateParamSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

const createItemSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  type: z.enum(['task', 'event']).optional(),
  priority: z.enum(['normal', 'urgent']).optional(),
});

const updateNotesSchema = z.object({
  notes: z.string().nullable(),
});

export async function daysRoutes(app: FastifyInstance): Promise<void> {
  // All day routes require authentication
  app.addHook('preHandler', async (request) => {
    try {
      await request.jwtVerify();
    } catch {
      throw HttpError.unauthorized('Invalid or expired token');
    }
  });

  // GET /api/days/:date - Get day with items
  app.get('/:date', async (request, reply) => {
    const params = dateParamSchema.parse(request.params);
    const { userId } = request.user;

    const day = await getOrCreateDay(userId, params.date);

    return reply.send({ data: day });
  });

  // POST /api/days - Create day (or return existing)
  app.post('/', async (request, reply) => {
    const body = z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
      notes: z.string().optional(),
    }).parse(request.body);

    const { userId } = request.user;

    const day = await getOrCreateDay(userId, body.date);

    if (body.notes !== undefined && day) {
      await updateDayNotes(day.id, body.notes);
    }

    return reply.status(201).send({ data: day });
  });

  // GET /api/days/:date/items - Get all items for day
  app.get('/:date/items', async (request, reply) => {
    const params = dateParamSchema.parse(request.params);
    const { userId } = request.user;

    const day = await getDayByDate(userId, params.date);

    if (!day) {
      return reply.send({ data: [] });
    }

    const items = await getItemsForDay(day.id);

    return reply.send({ data: items });
  });

  // POST /api/days/:date/items - Create item for day
  app.post('/:date/items', async (request, reply) => {
    const params = dateParamSchema.parse(request.params);
    const body = createItemSchema.parse(request.body);
    const { userId } = request.user;

    // Get or create the day
    const day = await getOrCreateDay(userId, params.date);

    if (!day) {
      throw HttpError.internal('Failed to create day');
    }

    // Parse the date for the item
    const baseDate = new Date(params.date);

    // Create the item
    const input: ParsedItemInput = {
      text: body.text,
      type: body.type,
      priority: body.priority,
    };

    const item = await createItem(day.id, userId, input, baseDate);

    return reply.status(201).send({ data: item });
  });

  // GET /api/days/:date/schedule - Get computed schedule with positions
  app.get('/:date/schedule', async (request, reply) => {
    const params = dateParamSchema.parse(request.params);
    const { userId } = request.user;

    const schedule = await getSchedule(userId, params.date);

    return reply.send({ data: schedule });
  });

  // PATCH /api/days/:date/notes - Update day notes
  app.patch('/:date/notes', async (request, reply) => {
    const params = dateParamSchema.parse(request.params);
    const body = updateNotesSchema.parse(request.body);
    const { userId } = request.user;

    const day = await getDayByDate(userId, params.date);

    if (!day) {
      throw HttpError.notFound('Day not found');
    }

    const updatedDay = await updateDayNotes(day.id, body.notes);

    return reply.send({ data: updatedDay });
  });
}
