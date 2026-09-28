import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 32 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  preferredName: varchar("preferredName", { length: 120 }),
  age: int("age"),
  favoriteActivities: text("favoriteActivities"),
  importantPeople: text("importantPeople"),
  importantPlaces: text("importantPlaces"),
  dailyRoutine: text("dailyRoutine"),
  preferredReminderTimes: text("preferredReminderTimes"),
  avatarUrl: text("avatarUrl"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const memories = mysqlTable("memories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").notNull(),
  memoryDate: varchar("memoryDate", { length: 32 }),
  category: varchar("category", { length: 64 }).default("Family").notNull(),
  people: varchar("people", { length: 240 }),
  place: varchar("place", { length: 160 }),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const people = mysqlTable("people", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  relationship: varchar("relationship", { length: 80 }).notNull(),
  notes: text("notes"),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const places = mysqlTable("places", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 180 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const reminders = mysqlTable("reminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description"),
  reminderDate: varchar("reminderDate", { length: 32 }).notNull(),
  reminderTime: varchar("reminderTime", { length: 16 }).notNull(),
  repeatFrequency: varchar("repeatFrequency", { length: 32 }).default("Once").notNull(),
  priority: varchar("priority", { length: 24 }).default("Normal").notNull(),
  completed: int("completed").default(0).notNull(),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const gameResults = mysqlTable("gameResults", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  gameType: varchar("gameType", { length: 80 }).notNull(),
  score: int("score").notNull(),
  accuracy: int("accuracy").notNull(),
  timeTaken: int("timeTaken").notNull(),
  difficulty: varchar("difficulty", { length: 32 }).notNull(),
  attempts: int("attempts").default(1).notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export const recommendations = mysqlTable("recommendations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  gameType: varchar("gameType", { length: 80 }).notNull(),
  reason: text("reason").notNull(),
  difficulty: varchar("difficulty", { length: 32 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type Memory = typeof memories.$inferSelect;
export type Person = typeof people.$inferSelect;
export type Place = typeof places.$inferSelect;
export type Reminder = typeof reminders.$inferSelect;
export type GameResult = typeof gameResults.$inferSelect;
