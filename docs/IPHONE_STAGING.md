# iPhone Staging Verification

This guide brings the current SpeakLoop web app onto a real iPhone through an HTTPS staging URL. It is intended for the current PWA-first implementation before a native TestFlight app exists.

## Local Staging Environment

Create a private `.env.local` in the repo root:

```bash
DATABASE_URL="file:./dev.db"
AUTH_SECRET="replace-with-a-long-random-secret"
AUTH_TRUST_HOST="true"
ENCRYPTION_KEY="12345678901234567890123456789012"
MOCK_PROVIDERS="true"
LOG_LEVEL="info"
```

`AUTH_TRUST_HOST=true` lets Auth.js trust the HTTPS tunnel host, which is useful because quick tunnel URLs change between runs.

Prepare the database and seed accounts:

```bash
pnpm ios:prepare
```

Start the app:

```bash
pnpm --filter @speakloop/web dev
```

Expose it through HTTPS with one of these:

```bash
cloudflared tunnel --url http://localhost:3000
```

```bash
ngrok http 3000
```

Open the generated `https://...` URL on iPhone Safari.

## Accounts

- Learner: `demo@speakloop.dev` / `demo12345`
- Admin: `admin@speakloop.dev` / `admin12345`

## Real iPhone Acceptance Checklist

- Open the HTTPS URL in Safari and verify the landing page renders without horizontal scrolling.
- Register a fresh account, complete onboarding, refresh, and verify the session survives.
- Log in as the learner account and start a practice session.
- Tap Enable microphone from a user gesture and verify iOS shows the microphone permission prompt.
- Complete one mock speaking turn, then save vocabulary from the assistant result.
- Open Vocabulary, verify the saved term is visible, and search for it.
- Open Review, reveal the answer, grade it, and verify the graded feedback appears.
- Log in as the admin account, open Provider Config, and run Test connection.
- Log in as the learner account and verify `/admin/providers` redirects away from admin.
- Use Safari Share -> Add to Home Screen, launch SpeakLoop from the home screen, and repeat login plus one practice turn.
- Rotate portrait/landscape once and verify navigation, bottom controls, and safe-area spacing remain usable.

## Pass Criteria

The staging build is acceptable for iPhone validation when:

- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, and `pnpm build` pass.
- The HTTPS tunnel or staging URL loads on a physical iPhone without certificate warnings.
- Microphone permission can be requested and the unsupported-permission state is recoverable.
- Login, practice, vocabulary, review, and admin provider flows write to the backend database.
- The app is installable to the iOS home screen and remains usable as a standalone PWA.

