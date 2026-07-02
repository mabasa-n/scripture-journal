import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Users Table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(), // Maps to gen_random_uuid()
  googleId: varchar("google_id", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 2. Scripture Entries Table
export const scriptureEntries = pgTable(
  "scripture_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Foreign Key with Cascade Delete
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    heading: varchar("heading", { length: 255 }).notNull(),
    scriptureReference: varchar("scripture_reference", {
      length: 100,
    }).notNull(),
    scriptureText: text("scripture_text").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    // 3. Index for Performance
    return {
      userIdIdx: index("idx_scripture_entries_user_id").on(table.userId),
    };
  },
);

// --- Enterprise Feature: Drizzle Relations ---
// Defining these relations allows you to easily query a user and
// automatically pull their scriptures without writing manual JOINs.

export const usersRelations = relations(users, ({ many }) => ({
  scriptures: many(scriptureEntries),
}));

export const scriptureEntriesRelations = relations(
  scriptureEntries,
  ({ one }) => ({
    user: one(users, {
      fields: [scriptureEntries.userId],
      references: [users.id],
    }),
  }),
);
