# SpeakLoop Design

## Visual Identity

SpeakLoop is a modern, warm, motivating language-learning app. The UI is mobile-first, high contrast, generous with whitespace, and calm enough for anxious speaking practice.

Round-2 direction: Warm elevated gradient surfaces, iOS-native restraint, and friendly coaching energy. The app should feel premium without becoming decorative: soft light, tactile cards, generous touch zones, and emotionally clear state changes.

## Typography

- Display family: `Inter, ui-sans-serif, system-ui, sans-serif`
- Body family: `Inter, ui-sans-serif, system-ui, sans-serif`
- Scale: `xs 12`, `sm 14`, `base 16`, `lg 18`, `xl 24`, `2xl 32`, `3xl 40`
- Weights: `400`, `500`, `600`, `700`
- Line height: body `1.5`, headings `1.2`

## Spacing

Allowed spacing values only: `4`, `8`, `12`, `16`, `24`, `32`, `48`, `64`.

## Radius

- `sm 8`
- `md 12`
- `lg 16`
- `xl 24`
- `full 9999`
- Cards use `lg`; buttons use `md`; pills use `full`.

## Color Variables

Light:

- `--bg #fffaf6`
- `--surface #ffffff`
- `--surface-elevated #fff3e8`
- `--text #201713`
- `--text-muted #6f5c51`
- `--primary #d9572b`
- `--primary-fg #ffffff`
- `--accent #1f8a70`
- `--success #257a4f`
- `--warning #a86400`
- `--danger #b42318`
- `--border #ead8cc`

Dark:

- `--bg #161311`
- `--surface #211c19`
- `--surface-elevated #2d241f`
- `--text #fff7f0`
- `--text-muted #c9b6aa`
- `--primary #ff8a5c`
- `--primary-fg #241007`
- `--accent #61d3b1`
- `--success #72d49a`
- `--warning #f0b35a`
- `--danger #ff8f85`
- `--border #463830`

## Motion

Animation duration is `150-250ms`, easing is `ease-out`, and animated properties are limited to transform and opacity. Respect `prefers-reduced-motion`.

## Buttons

Use one primary action per view. Variants are `primary`, `secondary`, `ghost`, and `destructive`. All interactive targets are at least `44px`.

## Skeletons

Use shimmering blocks that match final layout dimensions. Do not use spinners for page content.

## Elevation scale

- Level 0: page background, a Warm elevated gradient from `--bg` to `--surface-elevated`.
- Level 1: normal cards, `--surface` with a subtle border and soft shadow.
- Level 2: active voice / review cards, slightly stronger shadow and a glass-like `--surface` overlay.
- Level 3: modal/admin critical surfaces, stronger contrast and clearer border.

## Voice interaction area

The session screen must reserve a large Voice interaction area above the transcript. It changes copy and visual emphasis for idle, recording, transcribing, thinking, speaking, and error. Recording is warm and active; transcribing/thinking are calm and in-progress; errors stay visible with a retry path.

## Admin separation

Admin pages use a more technical console treatment, darker/elevated headers, and explicit "Admin console" labeling. Provider model, voice, voice-gender, and key controls never appear in learner navigation.

## Loading / empty / error states

Every list page must have concrete loading, empty, and error states. Loading uses skeletons, empty states offer the next best action, and errors are visible cards with human-readable recovery copy.

## UI Acceptance Criteria

- No overlapping elements at `320`, `375`, `768`, `1024`, and `1440` px.
- All spacing values come from the scale.
- Buttons in a group share size and baseline alignment.
- No horizontal scroll on mobile.
- Admin forms are card-grouped with section headers.
- Every interactive element has a visible focus state and at least a `44px` touch target.
- Every list has explicit empty, loading, and error states.
