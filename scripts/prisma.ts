import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { parse } from "dotenv";

const root = resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const prismaBin = join(root, "node_modules/.bin/prisma");

if (args[0] === "migrate" && args[1] === "dev") {
  const databaseUrl = process.env.DATABASE_URL ?? parse(readFileSync(join(root, ".env.example"))).DATABASE_URL;
  if (!databaseUrl?.startsWith("file:")) {
    throw new Error("The local migrate wrapper only supports SQLite file: DATABASE_URL values.");
  }

  const dbPath = resolve(root, "prisma", databaseUrl.replace("file:", ""));
  const migrationPath = join(root, "prisma/migrations/20260521153300_init/migration.sql");

  execFileSync("mkdir", ["-p", dirname(dbPath)]);
  if (!existsSync(dbPath)) {
    execFileSync("sqlite3", [dbPath, `.read ${migrationPath}`], { stdio: "inherit" });
  } else {
    const userSettingsColumns = execFileSync("sqlite3", [dbPath, "PRAGMA table_info(UserSettings);"], {
      encoding: "utf8"
    });
    if (userSettingsColumns && !userSettingsColumns.split("\n").some((line) => line.split("|")[1] === "goal")) {
      execFileSync("sqlite3", [
        dbPath,
        "ALTER TABLE UserSettings ADD COLUMN goal TEXT NOT NULL DEFAULT 'Everyday conversation';"
      ]);
    }
  }
  execFileSync(prismaBin, ["generate"], { cwd: root, stdio: "inherit", env: { ...process.env, DATABASE_URL: databaseUrl } });
  console.log(`SQLite database is ready at ${databaseUrl}`);
} else {
  execFileSync(prismaBin, args, { cwd: root, stdio: "inherit", env: process.env });
}
