import { defineConfig } from "@playwright/test";

process.env.NO_PROXY = [process.env.NO_PROXY, "127.0.0.1", "localhost"].filter(Boolean).join(",");
process.env.no_proxy = [process.env.no_proxy, "127.0.0.1", "localhost"].filter(Boolean).join(",");

export default defineConfig({
  testDir: "./e2e",
  reporter: "list",
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
  use: {
    baseURL: "http://localhost:3107",
    permissions: ["microphone"],
    launchOptions: {
      args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"]
    }
  },
  webServer: {
    command: "cd ../.. && export DATABASE_URL='file:./dev.db' AUTH_SECRET='replace-with-a-long-random-secret' AUTH_URL='http://localhost:3107' ENCRYPTION_KEY='12345678901234567890123456789012' MOCK_PROVIDERS='true' LOG_LEVEL='info' NO_PROXY='127.0.0.1,localhost' no_proxy='127.0.0.1,localhost' && rm -f prisma/dev.db && pnpm prisma migrate dev && pnpm seed && pnpm --filter @speakloop/web exec next dev -H 127.0.0.1 -p 3107",
    url: "http://localhost:3107",
    reuseExistingServer: false,
    timeout: 120_000
  }
});
