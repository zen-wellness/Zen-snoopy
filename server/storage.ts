import { db } from "./db";
import {
  users, tasks, habits, habitLogs, journalEntries,
  type User, type InsertUser,
  type Task, type InsertTask,
  type Habit, type InsertHabit,
  type HabitLog, type InsertHabitLog,
  type JournalEntry, type InsertJournalEntry
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Tasks
  getTasks(userId: string): Promise<Task[]>;
  createTask(userId: string, task: InsertTask): Promise<Task>;
  updateTask(id: number, userId: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number, userId: string): Promise<void>;

  // Habits
  getHabits(userId: string): Promise<(Habit & { logs: HabitLog[] })[]>;
  createHabit(userId: string, habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, userId: string, habit: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: number, userId: string): Promise<void>;
  
  // Habit Logs
  logHabit(habitId: number, log: InsertHabitLog): Promise<HabitLog>;

  // Journal
  getJournalEntries(userId: string): Promise<JournalEntry[]>;
  createJournalEntry(userId: string, entry: InsertJournalEntry): Promise<JournalEntry>;
  deleteJournalEntry(id: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).onConflictDoUpdate({
      target: users.id,
      set: {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }
    }).returning();
    return newUser;
  }

  async getTasks(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async createTask(userId: string, task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values({ ...task, userId }).returning();
    return newTask;
  }

  async updateTask(id: number, userId: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(updates)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number, userId: string): Promise<void> {
    await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  }

  async getHabits(userId: string): Promise<(Habit & { logs: HabitLog[] })[]> {
    const userHabits = await db.select().from(habits).where(eq(habits.userId, userId));
    const habitsWithLogs = await Promise.all(userHabits.map(async (habit) => {
      const logs = await db.select().from(habitLogs).where(eq(habitLogs.habitId, habit.id));
      return { ...habit, logs };
    }));
    return habitsWithLogs;
  }

  async createHabit(userId: string, habit: InsertHabit): Promise<Habit> {
    const [newHabit] = await db.insert(habits).values({ ...habit, userId }).returning();
    return newHabit;
  }

  async updateHabit(id: number, userId: string, updates: Partial<InsertHabit>): Promise<Habit | undefined> {
    const [updatedHabit] = await db
      .update(habits)
      .set(updates)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning();
    return updatedHabit;
  }

  async deleteHabit(id: number, userId: string): Promise<void> {
    await db.delete(habitLogs).where(eq(habitLogs.habitId, id)); // Cascade delete logs
    await db.delete(habits).where(and(eq(habits.id, id), eq(habits.userId, userId)));
  }

  async logHabit(habitId: number, log: InsertHabitLog): Promise<HabitLog> {
    const [newLog] = await db.insert(habitLogs).values({ ...log, habitId }).returning();
    // Update streak logic could go here or in a separate service
    return newLog;
  }

  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries).where(eq(journalEntries.userId, userId));
  }

  async createJournalEntry(userId: string, entry: InsertJournalEntry): Promise<JournalEntry> {
    const [newEntry] = await db.insert(journalEntries).values({ ...entry, userId }).returning();
    return newEntry;
  }

  async deleteJournalEntry(id: number, userId: string): Promise<void> {
    await db.delete(journalEntries).where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
