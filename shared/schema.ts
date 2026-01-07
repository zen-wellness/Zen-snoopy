import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table now uses text ID to store Firebase UID
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Firebase UID
  email: text("email"),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  notificationsEnabled: boolean("notifications_enabled").default(true).notNull(),
  notificationLeadTime: integer("notification_lead_time").default(5).notNull(), // minutes before task
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  startTime: text("start_time"), // HH:mm
  endTime: text("end_time"), // HH:mm
  completed: boolean("completed").default(false).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
});

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  streak: integer("streak").default(0).notNull(),
});

export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(), // Foreign key to habits
  completedDate: text("completed_date").notNull(), // YYYY-MM-DD
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  mood: text("mood"), // e.g., 'happy', 'sad', etc.
  date: text("date").notNull(), // YYYY-MM-DD
  createdAt: timestamp("created_at").defaultNow(),
});

export const moodChecks = pgTable("mood_checks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  mood: text("mood").notNull(),
  meal: text("meal"),
  timeOfDay: text("time_of_day").notNull(), // 'morning', 'afternoon', 'night'
  date: text("date").notNull(), // YYYY-MM-DD
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
  logs: many(habitLogs),
}));

export const habitLogsRelations = relations(habitLogs, ({ one }) => ({
  habit: one(habits, {
    fields: [habitLogs.habitId],
    references: [habits.id],
  }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
}));

export const moodChecksRelations = relations(moodChecks, ({ one }) => ({
  user: one(users, {
    fields: [moodChecks.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export const insertHabitSchema = createInsertSchema(habits).omit({ id: true, streak: true });
export const insertHabitLogSchema = createInsertSchema(habitLogs).omit({ id: true });
export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({ id: true, createdAt: true });
export const insertMoodCheckSchema = createInsertSchema(moodChecks).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Habit = typeof habits.$inferSelect;
export type HabitLog = typeof habitLogs.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type MoodCheck = typeof moodChecks.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type InsertMoodCheck = z.infer<typeof insertMoodCheckSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
