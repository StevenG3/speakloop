import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parse } from "dotenv";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  ENCRYPTION_KEY: z
    .string()
    .length(32, "ENCRYPTION_KEY must be exactly 32 characters"),
  MOCK_PROVIDERS: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info")
});

export type AppEnv = z.infer<typeof envSchema>;

export function validateEnv(input: Record<string, string | undefined>): AppEnv {
  const result = envSchema.safeParse(input);

  if (!result.success) {
    const messages = result.error.issues.map((issue) => {
      const key = issue.path.join(".") || "environment";
      return `${key}: ${issue.message}`;
    });

    throw new Error(`Invalid environment:\n${messages.join("\n")}`);
  }

  return result.data;
}

export function loadEnvFiles(startDir: string): Record<string, string | undefined> {
  const candidates: string[] = [];
  let current = startDir;

  for (let depth = 0; depth < 4; depth += 1) {
    candidates.push(join(current, ".env.example"));
    candidates.push(join(current, ".env"));

    const next = dirname(current);
    if (next === current) {
      break;
    }
    current = next;
  }

  return candidates.reduce<Record<string, string | undefined>>(
    (env, filePath) =>
      existsSync(filePath)
        ? { ...parse(readFileSync(filePath)), ...env }
        : env,
    { ...process.env }
  );
}

if (process.argv[1]?.endsWith("env.ts")) {
  validateEnv(loadEnvFiles(process.cwd()));
  console.log("Environment validated");
}
