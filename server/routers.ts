import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addGame,
  addMemory,
  addReminder,
  deleteMemory,
  deleteReminder,
  getProfile,
  listGames,
  listMemories,
  listPeople,
  listPlaces,
  listReminders,
  saveProfile,
  setReminderCompleted,
} from "./db";

const memoryInput = z.object({
  title: z.string().min(2).max(160),
  description: z.string().min(2),
  memoryDate: z.string().optional(),
  category: z.string().default("Family"),
  people: z.string().optional(),
  place: z.string().optional(),
  imageUrl: z.string().optional(),
});

const reminderInput = z.object({
  title: z.string().min(2).max(160),
  description: z.string().optional(),
  reminderDate: z.string(),
  reminderTime: z.string(),
  repeatFrequency: z.string().default("Once"),
  priority: z.string().default("Normal"),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  profile: router({
    get: protectedProcedure.query(({ ctx }) => getProfile(ctx.user.id)),
    save: protectedProcedure.input(z.object({
      preferredName: z.string().optional(), age: z.number().int().min(1).max(120).optional(),
      favoriteActivities: z.string().optional(), importantPeople: z.string().optional(),
      importantPlaces: z.string().optional(), dailyRoutine: z.string().optional(),
      preferredReminderTimes: z.string().optional(), avatarUrl: z.string().optional(),
    })).mutation(({ ctx, input }) => saveProfile(ctx.user.id, input)),
  }),
  memories: router({
    list: protectedProcedure.query(({ ctx }) => listMemories(ctx.user.id)),
    add: protectedProcedure.input(memoryInput).mutation(({ ctx, input }) => addMemory(ctx.user.id, input)),
    remove: protectedProcedure.input(z.object({ id: z.number().int() })).mutation(({ ctx, input }) => deleteMemory(ctx.user.id, input.id)),
  }),
  people: router({ list: protectedProcedure.query(({ ctx }) => listPeople(ctx.user.id)) }),
  places: router({ list: protectedProcedure.query(({ ctx }) => listPlaces(ctx.user.id)) }),
  reminders: router({
    list: protectedProcedure.query(({ ctx }) => listReminders(ctx.user.id)),
    add: protectedProcedure.input(reminderInput).mutation(({ ctx, input }) => addReminder(ctx.user.id, input)),
    toggle: protectedProcedure.input(z.object({ id: z.number().int(), completed: z.boolean() })).mutation(({ ctx, input }) => setReminderCompleted(ctx.user.id, input.id, input.completed)),
    remove: protectedProcedure.input(z.object({ id: z.number().int() })).mutation(({ ctx, input }) => deleteReminder(ctx.user.id, input.id)),
  }),
  games: router({
    list: protectedProcedure.query(({ ctx }) => listGames(ctx.user.id)),
    add: protectedProcedure.input(z.object({ gameType: z.string(), score: z.number().int(), accuracy: z.number().int().min(0).max(100), timeTaken: z.number().int().min(0), difficulty: z.string(), attempts: z.number().int().min(1) })).mutation(({ ctx, input }) => addGame(ctx.user.id, input)),
  }),
  ai: router({
    memoryPrompt: protectedProcedure.input(z.object({ title: z.string().min(2), description: z.string().min(2), people: z.string().optional(), place: z.string().optional() })).mutation(({ input }) => ({
      prompt: input.people ? `Do you remember ${input.title.toLowerCase()} with ${input.people}?` : `Do you remember ${input.title.toLowerCase()}?`,
      source: "demo-fallback",
    })),
    recommendation: protectedProcedure.query(async ({ ctx }) => {
      const games = await listGames(ctx.user.id);
      const latest = games[0];
      if (!latest) return { gameType: "Daily Orientation", difficulty: "Gentle", reason: "A calm way to begin today and build a familiar routine." };
      if (latest.accuracy < 60) return { gameType: "Memory Matching", difficulty: "Beginner", reason: "A short, visual activity can be a comfortable next step." };
      return { gameType: "Number Recall", difficulty: "Easy", reason: "Your recent activity was strong. Try a slightly more challenging recall activity." };
    }),
  }),
});

export type AppRouter = typeof appRouter;
