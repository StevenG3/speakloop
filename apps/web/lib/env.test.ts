import { describe, expect, it } from "vitest";
import { loadEnvFiles, validateEnv } from "./env";

describe("validateEnv", () => {
  it("fails with a clear error when a required variable is missing", () => {
    expect(() =>
      validateEnv({
        AUTH_SECRET: "test-auth-secret",
        ENCRYPTION_KEY: "12345678901234567890123456789012",
        MOCK_PROVIDERS: "true",
        LOG_LEVEL: "info"
      })
    ).toThrow(/DATABASE_URL/);
  });

  it("passes when the full Phase-1 environment is present", () => {
    const env = validateEnv({
      DATABASE_URL: "file:./dev.db",
      AUTH_SECRET: "test-auth-secret",
      ENCRYPTION_KEY: "12345678901234567890123456789012",
      MOCK_PROVIDERS: "true",
      LOG_LEVEL: "info"
    });

    expect(env).toEqual({
      DATABASE_URL: "file:./dev.db",
      AUTH_SECRET: "test-auth-secret",
      ENCRYPTION_KEY: "12345678901234567890123456789012",
      MOCK_PROVIDERS: true,
      LOG_LEVEL: "info"
    });
  });

  it("loads .env.example defaults when no local .env file exists", () => {
    const env = loadEnvFiles(process.cwd());

    expect(env.DATABASE_URL).toBe("file:./dev.db");
    expect(env.MOCK_PROVIDERS).toBe("true");
  });
});
