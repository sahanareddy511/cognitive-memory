import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  gameResults,
  memories,
  people,
  places,
  profiles,
  reminders,
  type InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role || user.openId === ENV.ownerOpenId) {
    values.role = user.role ?? "admin";
    updateSet.role = values.role;
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result[0];
}

export async function saveProfile(userId: number, data: Omit<typeof profiles.$inferInsert, "id" | "userId" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(profiles).values({ userId, ...data }).onDuplicateKeyUpdate({ set: data });
  return getProfile(userId);
}

export async function listMemories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memories).where(eq(memories.userId, userId)).orderBy(desc(memories.memoryDate));
}

export async function addMemory(userId: number, data: Omit<typeof memories.$inferInsert, "id" | "userId" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(memories).values({ userId, ...data });
  return listMemories(userId);
}

export async function deleteMemory(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(memories).where(and(eq(memories.id, id), eq(memories.userId, userId)));
  return listMemories(userId);
}

export async function listPeople(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(people).where(eq(people.userId, userId)).orderBy(desc(people.createdAt));
}

export async function listPlaces(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(places).where(eq(places.userId, userId)).orderBy(desc(places.createdAt));
}

export async function listReminders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reminders).where(eq(reminders.userId, userId)).orderBy(reminders.reminderTime);
}

export async function addReminder(userId: number, data: Omit<typeof reminders.$inferInsert, "id" | "userId" | "createdAt" | "completed" | "active">) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(reminders).values({ userId, completed: 0, active: 1, ...data });
  return listReminders(userId);
}

export async function setReminderCompleted(userId: number, id: number, completed: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(reminders).set({ completed: completed ? 1 : 0 }).where(and(eq(reminders.id, id), eq(reminders.userId, userId)));
  return listReminders(userId);
}

export async function deleteReminder(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(reminders).where(and(eq(reminders.id, id), eq(reminders.userId, userId)));
  return listReminders(userId);
}

export async function listGames(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gameResults).where(eq(gameResults.userId, userId)).orderBy(desc(gameResults.completedAt));
}

export async function addGame(userId: number, data: Omit<typeof gameResults.$inferInsert, "id" | "userId" | "completedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(gameResults).values({ userId, ...data });
  return listGames(userId);
}
