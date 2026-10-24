# Style guide: easy for older adults

Universal AC Remote is built for people who may have weaker eyesight, less steady hands, and
little patience for apps. Think of a grandparent who wants to make the bedroom cooler and put the phone down.
Every screen follows the rules below. The tokens live in
[`src/constants/theme.ts`](../src/constants/theme.ts), and the building blocks live in
[`src/components/ui/`](../src/components/ui/).

## 1. Principles

1. **Big and obvious beats clever.** If something can be bigger, make it bigger.
2. **One job per screen.** Each screen has one main action, drawn as the large primary `Button`.
3. **Say it in words.** Every button has a text label. An icon only supports the words and never
   replaces them.
4. **Never rely on color alone.** States such as selected, on/off and errors also use a check mark,
   a thick outline, or a sentence.
5. **No surprises.** No gestures (swipe, long-press, pinch) are required. A visible tap target does
   everything. Nothing moves or disappears without a tap.
6. **Forgiving.** Targets are spaced apart. Disabled buttons explain why. Errors say what happened
   and what to do in plain words.

## 2. Typography

Nothing in the app is smaller than **17pt**. Text follows the phone's text-size setting up to
`Layout.maxFontScale` (1.6×). The temperature digits are the only exception, because they are
already 88pt.

| Variant   | Size / line height | Weight | Use for                                   |
| --------- | ------------------ | ------ | ----------------------------------------- |
| `display` | 88 / 96            | 500    | The temperature on the dial               |
| `title`   | 32 / 40            | 700    | Screen titles, the power state            |
| `heading` | 24 / 32            | 700    | Section titles, card titles               |
| `body`    | 20 / 28            | 400    | Sentences and explanations                |
| `label`   | 20 / 26            | 600    | Button and option labels                  |
| `caption` | 17 / 24            | 500    | Secondary details only (the minimum size) |

Rules:

- Use sentence case. Don't use ALL CAPS, small caps or letter-spacing tricks.
- Don't use thin or light weights (200/300). Medium (500) is the lightest weight allowed.
- Keep each line short. Write one idea per sentence, and no paragraph longer than two lines.

## 3. Color and contrast

- Body and label text meet **WCAG AAA (7:1)** against their background. `textSecondary` and
  `textMuted` are also 7:1 or better. They are only "quieter", never faint.
- Outlines (`border`) are at least 3:1 against the surface. Thin, light-gray lines are not allowed.
- **Light mode** uses deep accent colors (for example `#0A5FA8`) with white text on top.
  **Dark mode** uses bright accent colors with near-black text on top. In both modes, text drawn on
  an accent fill uses `onAccent` or `onPrimary`.
- Users can pick the theme in Settings: "Light (white background)", "Dark (black background)", or
  "Same as my phone".

## 4. Touch targets and spacing

| Token                        | Value | Meaning                                       |
| ---------------------------- | ----- | --------------------------------------------- |
| `Layout.minTouchTarget`      | 64    | Minimum height and width of anything tappable |
| `Layout.primaryButtonHeight` | 72    | The main action on a screen                   |
| `Layout.touchGap`            | 12    | Minimum space between two tappable things     |
| `Borders.regular`            | 2     | Default outline                               |
| `Borders.selected`           | 4     | Selected or focused outline                   |

- Buttons stretch to full width, or share a row with at most one other button.
- Option grids have at most **two columns**.
- Screens use `Spacing.xl` (24) between blocks, so groups are easy to tell apart.

## 5. Components

| Component      | When to use                                                                   |
| -------------- | ----------------------------------------------------------------------------- |
| `Button`       | Any action. `primary` once per screen, `secondary` for the rest, `danger` for destructive actions. Pass `large` for the main action. |
| `OptionButton` | Picking one choice from a list (room, model, theme). Shows a check mark, a thick outline and a tint when selected. |
| `ListCard`     | A row that opens another screen (a saved remote, a brand). Always ends with a chevron. |
| `TextField`    | Text input. The label stays above the field and is never only a placeholder. Supports a `hint`. |
| `Section`      | A titled group of controls, with an optional one-sentence description.        |
| `AppText`      | All text. Never use a raw `<Text>`.                                           |
| `BrandMark`    | The brand initial. It is decorative, so the brand name is always written next to it. |

## 6. Writing (microcopy)

- Use everyday words: **Colder / Warmer**, not "−/+". Write **"AC is off. Tap here to turn on"**, not
  "Standby".
- Phrase steps as questions: "1. Which room is it in?", "2. What should we call it?"
- Offer a safe default for uncertain choices: **"I don't know"** for the model.
- Error messages say what happened, then the details: "The air conditioner did not get the signal."
- Write **"Back"** on back buttons, not only a chevron. This is set once in the root stack.
- Leave decorative titles off screens whose content already says what they are. The Remotes list
  is the home screen and its tab is already named, so it starts straight with the remotes.

## 7. Removing things and other destructive actions

- Never remove anything on a single tap. The first tap ("Remove this remote") asks in place, on the same screen. A
  pop-up is easy to dismiss by accident and doesn't work on web.
- The question names the item and says what happens: "Remove “Bedroom LG”? It will disappear from your list.
  Your air conditioner is not affected."
- The two answers are full sentences, stacked: **"Yes, remove it"** (`danger`) and **"No, keep it"** (`secondary`).
- Destructive buttons sit at the bottom of the screen, away from everyday controls.

## 8. Motion and feedback

- Press feedback is a subtle scale (`Motion.pressScale = 0.97`) plus an optional light vibration.
  Users can turn the vibration off in Settings.
- Status changes, such as Sending… or Sent, are announced to screen readers through
  `accessibilityLiveRegion`.
- No auto-advancing screens, timers, or carousels.

## 9. Accessibility checklist for every new screen

- [ ] No text smaller than `caption`. No raw `fontSize` in screens.
- [ ] Every tappable element is at least 64pt, with at least 12pt between neighbors.
- [ ] Every button has a text label and an `accessibilityLabel`.
- [ ] Selected and on/off states are visible without color.
- [ ] Section titles use `accessibilityRole="header"`.
- [ ] Destructive actions use the two-step in-place confirmation.
- [ ] The screen works with the phone's text size at its largest, and in both light and dark mode.
