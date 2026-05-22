# SpeakLoop iOS Native Path

Chosen option: documentation-first native path for Round 2.

Round 2 keeps the production target as the installable web PWA and documents the native migration path instead of adding an Expo app skeleton. This avoids creating a shallow second app before the API and audio contracts settle, while still making the iOS route concrete.

## Target Architecture

- Create `apps/mobile` with Expo Router and React Native.
- Import shared domain types, provider contracts, prompt helpers, SRS, and session state-machine logic from `@speakloop/core`.
- Keep authentication, turns, vocabulary, review, and admin provider configuration on the existing Next.js backend API.
- Replace browser `MediaRecorder` with Expo AV / native recording APIs, but preserve the same turn payload shape where possible.

## Required iOS Permissions

Add these keys to the native iOS config:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>SpeakLoop uses the microphone to record your speaking-practice turns.</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>SpeakLoop may use speech recognition for speaking-practice feedback in future provider adapters.</string>
```

For Expo, include the microphone copy in `app.json`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSMicrophoneUsageDescription": "SpeakLoop uses the microphone to record your speaking-practice turns."
      }
    }
  }
}
```

## Expo Go / Simulator Path

1. Add `apps/mobile` with Expo Router.
2. Install shared workspace dependencies and configure Metro to resolve `@speakloop/core`.
3. Point the mobile app at the local Next.js API by LAN URL, for example `http://192.168.1.10:3100`.
4. Run `pnpm --filter @speakloop/mobile start`.
5. Open with Expo Go on device, or press `i` to launch the iOS simulator.
6. Verify login, microphone permission prompt, one mock turn, vocabulary save, and review grading.

## TestFlight Path

1. Add EAS project config once the Expo app exists.
2. Run `eas build --platform ios --profile preview`.
3. Upload to App Store Connect and distribute through TestFlight.
4. Before external testing, verify microphone permission copy, offline mock-provider flow, and backend API base URL configuration.

## Round-2 Status

The native app is not scaffolded in this round. The committed deliverable is this migration plan plus the PWA/iOS web readiness work.
