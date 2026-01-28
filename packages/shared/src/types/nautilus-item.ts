/**
 * Core data models for ToDoDay Spiral Planner
 */

/**
 * Represents a task or event in the planner
 */
export interface NautilusItem {
  /** Unique identifier */
  id: string;
  /** Type of item */
  type: 'task' | 'event';
  /** Display text (task/event description) */
  text: string;
  /** Sort order in the list */
  sortOrder: number;
  /** Whether the item is completed */
  completed: boolean;
  /** Timestamp when completed (for completed items) */
  completedAt?: Date;

  // Time info
  /** Fixed start time (for events, or scheduled tasks) */
  startTime?: Date;
  /** Fixed end time (for events) */
  endTime?: Date;
  /** Duration in minutes (tasks: estimated, events: calculated from start/end) */
  duration: number;

  // Rendering
  /** Priority level for visual styling */
  priority: 'normal' | 'urgent';
  /** Parent item ID (for hierarchical lists) */
  parentId?: string;
}

/**
 * Represents a segment in the spiral visualization
 */
export interface SpiralSegment {
  /** The source item for this segment */
  item: NautilusItem;
  /** Start angle in degrees from workday start */
  startAngle: number;
  /** End angle in degrees */
  endAngle: number;
  /** Color for rendering (blue/yellow/gray/red) */
  color: string;
  /** Layer number for nested items */
  layer: number;
  /** Whether this segment is interactive */
  interactive: boolean;
}

/**
 * Scheduled item with calculated position
 */
export interface ScheduledItem {
  /** The original item */
  item: NautilusItem;
  /** Calculated start time for display */
  scheduledStart: Date;
  /** Calculated end time for display */
  scheduledEnd: Date;
  /** Whether this item overflows the workday */
  overflows: boolean;
}

/**
 * Result of the scheduling algorithm
 */
export interface ScheduleResult {
  /** All scheduled items */
  scheduled: ScheduledItem[];
  /** Items that couldn't be scheduled (overflow) */
  overflow: NautilusItem[];
  /** Free time remaining in minutes */
  freeMinutes: number;
}

/**
 * User settings for the planner
 */
export interface UserSettings {
  /** Workday start hour (0-23) */
  workdayStart: number;
  /** Workday end hour (0-23) */
  workdayEnd: number;
  /** Default duration for tasks without explicit duration (minutes) */
  defaultDuration: number;
  /** Timestamp format for display */
  timestampFormat: '12h' | '24h';
  /** Color scheme preference */
  colorScheme: 'light' | 'dark' | 'system';
}

/**
 * Default user settings
 */
export const DEFAULT_SETTINGS: UserSettings = {
  workdayStart: 9,
  workdayEnd: 17,
  defaultDuration: 30,
  timestampFormat: '24h',
  colorScheme: 'system',
};

/**
 * A day with its items
 */
export interface Day {
  /** Unique identifier */
  id: string;
  /** The date (YYYY-MM-DD format) */
  date: string;
  /** Optional notes for the day */
  notes?: string;
  /** Items for this day */
  items: NautilusItem[];
}
