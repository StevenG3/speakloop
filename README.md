# SpeakLoop

SpeakLoop is a Phase-1 MVP for speaking-first language practice. It is a pnpm + Turborepo monorepo with a Next.js web app, Prisma/SQLite persistence, pure domain logic in `packages/core`, shared UI tokens, and mock LLM/STT/TTS providers enabled by default.

## Prerequisites

- Node.js 22+ recommended.
- pnpm 9.x.
- SQLite CLI available as `sqlite3`.

## Environment

`.env.example` contains every required variable:

```bash
DATABASE_URL="file:./dev.db"
AUTH_SECRET="replace-with-a-long-random-secret"
ENCRYPTION_KEY="12345678901234567890123456789012"
MOCK_PROVIDERS="true"
LOG_LEVEL="info"
```

The app runs fully on mocks with no paid API keys. `pnpm validate:env` validates the required variables with Zod before dev startup.

## Setup

```bash
pnpm install
pnpm validate:env
pnpm prisma migrate dev
pnpm seed
pnpm dev
```

`pnpm dev` starts the web app through Turborepo. By default it uses mock providers, so the full conversation loop works locally without external services.

For physical iPhone validation over HTTPS, use the staging checklist in `docs/IPHONE_STAGING.md`.

## Seeded Accounts

- Demo learner: `demo@speakloop.dev` / `demo12345`
- Admin: `admin@speakloop.dev` / `admin12345`

The demo account can log in, start a free-talk session, complete a mock turn, save vocabulary, and review due cards. The admin account can view provider config, create provider configs through the admin API, and run mock test connections.

## Commands

```bash
pnpm install
pnpm validate:env
pnpm prisma migrate dev
pnpm seed
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

## Mock Provider Workflow

- STT reads deterministic fixture names like `hello-ko.wav`.
- LLM returns a short tutor reply, corrections, and vocabulary candidates.
- TTS returns the committed `/fixtures/audio/tts-mock.wav` file, so browser playback has no 404.
- Provider request logs are written with a `trace_id` for each turn.

To add a real provider later, implement the provider interface in `packages/core`, register it behind the provider registry/config tables, and keep mock providers available for tests.

## Test Workflow

Run the full gate before handing off changes:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

Playwright starts its own dev server on `127.0.0.1:3107`, runs the Phase-1 user/admin flows, and writes visual baselines under `apps/web/visual-baselines`.

## iOS Native Path

Round 2 uses the documentation-first native path instead of scaffolding `apps/mobile`. The concrete Expo Go, iOS simulator, permission, and TestFlight plan lives in `docs/IOS.md`.

Short version: the future Expo app should import `@speakloop/core`, call the existing backend API, configure `NSMicrophoneUsageDescription`, and verify the same mock-provider loop in Expo Go before moving to TestFlight.
