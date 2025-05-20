import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';

export const channelMembers = pgTable('channel_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  channel_id: uuid('channel_id').notNull().references(() => 'channels.id'),
  user_id: uuid('user_id').notNull(),
  joined_at: timestamp('joined_at').defaultNow().notNull(),
}); 