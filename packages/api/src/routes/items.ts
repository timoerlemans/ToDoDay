import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  getItemById,
  updateItem,
  deleteItem,
  completeItem,
  uncompleteItem,
  reorderItems,
  verifyItemOwnership,
} from '../services/item.service';
import { HttpError } from '../middleware/error-handler';

// Validation schemas
const itemIdParamSchema = z.object({
  id: z.string().uuid('Invalid item ID'),
});

const updateItemSchema = z.object({
  text: z.string().min(1).optional(),
  type: z.enum(['task', 'event']).optional(),
  startTime: z.string().datetime().nullable().optional(),
  endTime: z.string().datetime().nullable().optional(),
  duration: z.number().positive().optional(),
  priority: z.enum(['normal', 'urgent']).optional(),
  sortOrder: z.number().int().optional(),
});

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int(),
    })
  ),
});

const completeSchema = z.object({
  completed: z.boolean().optional(),
});

export async function itemsRoutes(app: FastifyInstance): Promise<void> {
  // All item routes require authentication
  app.addHook('preHandler', async (request) => {
    try {
      await request.jwtVerify();
    } catch {
      throw HttpError.unauthorized('Invalid or expired token');
    }
  });

  // PATCH /api/items/reorder - Batch reorder items (must be before /:id routes)
  app.patch('/reorder', async (request, reply) => {
    const body = reorderSchema.parse(request.body);
    const { userId } = request.user;

    // Verify all items belong to user
    for (const { id } of body.items) {
      const isOwner = await verifyItemOwnership(id, userId);
      if (!isOwner) {
        throw HttpError.forbidden('You do not have access to one or more items');
      }
    }

    await reorderItems(body.items);

    return reply.send({ data: { message: 'Items reordered successfully' } });
  });

  // GET /api/items/:id - Get item by ID
  app.get('/:id', async (request, reply) => {
    const params = itemIdParamSchema.parse(request.params);
    const { userId } = request.user;

    const item = await getItemById(params.id);

    if (!item) {
      throw HttpError.notFound('Item not found');
    }

    if (item.userId !== userId) {
      throw HttpError.forbidden('You do not have access to this item');
    }

    return reply.send({ data: item });
  });

  // PATCH /api/items/:id - Update item
  app.patch('/:id', async (request, reply) => {
    const params = itemIdParamSchema.parse(request.params);
    const body = updateItemSchema.parse(request.body);
    const { userId } = request.user;

    // Verify ownership
    const item = await getItemById(params.id);

    if (!item) {
      throw HttpError.notFound('Item not found');
    }

    if (item.userId !== userId) {
      throw HttpError.forbidden('You do not have access to this item');
    }

    // Prepare update data
    const updateData: Parameters<typeof updateItem>[1] = {};

    if (body.text !== undefined) updateData.text = body.text;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;

    if (body.startTime !== undefined) {
      updateData.startTime = body.startTime ? new Date(body.startTime) : null;
    }
    if (body.endTime !== undefined) {
      updateData.endTime = body.endTime ? new Date(body.endTime) : null;
    }

    const updatedItem = await updateItem(params.id, updateData);

    return reply.send({ data: updatedItem });
  });

  // DELETE /api/items/:id - Delete item
  app.delete('/:id', async (request, reply) => {
    const params = itemIdParamSchema.parse(request.params);
    const { userId } = request.user;

    // Verify ownership
    const item = await getItemById(params.id);

    if (!item) {
      throw HttpError.notFound('Item not found');
    }

    if (item.userId !== userId) {
      throw HttpError.forbidden('You do not have access to this item');
    }

    await deleteItem(params.id);

    return reply.send({ data: { message: 'Item deleted successfully' } });
  });

  // POST /api/items/:id/complete - Mark item as complete
  app.post('/:id/complete', async (request, reply) => {
    const params = itemIdParamSchema.parse(request.params);
    const body = completeSchema.parse(request.body);
    const { userId } = request.user;

    // Verify ownership
    const item = await getItemById(params.id);

    if (!item) {
      throw HttpError.notFound('Item not found');
    }

    if (item.userId !== userId) {
      throw HttpError.forbidden('You do not have access to this item');
    }

    // Toggle or set completed status
    const shouldComplete = body.completed ?? !item.completed;

    const updatedItem = shouldComplete
      ? await completeItem(params.id)
      : await uncompleteItem(params.id);

    return reply.send({ data: updatedItem });
  });
}
