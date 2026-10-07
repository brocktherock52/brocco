/**
 * Drizzle schema for brocco.dev.
 *
 * Tables:
 *   users     - auth identity, plan tier, last-seen
 *   sessions  - better-auth session storage
 *   accounts  - better-auth credential / OAuth account storage
 *   verifications - better-auth magic-link / email-verification tokens
 *   threads   - one chat thread per user, with the agent crew that owns it
 *   messages  - append-only log of user + agent turns per thread
 *
 * The users/sessions/accounts/verifications shape follows better-auth's
 * drizzle adapter contract. The threads + messages tables match the
 * scaffold brief verbatim (users.id is a uuid foreign key target).
 */
import { pgTable, text, timestamp, uuid, jsonb, boolean, integer, primaryKey, check, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  emailVerified: boolean('email_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastSeenAt: timestamp('last_seen_at'),
  plan: text('plan').default('free'), // free | solo | team
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const threads = pgTable('threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  agents: jsonb('agents').$type<string[]>().notNull(), // ['researcher','planner']
  isPublic: boolean('is_public').default(false).notNull(),
  // "Watching out for you" cadence (Braeden's retention ask). The cron watcher
  // checks watchEnabled projects every refreshCadenceHours and files an alert
  // when one is due. The actual re-run is client-side BYOK (see lib/refresh.ts).
  watchEnabled: boolean('watch_enabled').default(true).notNull(),
  refreshCadenceHours: integer('refresh_cadence_hours').default(72).notNull(),
  lastCheckedAt: timestamp('last_checked_at'), // when the watcher last evaluated this
  lastRefreshedAt: timestamp('last_refreshed_at'), // when it was actually re-run
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Notifications surfaced in the dashboard bell. The watcher inserts
// 'refresh_due' rows on a cadence; a client refresh inserts 'changes_found'
// rows carrying the "what changed since last run" summary.
export const projectAlerts = pgTable('project_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id')
    .references(() => threads.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  kind: text('kind').notNull(), // refresh_due | changes_found
  summary: text('summary'),
  status: text('status').default('unread').notNull(), // unread | read
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Per-project "brain". Each run/refresh appends a compact skill entry
// (what we did / what we learned / what changed) so iteration N+1 builds on
// iteration N. Read back into the run context on every run. Stays BYOK-safe:
// the entries live in the DB, the client passes them into the run context.
export const projectMemory = pgTable('project_memory', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id')
    .references(() => threads.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  iteration: integer('iteration').default(1).notNull(),
  did: text('did'), // what this iteration did
  learned: text('learned'), // what it learned
  changed: text('changed'), // what changed vs the prior iteration
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id')
    .references(() => threads.id, { onDelete: 'cascade' })
    .notNull(),
  role: text('role').notNull(), // user | agent | system
  agent: text('agent'), // null for user, slug for agent
  content: text('content').notNull(),
  meta: jsonb('meta').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const billingCustomers = pgTable('billing_customers', {
  customerId: text('customer_id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [index('billing_customers_user_idx').on(table.userId)]);

export const hostedUsage = pgTable('hosted_usage', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  month: text('month').notNull(),
  runs: integer('runs').notNull().default(0),
  day: text('day').notNull(),
  dayRuns: integer('day_runs').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.month] }),
  check('hosted_usage_nonnegative', sql`${table.runs} >= 0 AND ${table.dayRuns} >= 0`),
  check('hosted_usage_month_format', sql`${table.month} ~ '^[0-9]{4}-[0-9]{2}$'`),
  check('hosted_usage_day_format', sql`${table.day} ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'`),
]);

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Thread = typeof threads.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ProjectAlert = typeof projectAlerts.$inferSelect;
export type ProjectMemory = typeof projectMemory.$inferSelect;
