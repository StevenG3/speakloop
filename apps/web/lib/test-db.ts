import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

export function createTestPrismaClient(prefix = "speakloop-test-") {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  const dbPath = join(dir, "test.db");
  const migrationsDir = join(process.cwd(), "../../prisma/migrations");
  process.env.DATABASE_URL = `file:${dbPath}`;

  for (const migration of readdirSync(migrationsDir).sort()) {
    execFileSync("sqlite3", [dbPath, `.read ${join(migrationsDir, migration, "migration.sql")}`], {
      stdio: "ignore",
      env: process.env
    });
  }

  return new PrismaClient();
}
