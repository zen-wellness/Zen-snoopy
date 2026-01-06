import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const authMiddleware = (req: any, res: any, next: any) => {
    // Fallback for development/firebase header
    const authHeader = req.headers['authorization'];
    req.user = req.user || { uid: authHeader?.split('Bearer ')[1] || 'test-user' };
    next();
  };

  app.use('/api', authMiddleware);

  // Tasks
  app.get(api.tasks.list.path, async (req, res) => {
    const date = req.query.date as string;
    if (!date) return res.status(400).json({ message: "Date is required" });
    
    // Check if tasks exist for this date
    let tasks = await storage.getTasks(date);
    
    // If no tasks exist, automatically seed the default schedule
    if (tasks.length === 0) {
      console.log(`No tasks found for ${date}, seeding default schedule...`);
      const defaultSchedule = [
        { title: "Sleeping", startTime: "02:00", endTime: "08:00", date },
        { title: "Prep for school day", startTime: "08:01", endTime: "09:30", date },
        { title: "Daily reflection / journal time / me time", startTime: "09:31", endTime: "12:00", date },
        { title: "Mommy duties", startTime: "12:01", endTime: "17:00", date },
        { title: "Gaming time", startTime: "17:01", endTime: "19:00", date },
        { title: "Homework time", startTime: "19:01", endTime: "20:00", date },
        { title: "Butt cleaning time", startTime: "20:01", endTime: "21:00", date },
        { title: "Showtime", startTime: "21:01", endTime: "23:00", date },
        { title: "Gaming / show but have to be off by 2", startTime: "23:01", endTime: "02:00", date },
      ];

      for (const item of defaultSchedule) {
        // @ts-ignore
        await storage.createTask({
          ...item,
          userId: (req as any).user?.uid || 'test-user',
          completed: false,
        });
      }
      // Re-fetch tasks after seeding
      tasks = await storage.getTasks(date);
    }
    
    res.json(tasks);
  });

  app.post(api.tasks.create.path, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      // @ts-ignore
      const task = await storage.createTask({ ...input, userId: req.user.uid });
      res.status(201).json(task);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json(e.errors);
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.tasks.update.path, async (req, res) => {
    try {
      const input = api.tasks.update.input.parse(req.body);
      const task = await storage.updateTask(req.params.id, input);
      res.json(task);
    } catch (e) {
      res.status(404).json({ message: "Task not found" });
    }
  });

  app.delete(api.tasks.delete.path, async (req, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.status(204).end();
    } catch (e) {
      res.status(404).json({ message: "Task not found" });
    }
  });

  // Habits
  app.get(api.habits.list.path, async (req, res) => {
    const habits = await storage.getHabits();
    res.json(habits);
  });

  app.post(api.habits.create.path, async (req, res) => {
    try {
      const input = api.habits.create.input.parse(req.body);
      // @ts-ignore
      const habit = await storage.createHabit({ ...input, userId: req.user.uid });
      res.status(201).json(habit);
    } catch (e) {
      if (e instanceof z.ZodError) return res.status(400).json(e.errors);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.habits.delete.path, async (req, res) => {
    try {
      await storage.deleteHabit(req.params.id);
      res.status(204).end();
    } catch (e) {
      res.status(404).json({ message: "Habit not found" });
    }
  });

  app.post(api.habits.log.path, async (req, res) => {
    try {
      const { date } = api.habits.log.input.parse(req.body);
      const habit = await storage.logHabit(req.params.id, date);
      res.json(habit);
    } catch (e) {
      res.status(404).json({ message: "Habit not found" });
    }
  });

  // Journal
  app.get(api.journal.list.path, async (req, res) => {
    const entries = await storage.getJournalEntries(req.query.date as string);
    res.json(entries);
  });

  // User schedule initialization
  app.post("/api/user/setup-schedule", async (req, res) => {
    try {
      const schedule = [
        { title: "Sleeping", startTime: "02:00", endTime: "08:00", date: new Date().toISOString().split('T')[0] },
        { title: "Prep for school day", startTime: "08:01", endTime: "09:30", date: new Date().toISOString().split('T')[0] },
        { title: "Daily reflection / journal time / me time", startTime: "09:31", endTime: "12:00", date: new Date().toISOString().split('T')[0] },
        { title: "Mommy duties", startTime: "12:01", endTime: "17:00", date: new Date().toISOString().split('T')[0] },
        { title: "Gaming time", startTime: "17:01", endTime: "19:00", date: new Date().toISOString().split('T')[0] },
        { title: "Homework time", startTime: "19:01", endTime: "20:00", date: new Date().toISOString().split('T')[0] },
        { title: "Butt cleaning time", startTime: "20:01", endTime: "21:00", date: new Date().toISOString().split('T')[0] },
        { title: "Showtime", startTime: "21:01", endTime: "23:00", date: new Date().toISOString().split('T')[0] },
        { title: "Gaming / show but have to be off by 2", startTime: "23:01", endTime: "02:00", date: new Date().toISOString().split('T')[0] },
      ];

      for (const item of schedule) {
        // @ts-ignore
        await storage.createTask({
          ...item,
          userId: (req as any).user?.uid || (req as any).user?.id || 'test-user',
          completed: false,
        });
      }
      console.log("Schedule setup successful for user:", (req as any).user?.uid || 'test-user');
      res.json({ message: "Schedule setup complete", schedule });
    } catch (error) {
      console.error("Schedule setup error:", error);
      res.status(500).json({ message: "Failed to setup schedule" });
    }
  });

  app.post(api.journal.create.path, async (req, res) => {
    try {
      const input = api.journal.create.input.parse(req.body);
      // @ts-ignore
      const entry = await storage.createJournalEntry({ ...input, userId: req.user.uid });
      res.status(201).json(entry);
    } catch (e) {
      if (e instanceof z.ZodError) return res.status(400).json(e.errors);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Quotes
  const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" }
  ];

  app.get(api.quotes.random.path, (req, res) => {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    res.json(quote);
  });

  // User schedule initialization
  app.post("/api/user/setup-schedule", async (req, res) => {
    try {
      const schedule = [
        { title: "Sleeping", startTime: "02:00", endTime: "08:00", date: new Date().toISOString().split('T')[0] },
        { title: "Prep for school day", startTime: "08:01", endTime: "09:30", date: new Date().toISOString().split('T')[0] },
        { title: "Daily reflection / journal time / me time", startTime: "09:31", endTime: "12:00", date: new Date().toISOString().split('T')[0] },
        { title: "Mommy duties", startTime: "12:01", endTime: "17:00", date: new Date().toISOString().split('T')[0] },
        { title: "Gaming time", startTime: "17:01", endTime: "19:00", date: new Date().toISOString().split('T')[0] },
        { title: "Homework time", startTime: "19:01", endTime: "20:00", date: new Date().toISOString().split('T')[0] },
        { title: "Butt cleaning time", startTime: "20:01", endTime: "21:00", date: new Date().toISOString().split('T')[0] },
        { title: "Showtime", startTime: "21:01", endTime: "23:00", date: new Date().toISOString().split('T')[0] },
        { title: "Gaming / show but have to be off by 2", startTime: "23:01", endTime: "02:00", date: new Date().toISOString().split('T')[0] },
      ];

      for (const item of schedule) {
        // @ts-ignore
        await storage.createTask({
          ...item,
          userId: req.user?.uid || 'test-user',
          completed: false,
        });
      }
      res.json({ message: "Schedule setup complete" });
    } catch (error) {
      res.status(500).json({ message: "Failed to setup schedule" });
    }
  });

  return httpServer;
}
