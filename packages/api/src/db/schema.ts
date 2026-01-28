import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  date,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const itemTypeEnum = pgEnum('item_type', ['task', 'event']);
export const priorityEnum = pgEnum('priority', ['normal', 'urgent']);
export const timestampFormatEnum = pgEnum('timestamp_format', ['12h', '24h']);
export const colorSchemeEnum = pgEnum('color_scheme', ['light', 'dark', 'system']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  settings: one(userSettings),
  days: many(days),
  sessions: many(sessions),
}));

// Sessions table (for refresh tokens)
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  refreshToken: text('refresh_token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// User settings table
export const userSettings = pgTable('user_settings', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  workdayStart: integer('workday_start').notNull().default(9),
  workdayEnd: integer('workday_end').notNull().default(17),
  defaultDuration: integer('default_duration').notNull().default(30),
  timestampFormat: timestampFormatEnum('timestamp_format').notNull().default('24h'),
  colorScheme: colorSchemeEnum('color_scheme').notNull().default('system'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

// Days table
export const days = pgTable(
  'days',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  table => [
    uniqueIndex('days_user_date_idx').on(table.userId, table.date),
  ]
);

export const daysRelations = relations(days, ({ one, many }) => ({
  user: one(users, {
    fields: [days.userId],
    references: [users.id],
  }),
  items: many(items),
}));

// Items table (tasks and events)
export const items = pgTable(
  'items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    dayId: uuid('day_id')
      .notNull()
      .references(() => days.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: itemTypeEnum('type').notNull().default('task'),
    text: text('text').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    completed: boolean('completed').notNull().default(false),
    completedAt: timestamp('completed_at'),
    startTime: timestamp('start_time'),
    endTime: timestamp('end_time'),
    duration: integer('duration').notNull().default(30), // minutes
    priority: priorityEnum('priority').notNull().default('normal'),
    parentId: uuid('parent_id'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  table => [
    index('items_day_sort_idx').on(table.dayId, table.sortOrder),
    index('items_user_idx').on(table.userId),
  ]
);

export const itemsRelations = relations(items, ({ one, many }) => ({
  day: one(days, {
    fields: [items.dayId],
    references: [days.id],
  }),
  user: one(users, {
    fields: [items.userId],
    references: [users.id],
  }),
  parent: one(items, {
    fields: [items.parentId],
    references: [items.id],
    relationName: 'parentChild',
  }),
  children: many(items, {
    relationName: 'parentChild',
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type UserSetting = typeof userSettings.$inferSelect;
export type NewUserSetting = typeof userSettings.$inferInsert;

export type Day = typeof days.$inferSelect;
export type NewDay = typeof days.$inferInsert;

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
