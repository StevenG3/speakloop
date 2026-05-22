import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

export function createTestPrismaClient(prefix = "speakloop-test-") {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  const dbPath = join(dir, "test.db");
  process.env.DATABASE_URL = `file:${dbPath}`;
  execFileSync("sqlite3", [dbPath, `.read ${join(process.cwd(), "../../prisma/migrations/20260521153300_init/migration.sql")}`], {
    stdio: "ignore",
    env: process.env
  });

  return new PrismaClient();
}
