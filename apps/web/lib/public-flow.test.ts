import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { PrismaClient } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createPrismaClient } from "./db";
import {
  getLoginRedirect,
  onboardingSchema,
  persistOnboardingSettings,
  validateLoginInput,
  validateRegisterInput
} from "./public-flow";

describe("public auth and onboarding flow", () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    const dir = mkdtempSync(join(tmpdir(), "speakloop-public-"));
    const dbPath = join(dir, "test.db");
    process.env.DATABASE_URL = `file:${dbPath}`;
    execFileSync("sqlite3", [dbPath, `.read ${join(process.cwd(), "../../prisma/migrations/20260521153300_init/migration.sql")}`], {
      stdio: "ignore",
      env: process.env
    });
    prisma = createPrismaClient();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  it("validates login and register form paths with field-level errors", () => {
    expect(validateLoginInput({ email: "bad", password: "" }).success).toBe(false);
    expect(validateRegisterInput({ email: "ok@speakloop.dev", password: "short", displayName: "" }).success).toBe(
      false
    );
    expect(
      validateRegisterInput({
        email: "ok@speakloop.dev",
        password: "password123",
        displayName: "Ok"
      }).success
    ).toBe(true);
  });

  it("persists onboarding target language, level, and goal to user settings", async () => {
    const user = await prisma.user.create({ data: { email: "onboard@speakloop.dev", password_hash: "hash" } });

    await persistOnboardingSettings(prisma, user.id, {
      targetLanguage: "zh",
      level: "intermediate",
      goal: "Travel conversation"
    });

    await expect(prisma.userSettings.findUniqueOrThrow({ where: { user_id: user.id } })).resolves.toMatchObject({
      target_language: "zh",
      level: "intermediate",
      goal: "Travel conversation"
    });
  });

  it("keeps onboarding choices inside the Phase-1 language and level set", () => {
    expect(onboardingSchema.safeParse({ targetLanguage: "fr", level: "beginner", goal: "travel" }).success).toBe(
      false
    );
    expect(onboardingSchema.safeParse({ targetLanguage: "ko", level: "advanced", goal: "interviews" }).success).toBe(
      true
    );
  });

  it("redirects to the requested safe app path after login", () => {
    expect(getLoginRedirect("/app/practice")).toBe("/app/practice");
    expect(getLoginRedirect("https://evil.example")).toBe("/app");
    expect(getLoginRedirect(null)).toBe("/app");
  });
});
