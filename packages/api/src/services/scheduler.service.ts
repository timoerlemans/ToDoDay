import { eq } from 'drizzle-orm';
import { db } from '../db';
import { userSettings, type Item } from '../db/schema';
import { getOrCreateDay } from './day.service';
import { DEFAULT_SETTINGS, type ScheduleResult, type ScheduledItem, type NautilusItem } from '@tododay/shared';

interface TimeSlot {
  start: number; // minutes from midnight
  end: number;   // minutes from midnight
}

/**
 * Convert a database Item to a NautilusItem
 */
function itemToNautilusItem(item: Item): NautilusItem {
  return {
    id: item.id,
    type: item.type,
    text: item.text,
    sortOrder: item.sortOrder,
    completed: item.completed,
    completedAt: item.completedAt ?? undefined,
    startTime: item.startTime ?? undefined,
    endTime: item.endTime ?? undefined,
    duration: item.duration,
    priority: item.priority,
    parentId: item.parentId ?? undefined,
  };
}

/**
 * Get minutes from midnight for a Date
 */
function dateToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Convert minutes from midnight to a Date on the given base date
 */
function minutesToDate(minutes: number, baseDate: Date): Date {
  const date = new Date(baseDate);
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return date;
}

/**
 * Check if two time slots overlap
 */
function slotsOverlap(a: TimeSlot, b: TimeSlot): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Find the first available slot for a task of given duration
 * @param occupiedSlots - Array of occupied time slots
 * @param duration - Duration in minutes
 * @param workdayStart - Workday start in minutes from midnight
 * @param workdayEnd - Workday end in minutes from midnight
 * @param currentTime - Current time in minutes from midnight
 */
function findAvailableSlot(
  occupiedSlots: TimeSlot[],
  duration: number,
  workdayStart: number,
  workdayEnd: number,
  currentTime: number
): TimeSlot | null {
  // Sort occupied slots by start time
  const sorted = [...occupiedSlots].sort((a, b) => a.start - b.start);

  // Start from current time or workday start, whichever is later
  let searchStart = Math.max(workdayStart, currentTime);

  // Search for a gap that fits the duration
  for (const slot of sorted) {
    // If there's a gap before this slot that fits
    if (slot.start > searchStart && slot.start - searchStart >= duration) {
      return { start: searchStart, end: searchStart + duration };
    }
    // Move search start past this occupied slot
    if (slot.end > searchStart) {
      searchStart = slot.end;
    }
  }

  // Check if there's space after all slots but before workday end
  if (searchStart + duration <= workdayEnd) {
    return { start: searchStart, end: searchStart + duration };
  }

  return null;
}

/**
 * Get the computed schedule for a user on a specific date
 */
export async function getSchedule(userId: string, dateStr: string): Promise<ScheduleResult> {
  // Get user settings
  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));

  const workdayStart = (settings?.workdayStart ?? DEFAULT_SETTINGS.workdayStart) * 60;
  const workdayEnd = (settings?.workdayEnd ?? DEFAULT_SETTINGS.workdayEnd) * 60;
  const defaultDuration = settings?.defaultDuration ?? DEFAULT_SETTINGS.defaultDuration;

  // Get the day with items
  const day = await getOrCreateDay(userId, dateStr, false);

  if (!day || day.items.length === 0) {
    return {
      scheduled: [],
      overflow: [],
      freeMinutes: workdayEnd - workdayStart,
    };
  }

  const baseDate = new Date(dateStr);
  const now = new Date();
  const isToday = baseDate.toDateString() === now.toDateString();
  const currentTime = isToday ? dateToMinutes(now) : workdayStart;

  // Categorize items
  const events: Item[] = [];
  const completedTasks: Item[] = [];
  const pendingTasks: Item[] = [];

  for (const item of day.items) {
    if (item.type === 'event' || (item.startTime && item.endTime)) {
      events.push(item);
    } else if (item.completed) {
      completedTasks.push(item);
    } else {
      pendingTasks.push(item);
    }
  }

  // Build list of occupied time slots
  const occupiedSlots: TimeSlot[] = [];
  const scheduled: ScheduledItem[] = [];
  const overflow: NautilusItem[] = [];

  // 1. Schedule events at their fixed times (immovable)
  for (const event of events) {
    if (event.startTime && event.endTime) {
      const start = dateToMinutes(event.startTime);
      const end = dateToMinutes(event.endTime);

      occupiedSlots.push({ start, end });

      scheduled.push({
        item: itemToNautilusItem(event),
        scheduledStart: event.startTime,
        scheduledEnd: event.endTime,
        overflows: end > workdayEnd || start < workdayStart,
      });
    }
  }

  // 2. Pin completed tasks at their completedAt time
  for (const task of completedTasks) {
    if (task.completedAt) {
      const completedTime = dateToMinutes(task.completedAt);
      const start = completedTime;
      const end = completedTime + (task.duration || defaultDuration);

      occupiedSlots.push({ start, end });

      scheduled.push({
        item: itemToNautilusItem(task),
        scheduledStart: task.completedAt,
        scheduledEnd: minutesToDate(end, baseDate),
        overflows: false,
      });
    } else {
      // Completed but no timestamp - just add to scheduled at current position
      const slot = findAvailableSlot(
        occupiedSlots,
        task.duration || defaultDuration,
        workdayStart,
        workdayEnd,
        currentTime
      );

      if (slot) {
        occupiedSlots.push(slot);
        scheduled.push({
          item: itemToNautilusItem(task),
          scheduledStart: minutesToDate(slot.start, baseDate),
          scheduledEnd: minutesToDate(slot.end, baseDate),
          overflows: false,
        });
      }
    }
  }

  // 3. Fill pending tasks from current time, avoiding occupied slots
  // Sort by sort order to maintain user's preferred order
  const sortedPendingTasks = [...pendingTasks].sort((a, b) => a.sortOrder - b.sortOrder);

  for (const task of sortedPendingTasks) {
    const duration = task.duration || defaultDuration;

    // If task has a fixed start time, use it
    if (task.startTime) {
      const start = dateToMinutes(task.startTime);
      const end = start + duration;
      const slot = { start, end };

      // Check if it conflicts with existing slots
      const hasConflict = occupiedSlots.some(s => slotsOverlap(s, slot));

      if (!hasConflict && end <= workdayEnd) {
        occupiedSlots.push(slot);
        scheduled.push({
          item: itemToNautilusItem(task),
          scheduledStart: task.startTime,
          scheduledEnd: minutesToDate(end, baseDate),
          overflows: false,
        });
      } else {
        overflow.push(itemToNautilusItem(task));
      }
    } else {
      // Find next available slot
      const slot = findAvailableSlot(
        occupiedSlots,
        duration,
        workdayStart,
        workdayEnd,
        currentTime
      );

      if (slot) {
        occupiedSlots.push(slot);
        scheduled.push({
          item: itemToNautilusItem(task),
          scheduledStart: minutesToDate(slot.start, baseDate),
          scheduledEnd: minutesToDate(slot.end, baseDate),
          overflows: false,
        });
      } else {
        // Task doesn't fit in workday
        overflow.push(itemToNautilusItem(task));
      }
    }
  }

  // Calculate free minutes
  // Total workday minutes minus occupied minutes
  const totalWorkdayMinutes = workdayEnd - workdayStart;
  const occupiedMinutes = occupiedSlots.reduce((sum, slot) => {
    // Only count overlap with workday
    const start = Math.max(slot.start, workdayStart);
    const end = Math.min(slot.end, workdayEnd);
    return sum + Math.max(0, end - start);
  }, 0);
  const freeMinutes = Math.max(0, totalWorkdayMinutes - occupiedMinutes);

  // Sort scheduled items by start time
  scheduled.sort((a, b) => a.scheduledStart.getTime() - b.scheduledStart.getTime());

  return {
    scheduled,
    overflow,
    freeMinutes,
  };
}
