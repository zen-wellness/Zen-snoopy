import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertMoodCheckSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import { auth as adminAuth } from "./lib/firebase";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// Middleware to verify Auth
async function verifyAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Ensure user exists in our DB
    const user = await storage.createUser({
      id: uid,
      email: email || "",
      displayName: name || email?.split('@')[0] || "User",
      photoURL: picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
    });

    (req as any).user = { uid: user.id, email: user.email, name: user.displayName };
    
    // Check if the user needs their template schedule for today
    const now = new Date();
    const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    
    const allTasks = await storage.getTasks(user.id);
    
    const templateTasks = [
      { title: "Sleep", startTime: "02:00", endTime: "08:00" },
      { title: "School prep", startTime: "08:01", endTime: "09:30" },
      { title: "Sleep/Journal/Alone time", startTime: "09:31", endTime: "12:00" },
      { title: "Mommy duties", startTime: "12:01", endTime: "17:00" },
      { title: "Gaming time", startTime: "17:01", endTime: "19:00" },
      { title: "Homework time", startTime: "19:01", endTime: "20:00" },
      { title: "Time to clean that ass", startTime: "20:01", endTime: "21:00" },
      { title: "Show time", startTime: "21:01", endTime: "23:00" },
      { title: "Gaming time", startTime: "23:01", endTime: "02:00" },
    ];

    // Seed for today and next 7 days if missing
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      const dateStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
      
      const hasTasksForDate = allTasks.some(t => t.date === dateStr);
      if (!hasTasksForDate) {
        console.log(`SEEDING TASKS FOR USER ${user.id} ON ${dateStr}`);
        for (const task of templateTasks) {
          await storage.createTask(user.id, {
            ...task,
            userId: user.id,
            date: dateStr,
            completed: false,
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error("Auth verification failed:", error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // -- Tasks --
  app.get(api.tasks.list.path, verifyAuth, async (req, res) => {
    const userId = (req as any).user.uid;
    const date = req.query.date as string;
    let tasks = await storage.getTasks(userId);
    if (date) {
      tasks = tasks.filter(t => t.date === date);
    }
    res.json(tasks);
  });

  app.post(api.tasks.create.path, verifyAuth, async (req, res) => {
    const userId = (req as any).user.uid;
    const input = api.tasks.create.input.parse(req.body);
    const task = await storage.createTask(userId, input);
    res.status(201).json(task);
  });

  app.put(api.tasks.update.path, verifyAuth, async (req, res) => {
    const userId = (req as any).user.uid;
    const id = Number(req.params.id);
    const input = api.tasks.update.input.parse(req.body);
    const task = await storage.updateTask(id, userId, input);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  });

  app.delete(api.tasks.delete.path, verifyAuth, async (req, res) => {
    const userId = (req as any).user.uid;
    const id = Number(req.params.id);
    await storage.deleteTask(id, userId);
    res.status(204).end();
  });

  // -- Habits --
  app.get(api.habits.list.path, verifyAuth, async (req, res) => {
    const userId = (req as any).user.uid;
    const habits = await storage.getHabits(userId);
    res.json(habits);
  });

  app.post(api.habits.create.path, verifyAuth, async (req, res) => {
    const userId = (req as any).user.uid;
    const input = api.habits.create.input.parse(req.body);
    const habit = await storage.createHabit(userId, input);
    res.status(201).json(habit);
  });

  app.put(api.habits.update.path, verifyAuth, async (req, res) => {
    const userId = (req as any).user.uid;
    const id = Number(req.params.id);
    const input = api.habits.update.input.parse(req.body);
    const habit = await storage.updateHabit(id, userId, input);
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    res.json(habit);
  });

  app.delete(api.habits.delete.path, verifyAuth, async (req, res) => {
    const userId = (req as any).user.uid;
    const id = Number(req.params.id);
    await storage.deleteHabit(id, userId);
    res.status(204).end();
  });

  app.post(api.habits.log.path, verifyAuth, async (req, res) => {
    const id = Number(req.params.id);
    const input = z.object({ date: z.string() }).parse(req.body);
    const log = await storage.logHabit(id, { habitId: id, completedDate: input.date });
    res.json(log);
  });

  // -- Journal --
  app.get(api.journal.list.path, verifyAuth, async (req, res) => {
    const userId = (req as any).user.uid;
    const date = req.query.date as string;
    let entries = await storage.getJournalEntries(userId);
    if (date) {
      entries = entries.filter(e => e.date === date);
    }
    res.json(entries);
  });

  app.patch("/api/user/settings", verifyAuth, async (req, res) => {
    const userId = (req as any).user.uid;
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const updatedUser = await storage.createUser({
      ...user,
      notificationsEnabled: req.body.notificationsEnabled ?? user.notificationsEnabled,
      notificationLeadTime: req.body.notificationLeadTime ?? user.notificationLeadTime,
    });
    res.json(updatedUser);
  });

  app.post(api.journal.create.path, verifyAuth, async (req, res) => {
    const userId = (req as any).user.uid;
    const input = api.journal.create.input.parse({ ...req.body, userId });
    const entry = await storage.createJournalEntry(userId, input);
    res.status(201).json(entry);
  });

  app.delete(api.journal.delete.path, verifyAuth, async (req, res) => {
    const userId = (req as any).user.uid;
    const id = Number(req.params.id);
    await storage.deleteJournalEntry(id, userId);
    res.status(204).end();
  });

  // -- Mood Checks --
  app.get("/api/mood-checks", verifyAuth, async (req, res) => {
    const userId = (req as any).user.uid;
    const checks = await storage.getMoodChecks(userId);
    res.json(checks);
  });

  app.post("/api/mood-checks", verifyAuth, async (req, res) => {
    const userId = (req as any).user.uid;
    const input = insertMoodCheckSchema.parse({ ...req.body, userId });
    const check = await storage.createMoodCheck(userId, input);
    res.status(201).json(check);
  });

  // -- Chat --
  app.get("/api/chat-messages", verifyAuth, async (req, res) => {
    const userId = (req as any).user.uid;
    const messages = await storage.getChatMessages(userId);
    res.json(messages);
  });

  app.post("/api/chat-messages", verifyAuth, async (req, res) => {
    const userId = (req as any).user.uid;
    const input = insertChatMessageSchema.parse({ ...req.body, userId });
    const message = await storage.createChatMessage(userId, input);
    
    try {
      // Get conversation history for context
      const history = await storage.getChatMessages(userId);
      // Take last 5 messages for context
      const context = history.slice(0, 5).reverse().map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      }));

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { 
            role: "system", 
            content: "You are Snoopy, a kind and supportive AI wellness guide, therapist, and life management coach. You are very attentive, caring, and deeply invested in the user's well-being. You help users manage their sleep, mood, and daily schedule with a blend of professional empathy and warm companionship. Your tone is gentle, encouraging, and insightful. When giving advice, be practical yet nurturing. Occasionally use 'Woodstock' metaphors to symbolize support and friendship. Always prioritize the user's mental health and glow-up journey." 
          },
          ...context,
          { role: "user", content: input.content }
        ],
        max_completion_tokens: 500
      });

      const aiContent = response.choices[0]?.message?.content || "I'm here for you. How else can I help?";

      const aiResponse = await storage.createChatMessage(userId, {
        userId,
        role: "assistant",
        content: aiContent,
      });

      res.status(201).json([message, aiResponse]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      const fallbackResponse = await storage.createChatMessage(userId, {
        userId,
        role: "assistant",
        content: "I'm here to listen. Tell me more about how you're feeling.",
      });
      res.status(201).json([message, fallbackResponse]);
    }
  });

  return httpServer;
}
