This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Senior-friendly UI is mandatory

This app is designed for older adults (grandparents) first. Every screen, component, and string must follow [docs/style-guide.md](docs/style-guide.md). Read it before any UI work. These rules are not optional:

- Use the tokens in `src/constants/theme.ts` (`Typography`, `Layout`, `Borders`, `Colors`) and never hard-code `fontSize`, colors, or sizes in screens. If a token is missing, add it there.
- Build UI from `src/components/ui/` (`AppText`, `Button`, `OptionButton`, `ListCard`, `TextField`, `Section`). Never use a raw `<Text>`, `<TextInput>`, or an unstyled `Pressable` button.
- No text smaller than `Typography.caption` (17pt). Every tappable element is at least `Layout.minTouchTarget` (64pt), with `Layout.touchGap` between neighbors.
- Every button has a visible text label. Icons support the words and never replace them. Selected and on/off states must be visible without color (check mark, thick outline, or text).
- Write plain, everyday words. Don't rely on gestures, timers, or pop-up dialogs. Destructive actions use the in-place two-step confirmation (see `RemoveRemote`).
- When a rule changes, update `docs/style-guide.md` and the tokens in the same change.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
