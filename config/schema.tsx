import { integer, json, pgTable, text, serial, varchar } from "drizzle-orm/pg-core";

export const UsersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer(),
});

export const SessionChatTable = pgTable("sessionChatTable", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar().notNull(),
  notes: text(),
  selectedDoctor: json(),
  conversation: json(),
  report: json(),
  createdBy: varchar().references(() => UsersTable.email),
  createdOn: varchar(),
});

export const SessionMessagesTable = pgTable("session_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(), // "assistant" | "user"
  content: text("content").notNull(),
  createdOn: text("created_on").notNull(),
});
