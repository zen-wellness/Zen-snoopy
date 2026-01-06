import { z } from "zod";

// User (Auth)
export const userSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().optional(),
});
export type User = z.infer<typeof userSchema>;

// Task
export const taskSchema = z.object({
  id: z.string().optional(), // Firestore ID
  userId: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.string(), // HH:mm
  endTime: z.string(), // HH:mm
  completed: z.boolean().default(false),
  date: z.string(), // YYYY-MM-DD
});
export type Task = z.infer<typeof taskSchema>;

// Habit
export const habitSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  streak: z.number().default(0),
});
export type Habit = z.infer<typeof habitSchema>;

// Habit Log
export const habitLogSchema = z.object({
  id: z.string().optional(),
  habitId: z.string(),
  completedDate: z.string(), // YYYY-MM-DD
});
export type HabitLog = z.infer<typeof habitLogSchema>;

// Journal Entry
export const journalEntrySchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  content: z.string().min(1, "Content is required"),
  mood: z.string().optional(),
  date: z.string(), // YYYY-MM-DD
  createdAt: z.any().optional(), // Firestore Timestamp
});
export type JournalEntry = z.infer<typeof journalEntrySchema>;

// API Types
export type CreateTaskRequest = Omit<Task, "id" | "userId">;
export type UpdateTaskRequest = Partial<Omit<Task, "id" | "userId">>;

export type CreateHabitRequest = Omit<Habit, "id" | "userId" | "streak">;
export type UpdateHabitRequest = Partial<Omit<Habit, "id" | "userId" | "streak">>;

export type CreateJournalEntryRequest = Omit<JournalEntry, "id" | "userId" | "createdAt">;
export type UpdateJournalEntryRequest = Partial<Omit<JournalEntry, "id" | "userId" | "createdAt">>;
