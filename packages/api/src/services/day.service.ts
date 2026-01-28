import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { days, items, type Day, type NewDay, type Item } from '../db/schema';

export interface DayWithItems extends Day {
  items: Item[];
}

/**
 * Get a day by date for a user, optionally creating it if it doesn't exist
 */
export async function getOrCreateDay(
  userId: string,
  date: string,
  createIfNotExists: boolean = true
): Promise<DayWithItems | null> {
  // Try to find existing day
  const [existingDay] = await db
    .select()
    .from(days)
    .where(and(eq(days.userId, userId), eq(days.date, date)));

  let day = existingDay;

  // Create if doesn't exist and requested
  if (!day && createIfNotExists) {
    const [newDay] = await db
      .insert(days)
      .values({
        userId,
        date,
      })
      .returning();
    day = newDay;
  }

  if (!day) {
    return null;
  }

  // Fetch items for the day
  const dayItems = await db
    .select()
    .from(items)
    .where(eq(items.dayId, day.id))
    .orderBy(items.sortOrder);

  return {
    ...day,
    items: dayItems,
  };
}

/**
 * Get a day by ID
 */
export async function getDayById(dayId: string): Promise<Day | null> {
  const [day] = await db
    .select()
    .from(days)
    .where(eq(days.id, dayId));

  return day ?? null;
}

/**
 * Get a day by date for a user
 */
export async function getDayByDate(userId: string, date: string): Promise<Day | null> {
  const [day] = await db
    .select()
    .from(days)
    .where(and(eq(days.userId, userId), eq(days.date, date)));

  return day ?? null;
}

/**
 * Create a new day
 */
export async function createDay(data: NewDay): Promise<Day> {
  const [day] = await db
    .insert(days)
    .values(data)
    .returning();

  return day;
}

/**
 * Update day notes
 */
export async function updateDayNotes(dayId: string, notes: string | null): Promise<Day> {
  const [day] = await db
    .update(days)
    .set({
      notes,
      updatedAt: new Date(),
    })
    .where(eq(days.id, dayId))
    .returning();

  return day;
}

/**
 * Delete a day and all its items (cascades)
 */
export async function deleteDay(dayId: string): Promise<void> {
  await db
    .delete(days)
    .where(eq(days.id, dayId));
}

/**
 * Get all items for a day
 */
export async function getDayItems(dayId: string): Promise<Item[]> {
  return db
    .select()
    .from(items)
    .where(eq(items.dayId, dayId))
    .orderBy(items.sortOrder);
}
