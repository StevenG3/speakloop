import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createPrismaClient } from "./db";
import {
  authenticateUser,
  hashPassword,
  maskSecret,
  registerUser,
  requireAdminApi,
  verifyPassword
} from "./auth";
import { decryptSecret, encryptSecret } from "./secrets";

describe("auth and RBAC", () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    const dir = mkdtempSync(join(tmpdir(), "speakloop-auth-"));
    const dbPath = join(dir, "test.db");
    process.env.DATABASE_URL = `file:${dbPath}`;
    process.env.ENCRYPTION_KEY = "12345678901234567890123456789012";
    execFileSync("sqlite3", [dbPath, `.read ${join(process.cwd(), "../../prisma/migrations/20260521153300_init/migration.sql")}`], {
      stdio: "ignore",
      env: process.env
    });
    prisma = createPrismaClient();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  it("hashes and verifies passwords with bcrypt", async () => {
    const hash = await hashPassword("correct horse battery staple");

    expect(hash).not.toBe("correct horse battery staple");
    await expect(verifyPassword("correct horse battery staple", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong", hash)).resolves.toBe(false);
  });

  it("registers a user and rejects duplicate email addresses", async () => {
    const user = await registerUser(prisma, {
      email: "learner@speakloop.dev",
      password: "password123",
      displayName: "Learner",
      nativeLanguage: "en"
    });

    expect(user.email).toBe("learner@speakloop.dev");
    await expect(
      registerUser(prisma, {
        email: "learner@speakloop.dev",
        password: "password123",
        displayName: "Other",
        nativeLanguage: "en"
      })
    ).rejects.toThrow(/already registered/);
  });

  it("authenticates valid credentials and rejects invalid credentials", async () => {
    await registerUser(prisma, {
      email: "login@speakloop.dev",
      password: "password123",
      displayName: "Login",
      nativeLanguage: "en"
    });

    await expect(authenticateUser(prisma, "login@speakloop.dev", "password123")).resolves.toMatchObject({
      email: "login@speakloop.dev",
      role: "user"
    });
    await expect(authenticateUser(prisma, "login@speakloop.dev", "wrong")).resolves.toBeNull();
  });

  it("returns 403 for non-admin admin API access", async () => {
    const response = await requireAdminApi({ user: { id: "u1", email: "u@speakloop.dev", role: "user" } });

    expect(response.status).toBe(403);
    await expect(response.text()).resolves.toContain("Forbidden");
  });

  it("encrypts and decrypts provider API keys", () => {
    const encrypted = encryptSecret("sk-test-1234", "12345678901234567890123456789012");

    expect(encrypted).not.toContain("sk-test-1234");
    expect(decryptSecret(encrypted, "12345678901234567890123456789012")).toBe("sk-test-1234");
  });

  it("masks provider API keys without leaking the full secret", () => {
    expect(maskSecret("sk-live-abcdef1234")).toBe("sk-•••••1234");
    expect(maskSecret(null)).toBe("");
  });
});
