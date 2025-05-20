import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const channels = pgTable("channels", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  created_by: uuid("created_by").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
