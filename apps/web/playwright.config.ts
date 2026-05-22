import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3107"
  },
  webServer: {
    command: "cd ../.. && pnpm prisma migrate dev && pnpm seed && DATABASE_URL='file:./dev.db' AUTH_SECRET='replace-with-a-long-random-secret' ENCRYPTION_KEY='12345678901234567890123456789012' MOCK_PROVIDERS='true' LOG_LEVEL='info' pnpm --filter @speakloop/web exec next dev -H 127.0.0.1 -p 3107",
    url: "http://127.0.0.1:3107",
    reuseExistingServer: false,
    timeout: 120_000
  }
});
