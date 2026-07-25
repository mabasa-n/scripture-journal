import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// 1. Users Table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(), // Maps to gen_random_uuid()
  googleId: varchar("google_id", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
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
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("idx_scripture_entries_user_id").on(table.userId),
      headingNotEmpty: check(
        "scripture_entries_heading_not_empty",
        sql`char_length(btrim(${table.heading})) > 0`,
      ),
      scriptureReferenceNotEmpty: check(
        "scripture_entries_reference_not_empty",
        sql`char_length(btrim(${table.scriptureReference})) > 0`,
      ),
      scriptureTextNotEmpty: check(
        "scripture_entries_text_not_empty",
        sql`char_length(btrim(${table.scriptureText})) > 0`,
      ),
      descriptionNotEmptyWhenPresent: check(
        "scripture_entries_description_not_empty_when_present",
        sql`${table.description} IS NULL OR char_length(btrim(${table.description})) > 0`,
      ),
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
