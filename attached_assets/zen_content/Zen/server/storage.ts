import { 
  Task, Habit, JournalEntry, 
  CreateTaskRequest, UpdateTaskRequest,
  CreateHabitRequest, UpdateHabitRequest,
  CreateJournalEntryRequest, UpdateJournalEntryRequest
} from "@shared/schema";
import { db as firebase_db } from "./lib/firebase";
import { randomUUID } from "crypto";
import admin from "firebase-admin";

export interface IStorage {
  // Tasks
  getTasks(date: string): Promise<Task[]>;
  createTask(task: CreateTaskRequest & { userId: string }): Promise<Task>;
  updateTask(id: string, update: UpdateTaskRequest): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  // Habits
  getHabits(): Promise<Habit[]>;
  createHabit(habit: CreateHabitRequest & { userId: string }): Promise<Habit>;
  deleteHabit(id: string): Promise<void>;
  logHabit(id: string, date: string): Promise<Habit>; // Returns updated habit (streak)

  // Journal
  getJournalEntries(date?: string): Promise<JournalEntry[]>;
  createJournalEntry(entry: CreateJournalEntryRequest & { userId: string }): Promise<JournalEntry>;
  updateJournalEntry(id: string, entry: UpdateJournalEntryRequest): Promise<JournalEntry>;
}

export class FirestoreStorage implements IStorage {
  async getTasks(date: string): Promise<Task[]> {
    if (!firebase_db) return [];
    const snapshot = await firebase_db.collection("tasks").where("date", "==", date).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  }

  async createTask(task: CreateTaskRequest & { userId: string }): Promise<Task> {
    if (!firebase_db) throw new Error("Firestore not initialized");
    const docRef = await firebase_db.collection("tasks").add(task);
    return { id: docRef.id, ...task };
  }

  async updateTask(id: string, update: UpdateTaskRequest): Promise<Task> {
    if (!firebase_db) throw new Error("Firestore not initialized");
    await firebase_db.collection("tasks").doc(id).update(update);
    const doc = await firebase_db.collection("tasks").doc(id).get();
    return { id: doc.id, ...doc.data() } as Task;
  }

  async deleteTask(id: string): Promise<void> {
    if (!firebase_db) throw new Error("Firestore not initialized");
    await firebase_db.collection("tasks").doc(id).delete();
  }

  async getHabits(): Promise<Habit[]> {
    if (!firebase_db) return [];
    const snapshot = await firebase_db.collection("habits").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
  }

  async createHabit(habit: CreateHabitRequest & { userId: string }): Promise<Habit> {
    if (!firebase_db) throw new Error("Firestore not initialized");
    const docRef = await firebase_db.collection("habits").add({ ...habit, streak: 0 });
    return { id: docRef.id, ...habit, streak: 0 };
  }

  async deleteHabit(id: string): Promise<void> {
    if (!firebase_db) throw new Error("Firestore not initialized");
    await firebase_db.collection("habits").doc(id).delete();
  }

  async logHabit(id: string, date: string): Promise<Habit> {
    if (!firebase_db) throw new Error("Firestore not initialized");
    // Simple logic: Increment streak. In real app, check previous log dates.
    const habitRef = firebase_db.collection("habits").doc(id);
    await firebase_db.runTransaction(async (t) => {
      const doc = await t.get(habitRef);
      const data = doc.data() as Habit;
      t.update(habitRef, { streak: (data.streak || 0) + 1 });
      // Log the entry
      const logRef = firebase_db.collection("habitLogs").doc();
      t.set(logRef, { habitId: id, completedDate: date });
    });
    const updated = await habitRef.get();
    return { id: updated.id, ...updated.data() } as Habit;
  }

  async getJournalEntries(date?: string): Promise<JournalEntry[]> {
    if (!firebase_db) return [];
    let query: any = firebase_db.collection("journalEntries");
    if (date) {
      query = query.where("date", "==", date);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as JournalEntry));
  }

  async createJournalEntry(entry: CreateJournalEntryRequest & { userId: string }): Promise<JournalEntry> {
    if (!firebase_db) throw new Error("Firestore not initialized");
    const docRef = await firebase_db.collection("journalEntries").add({
      ...entry,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: docRef.id, ...entry };
  }

  async updateJournalEntry(id: string, entry: UpdateJournalEntryRequest): Promise<JournalEntry> {
    if (!firebase_db) throw new Error("Firestore not initialized");
    await firebase_db.collection("journalEntries").doc(id).update(entry);
    const doc = await firebase_db.collection("journalEntries").doc(id).get();
    return { id: doc.id, ...doc.data() } as JournalEntry;
  }
}

export class MemStorage implements IStorage {
  private tasks: Map<string, Task> = new Map();
  private habits: Map<string, Habit> = new Map();
  private journal: Map<string, JournalEntry> = new Map();

  async getTasks(date: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(t => t.date === date);
  }

  async createTask(task: CreateTaskRequest & { userId: string }): Promise<Task> {
    const id = randomUUID();
    const newTask = { ...task, id };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: string, update: UpdateTaskRequest): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) throw new Error("Task not found");
    const updated = { ...task, ...update };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    this.tasks.delete(id);
  }

  async getHabits(): Promise<Habit[]> {
    return Array.from(this.habits.values());
  }

  async createHabit(habit: CreateHabitRequest & { userId: string }): Promise<Habit> {
    const id = randomUUID();
    const newHabit = { ...habit, id, streak: 0 };
    this.habits.set(id, newHabit);
    return newHabit;
  }

  async deleteHabit(id: string): Promise<void> {
    this.habits.delete(id);
  }

  async logHabit(id: string, date: string): Promise<Habit> {
    const habit = this.habits.get(id);
    if (!habit) throw new Error("Habit not found");
    const updated = { ...habit, streak: habit.streak + 1 };
    this.habits.set(id, updated);
    return updated;
  }

  async getJournalEntries(date?: string): Promise<JournalEntry[]> {
    const entries = Array.from(this.journal.values());
    if (date) {
      return entries.filter(e => e.date === date);
    }
    return entries;
  }

  async createJournalEntry(entry: CreateJournalEntryRequest & { userId: string }): Promise<JournalEntry> {
    const id = randomUUID();
    const newEntry = { ...entry, id };
    this.journal.set(id, newEntry);
    return newEntry;
  }

  async updateJournalEntry(id: string, entry: UpdateJournalEntryRequest): Promise<JournalEntry> {
    const existing = this.journal.get(id);
    if (!existing) throw new Error("Journal entry not found");
    const updated = { ...existing, ...entry };
    this.journal.set(id, updated);
    return updated;
  }
}

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as authModels from "@shared/models/auth";

export const db_pg = drizzle(new pg.Pool({ connectionString: process.env.DATABASE_URL }), { schema: authModels });

// Fallback to MemStorage if Firebase is not fully configured or if Firestore fails
const isFirebaseConfigured = !!process.env.VITE_FIREBASE_PROJECT_ID;
// Use MemStorage for now as per instructions, but ensure it's not tied to Replit Auth sessions
export const storage: IStorage = new MemStorage();
export const db: any = db_pg;
