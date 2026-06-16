# CLAUDE.md — Birdie

Notes for AI assistants working in this repo. Read this first.

## What this app is

Birdie is a local-first birthday tracker built with **Expo SDK 56 / React Native 0.85 / React 19**. It tracks family members and friends, links friends to one or more family members, and fires hourly local notifications (08:00–21:00) on each birthday until the user marks the message as sent.

Everything is on-device — SQLite for persistence, `expo-notifications` for local reminders. No backend.

## Workflow conventions

- **Always rebase changes on `origin/main`** before pushing.
- **Always open a new PR against `main`** — never commit directly. Branches use the `claude/birdie-<topic>` naming convention.
- **One logical change per PR** — keep diffs reviewable. The `claude/birdie-i18n` PR is the largest historical exception (broad string replacement).
- **Don't push to `main`.** Don't force-push. Don't skip hooks.
- The user controls when PRs merge.

## Required local checks before push

```bash
npm run lint
npx tsc --noEmit
npm test
npx expo export --platform ios   # only if you touched bundling-relevant code
```

CI (`.github/workflows/ci.yml`) runs the same four steps on every PR against `main`. Push-to-main additionally triggers an EAS iOS build (needs `EXPO_TOKEN` repo secret).

## Architecture

### Routing
File-based via `expo-router`. The four tabs live in `app/(tabs)/`. Modals are top-level routes with `presentation: 'modal'` declared in `app/_layout.tsx`.

### Data layer
- `db/index.ts` opens the SQLite database lazily and runs migrations from `db/schema.ts`.
- `db/repositories/{family,friends,acknowledgments}.ts` are the only callers that touch SQL. **Never inline SQL in screens.**
- `hooks/use-birdie-data.tsx` is the single Context that owns all reads + writes. Mutations refresh in-memory state and re-sync notifications. Don't add another data-fetching pattern alongside it.

### Notifications
- `lib/notifications.ts` is the only wrapper around `expo-notifications`. Use `syncBirthdayNotifications()` after any data mutation (the Context already does this).
- Notification IDs are deterministic: `birthday-{type}-{id}-{yyyymmdd}-{hh}` (see `lib/scheduler.ts`). Re-running sync is idempotent — keep it that way.
- The notification listener in `app/_layout.tsx` switches to the Upcoming tab *and* pushes the detail modal: `router.navigate('/')` then `router.push(...)`. Don't combine these into a single push.

### Pure libs
`lib/dates.ts`, `lib/scheduler.ts`, `lib/upcoming.ts`, `lib/export.ts` should stay **pure** (no SQLite, no expo-notifications). Tests rely on this. If you need data-layer access, do it in the caller and pass the data in.

### Styling
- `constants/theme.ts` exports `Brand` (raw palette) and `Colors` (light + dark mode). Use `useColorScheme()` + `Colors[scheme]` in components, never raw hex outside `theme.ts`.
- `useThemeColor()` from `hooks/use-theme-color.ts` is available for one-off overrides.

### Mascot
`components/mascot/{Birdie,BirdieHead}.tsx` are inline `react-native-svg`. If you need a new mascot variant, add a new component there. Don't introduce PNG assets unless explicitly asked.

## Localization (this is non-optional)

**Every user-facing string must go through `t()` from `@/lib/i18n`.** Hardcoded English strings in JSX, `Alert.alert`, `accessibilityLabel`, `placeholder`, or `Stack.Screen` titles are bugs.

When adding a string:

1. Pick a key path under the right namespace in `locales/en.json` (e.g. `screen.settings.newCta`, `card.someLabel`). Hierarchy is meaningful — see existing patterns.
2. Add the same key with translated values to `locales/{de,es,fr,it}.json`.
3. Use `t('full.key.path')`, or `t('full.key.path', { name })` for interpolation. Interpolation uses `{{double}}` braces.
4. `__tests__/i18n.test.ts` enforces parity — it will fail if any locale is missing the key.

When the test asserts an English string (e.g. `dates.test.ts` checking `formatRelativeDays`), the test relies on `i18n.locale` being `'en'`. The mock in `jest.setup.ts` returns `{ languageCode: 'en' }`. If you write a test that needs a different locale, set `i18n.locale = '<code>'` in `beforeEach` and reset it.

## Testing

- Tests live in `__tests__/` and use `jest-expo`.
- Pure-function tests are highest leverage: `dates.test.ts`, `scheduler.test.ts`, `upcoming.test.ts`, `export.test.ts`, `i18n.test.ts`.
- One render smoke test for the mascot (`birdie.test.tsx`).
- `jest.setup.ts` mocks `expo-notifications`, `expo-router`, `expo-haptics`, `expo-file-system`, `expo-sharing`, and `expo-localization`. Add a mock there before importing a new Expo module from a tested file.
- Snapshot tests are not currently used. If you reach for one, consider whether a behavioral assertion is more durable.

## Common gotchas

- `expo install` will not work in environments without network access to the React Native Directory. Fall back to `npm install <pkg>@~<version-aligned-with-SDK-54>` and check the SDK version compatibility manually.
- Don't import a translation file as `it` — it shadows Jest's global `it`. Use `itLocale` (see existing pattern in `__tests__/i18n.test.ts`).
- The web bundle (`expo export --platform web`) currently fails because `expo-sqlite` ships a `.wasm` worker and there is no `metro.config.js` adding `wasm` to `assetExts`. Use `--platform ios` for verifying bundles in CI. Adding the metro config to fix web is a known follow-up.
- `app.json` is committed and currently ships `bundleIdentifier`, `package`, EAS `projectId`, and the `owner: buenoapps` field. Don't strip these.
- Don't rename or delete `assets/images/icon.png`, `splash-icon.png`, `favicon.png`, or the Android adaptive icon set — `app.json` references them.

## Things explicitly out of scope unless asked

- In-app language picker (we rely on OS locale).
- Cloud sync, accounts, multi-device.
- Web platform (declared in `app.json` but currently broken — see gotcha above).
- Push notifications via APNs/FCM (we only use local notifications).
- A separate "ownership" relationship beyond the friend ↔ family-member chip picker.
