import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "cogniva-test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("cogniva feature procedures", () => {
  it("creates a simple non-clinical memory prompt from stored context", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.ai.memoryPrompt({
      title: "Family Birthday",
      description: "A dinner together",
      people: "Meena and Ravi",
      place: "Home",
    });

    expect(result.source).toBe("demo-fallback");
    expect(result.prompt).toContain("family birthday");
    expect(result.prompt).toContain("Meena and Ravi");
  });

  it("rejects an empty memory title through input validation", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.ai.memoryPrompt({ title: "", description: "A memory" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
