# Birdie 🎂

A playful local-first birthday tracker for family and friends — especially the kids' friends. Built with Expo + React Native.

Add your family, link their friends, and Birdie pings you every full hour from 08:00 to 21:00 on each birthday until you tap **"I sent a message!"**.

<p align="center">
  <em>Chubby yellow bird · pink party hat · confetti · zero forgotten birthdays.</em>
</p>

## Features

- **Upcoming list** grouped by Today / This week / This month / Later
- **Family + friends** with one-to-many friend → family-member assignments
- **Hourly birthday-day reminders** (local notifications, 08:00–21:00) that auto-cancel when you mark the message as sent
- **Inline SVG mascot** — no PNG/asset pipeline needed
- **Light + dark mode**
- **CSV / JSON export** of all birthdays via the OS share sheet
- **Localized**: English, German, Spanish (Spain), French, Italian — auto-detected from device locale, falls back to English
- **Offline-first**: SQLite on device, no account, no backend

## Tech stack

- [Expo SDK 54](https://docs.expo.dev) / React Native 0.81 / React 19
- [`expo-router`](https://docs.expo.dev/router/introduction/) (file-based routing, tabs + modal stack)
- [`expo-sqlite`](https://docs.expo.dev/versions/latest/sdk/sqlite/) for persistence
- [`expo-notifications`](https://docs.expo.dev/versions/latest/sdk/notifications/) for local reminders
- [`expo-localization`](https://docs.expo.dev/versions/latest/sdk/localization/) + [`i18n-js`](https://github.com/fnando/i18n)
- [`react-native-svg`](https://github.com/software-mansion/react-native-svg) for the Birdie mascot
- [`expo-file-system`](https://docs.expo.dev/versions/latest/sdk/filesystem/) + [`expo-sharing`](https://docs.expo.dev/versions/latest/sdk/sharing/) for export
- [Jest](https://jestjs.io) with `jest-expo` preset for unit tests

## Getting started

```bash
npm install
npm start          # opens the Expo dev server
npm run ios        # iOS simulator
npm run android    # Android emulator
```

Run the test suite or watch mode:

```bash
npm test
npm run test:watch
```

Lint and type-check:

```bash
npm run lint
npx tsc --noEmit
```

## Project layout

```
app/                          file-based routes
  (tabs)/                       Upcoming / Family / Friends / Settings
  family/{new,[id]}             modal — add / edit family member
  friends/{new,[id]}            modal — add / edit friend
  birthday/[type]/[id]          modal — birthday detail + "I sent a message!"
components/
  birthday/                   BirthdayCard, PersonForm, AssigneePicker
  mascot/                     Birdie + BirdieHead (inline SVG)
  ui/                         PrimaryButton, EmptyState, ModalScreen, IconSymbol
db/                           SQLite open + repositories (family, friends, acks)
hooks/use-birdie-data.tsx     Context for reads/writes; auto-syncs notifications
lib/
  dates.ts                    pure date math (incl. Feb-29 → Mar-1 fallback)
  scheduler.ts                pure hourly-trigger builder + stable IDs
  notifications.ts            expo-notifications wrapper
  upcoming.ts                 merge family + friends + acks → sorted list
  export.ts                   pure JSON / CSV builders
  i18n.ts                     i18n init + t() helper
locales/                      en, de, es, fr, it
__tests__/                    58 unit tests
```

## Localization

The active locale is auto-detected at app launch via `expo-localization` and limited to `en | de | es | fr | it`. Anything else (or unset) falls back to English.

To add a string:

1. Add the key to `locales/en.json` (source of truth) and to every other locale.
2. Use it via `t('your.key')` or `t('your.key', { name })` for interpolation.
3. Run `npm test` — `__tests__/i18n.test.ts` will fail if any locale is missing the key.

To add a new language:

1. Drop a `locales/<code>.json` file with the same shape as `en.json`.
2. Add the code to `SUPPORTED_LOCALES` in `lib/i18n.ts`.
3. Add it to the `it.each(...)` blocks in `__tests__/i18n.test.ts`.

Changing the OS language requires an app restart — i18n-js reads the locale once at module load.

## Notifications

The scheduler in `lib/notifications.ts` runs on app launch and on every foreground transition. For each upcoming birthday in the next 14 days that isn't already acknowledged for the current year, it schedules one notification per hour from 08:00 to 21:00 with a stable identifier (`birthday-{type}-{id}-{yyyymmdd}-{hh}`). Re-syncs are idempotent — already-scheduled IDs are kept, planned-but-missing IDs are added, orphans are cancelled.

Tapping a notification opens the birthday detail modal *and* switches the underlying tab to **Upcoming**, so dismissing the modal lands you on the natural follow-up screen. Tap the "I sent a message!" CTA to record an acknowledgment for that person + year and cancel every remaining ping.

## Building / shipping

This repo uses EAS for native builds. The `npm run build` script wraps `eas build --platform ios`. See `eas.json` for build profiles (development / preview / production).

CI on `main` (and on every PR against `main`) runs lint, typecheck, jest, and an iOS bundle export. On push-to-main, an EAS production iOS build also kicks off — this requires an `EXPO_TOKEN` repo secret. See `.github/workflows/ci.yml`.

## Reset

The original Expo scaffold ships a `npm run reset-project` script that wipes the app/ directory. Don't run it — the Birdie codebase is what you want.
