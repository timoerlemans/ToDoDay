import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db';
import { items, type Item, type NewItem } from '../db/schema';
import { extractTime, timeToDate, calculateDuration } from '@tododay/shared';
import { extractDuration } from '@tododay/shared';

export interface ParsedItemInput {
  text: string;
  type?: 'task' | 'event';
  priority?: 'normal' | 'urgent';
}

export interface ParsedItemResult {
  cleanedText: string;
  type: 'task' | 'event';
  startTime: Date | null;
  endTime: Date | null;
  duration: number;
  isFixed: boolean;
}

/**
 * Parse item text to extract time, duration, and determine type
 */
export function parseItemText(
  input: ParsedItemInput,
  baseDate: Date,
  defaultDuration: number = 30
): ParsedItemResult {
  let { text, type, priority } = input;

  // Extract time information
  const timeResult = extractTime(text);
  let cleanedText = timeResult.cleanedText;

  // Extract duration from remaining text
  const durationResult = extractDuration(cleanedText, defaultDuration);
  cleanedText = durationResult.cleanedText;

  let startTime: Date | null = null;
  let endTime: Date | null = null;
  let duration = durationResult.duration;
  let isFixed = timeResult.isFixed;

  // Determine if this is an event or task based on time info
  if (timeResult.range) {
    // Has a time range - it's an event
    type = type ?? 'event';
    startTime = timeToDate(timeResult.range.start, baseDate);
    endTime = timeToDate(timeResult.range.end, baseDate);
    duration = calculateDuration(timeResult.range.start, timeResult.range.end);
    isFixed = true;
  } else if (timeResult.time) {
    // Has a single time - could be event or task with fixed start
    startTime = timeToDate(timeResult.time, baseDate);
    // Calculate end time based on duration
    endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    // Default to event if time is specified
    type = type ?? 'event';
    isFixed = true;
  } else {
    // No time specified - it's a task
    type = type ?? 'task';
  }

  return {
    cleanedText: cleanedText.trim(),
    type,
    startTime,
    endTime,
    duration,
    isFixed,
  };
}

/**
 * Create a new item with text parsing
 */
export async function createItem(
  dayId: string,
  userId: string,
  input: ParsedItemInput,
  baseDate: Date,
  defaultDuration: number = 30
): Promise<Item> {
  const parsed = parseItemText(input, baseDate, defaultDuration);

  // Get the next sort order
  const maxSortResult = await db
    .select({ maxSort: sql<number>`COALESCE(MAX(${items.sortOrder}), -1)` })
    .from(items)
    .where(eq(items.dayId, dayId));

  const nextSortOrder = (maxSortResult[0]?.maxSort ?? -1) + 1;

  const [item] = await db
    .insert(items)
    .values({
      dayId,
      userId,
      text: parsed.cleanedText || input.text,
      type: parsed.type,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      duration: parsed.duration,
      priority: input.priority ?? 'normal',
      sortOrder: nextSortOrder,
    })
    .returning();

  return item;
}

/**
 * Get item by ID
 */
export async function getItemById(itemId: string): Promise<Item | null> {
  const [item] = await db
    .select()
    .from(items)
    .where(eq(items.id, itemId));

  return item ?? null;
}

/**
 * Update an item
 */
export async function updateItem(
  itemId: string,
  data: Partial<{
    text: string;
    type: 'task' | 'event';
    startTime: Date | null;
    endTime: Date | null;
    duration: number;
    priority: 'normal' | 'urgent';
    sortOrder: number;
    completed: boolean;
    completedAt: Date | null;
  }>
): Promise<Item> {
  const [item] = await db
    .update(items)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(items.id, itemId))
    .returning();

  return item;
}

/**
 * Delete an item
 */
export async function deleteItem(itemId: string): Promise<void> {
  await db
    .delete(items)
    .where(eq(items.id, itemId));
}

/**
 * Mark item as complete
 */
export async function completeItem(itemId: string): Promise<Item> {
  const [item] = await db
    .update(items)
    .set({
      completed: true,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(items.id, itemId))
    .returning();

  return item;
}

/**
 * Mark item as incomplete
 */
export async function uncompleteItem(itemId: string): Promise<Item> {
  const [item] = await db
    .update(items)
    .set({
      completed: false,
      completedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(items.id, itemId))
    .returning();

  return item;
}

/**
 * Reorder items - update sort orders in batch
 */
export async function reorderItems(
  itemOrders: Array<{ id: string; sortOrder: number }>
): Promise<void> {
  // Use a transaction to update all items atomically
  await db.transaction(async (tx) => {
    for (const { id, sortOrder } of itemOrders) {
      await tx
        .update(items)
        .set({
          sortOrder,
          updatedAt: new Date(),
        })
        .where(eq(items.id, id));
    }
  });
}

/**
 * Get all items for a user on a specific day
 */
export async function getItemsForDay(dayId: string): Promise<Item[]> {
  return db
    .select()
    .from(items)
    .where(eq(items.dayId, dayId))
    .orderBy(items.sortOrder);
}

/**
 * Verify item belongs to user
 */
export async function verifyItemOwnership(itemId: string, userId: string): Promise<boolean> {
  const [item] = await db
    .select()
    .from(items)
    .where(and(eq(items.id, itemId), eq(items.userId, userId)));

  return !!item;
}
