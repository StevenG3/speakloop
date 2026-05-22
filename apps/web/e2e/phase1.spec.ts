import { mkdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const visualDir = "visual-baselines";

test.beforeAll(() => {
  mkdirSync(visualDir, { recursive: true });
});

test("register and login flows are reachable", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  await page.getByLabel("Display name").fill("E2E Learner");
  await page.getByLabel("Email").fill(`e2e-${Date.now()}@speakloop.dev`);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/onboarding/);

  await login(page, "demo@speakloop.dev", "demo12345");
  await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible();
});

test("creates a conversation, completes a mock turn, saves vocab, and reviews it", async ({ page }) => {
  await login(page, "demo@speakloop.dev", "demo12345");
  await page.goto("/app/practice");
  await page.getByRole("button", { name: "Start session" }).click();
  await expect(page).toHaveURL(/\/app\/session\//);

  await page.getByRole("button", { name: "Push to talk" }).click();
  await expect(page.getByText("Save vocabulary")).toBeVisible();
  await page.getByRole("button", { name: /Save / }).first().click();
  await expect(page.getByText(/Saved /)).toBeVisible();

  await page.goto("/app/vocab");
  await expect(page.getByRole("heading", { name: "Vocabulary" })).toBeVisible();
  await expect(page.getByText("연습").first()).toBeVisible();

  await page.goto("/app/review");
  await page.getByRole("button", { name: "Reveal answer" }).click();
  await page.getByRole("button", { name: "Good" }).click();
  await expect(page.getByText("Graded good")).toBeVisible();
});

test("admin can create provider config and test connection", async ({ page }) => {
  await login(page, "admin@speakloop.dev", "admin12345");
  const response = await page.request.post("/api/admin/providers", {
    data: {
      kind: "llm",
      vendor: "mock",
      model: `mock-chat-${Date.now()}`,
      api_key: "sk-e2e-1234",
      role: "fallback",
      is_active: true
    }
  });
  expect(response.ok()).toBeTruthy();

  await page.goto("/admin/providers");
  await expect(page.getByRole("heading", { name: "Provider Config" })).toBeVisible();
  await page.getByRole("button", { name: "Test LLM connection" }).first().click();
  await expect(page.getByText("Connection ok")).toBeVisible();
});

test("non-admin users are blocked from admin APIs and pages", async ({ page }) => {
  await login(page, "demo@speakloop.dev", "demo12345");
  const response = await page.request.post("/api/admin/providers", {
    data: { kind: "llm", vendor: "mock", model: "blocked", role: "primary", is_active: true }
  });
  expect(response.status()).toBe(403);

  await page.goto("/admin/providers");
  await expect(page).toHaveURL(/\/app/);
});

for (const width of [375, 768, 1440]) {
  test(`visual baselines at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.screenshot({ path: `${visualDir}/landing-${width}.png`, fullPage: true });

    await login(page, "demo@speakloop.dev", "demo12345");
    await page.screenshot({ path: `${visualDir}/dashboard-${width}.png`, fullPage: true });

    await page.goto("/app/practice");
    await page.getByRole("button", { name: "Start session" }).click();
    await page.screenshot({ path: `${visualDir}/session-${width}.png`, fullPage: true });

    await page.goto("/app/vocab");
    await page.screenshot({ path: `${visualDir}/vocab-${width}.png`, fullPage: true });

    await page.goto("/app/review");
    await page.screenshot({ path: `${visualDir}/review-${width}.png`, fullPage: true });

    await login(page, "admin@speakloop.dev", "admin12345");
    await page.goto("/admin/providers");
    await page.screenshot({ path: `${visualDir}/admin-${width}.png`, fullPage: true });
  });
}

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/app/);
}
