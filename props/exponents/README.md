# @chalk/prop-exponents

A rational exponent a^(m/n) of a positive whole number, worked out along two routes that meet. Route one takes the nth root first and then the mth power; route two takes the mth power first and then the nth root. Both always arrive at the same number: that is how a^(m/n) is defined, and why the laws of exponents carry over. A negative power adds a last step, 1/x, on both routes (a^(−p) = 1/a^p). It knows exponents and roots, nothing about any lesson.

## Contract: `exponentRoutes`

**Stored state**

| Field | What |
|---|---|
| `base` | a, a whole number, 1 to 1000 |
| `power` | m, a whole number, −6 to 6, never 0 |
| `root` | n, a whole number, 1 to 6. With n = 1 the exponent is just m. |
| `rootFirstStep` | how many steps of the root-first route are shown, 0 to `stepCount` |
| `powerFirstStep` | how many steps of the power-first route are shown, 0 to `stepCount` |
| `canChangeNumbers` | whether the learner's − / + buttons for a, m and n are on. An input (a lesson may own it with an IS). |

The fraction m/n is kept as given, not put in lowest terms: 4^(2/4) shows ∜4 ≈ 1.414 then ² = 2 on one route, and 4² = 16 then ∜16 = 2 on the other.

Refused: any state where a^|m| (the biggest number either route passes through: the first stop of the power-first route) is more than 10¹², because it no longer fits a node on a phone. A root does not rescue it: the power-first route still has to show a^|m| before it takes the root. This allows 1000⁴, 100⁶, 32⁶ and every Exercise 1.6 case, and refuses 1000⁵ or 999⁶.

**Steps.** Each route is a list of the same `stepCount` steps (0 to 3), in its own order:

- root first: ⁿ√ (left out when n = 1), then the power |m| (left out when |m| = 1), then 1/x when m < 0;
- power first: the power |m|, then ⁿ√, then 1/x when m < 0.

A step that would do nothing (¹√, a power of 1) is left out, so 125^(1/3) is one step ∛ on both routes and 2^(−3) is ³ then 1/x on both. The reciprocal is the *last* step rather than the first: the root and power steps then work on whole numbers exactly as they do for a positive power (2 then 8, or 64 then 8), so the negative case reads as the positive case followed by a^(−p) = 1/a^p, the way the textbook defines it; doing 1/x first would fill both routes with fractions.

Every value is worked out exactly: a number on a route is kept as (p/q)^(1/k) with whole numbers p, q (BigInt) and k, and k is lowered whenever p and q are perfect powers (∜4 = √2; (√2)² = 2). A value is exact when k comes down to 1; otherwise it is shown to 4 significant figures after ≈.

**Derived state**

| Field | What |
|---|---|
| `stepCount` | how many steps each route has (0 to 3) |
| `routeRootFirst` | the root-first route: a list of steps `{ kind, operation, value, valueText, isExact, isShown }`. `kind` is `"root"`, `"power"` or `"reciprocal"`; `operation` is the symbol on the arrow (`"∛"`, `"²"`, `"1/x"`); `value` the number reached (a JS number, for rules); `valueText` it as shown (`"3"`, `"1/8"`, `"≈ 1.587"`); `isShown` whether it is on screen yet |
| `routePowerFirst` | the power-first route, the same shape |
| `expressionText` | the expression as text: `"27^(2/3)"`, `"2^(−3)"` (n = 1) |
| `value` | a^(m/n) as a number. Off screen until a route arrives. |
| `valueText` | a^(m/n) as shown: `"9"`, `"1/5"`, `"≈ 1.414"`. Off screen until a route arrives. |
| `isExact` | whether a^(m/n) is a rational number (shown without ≈). Off screen. |
| `hasRootFirstArrived`, `hasPowerFirstArrived` | that route's every step is shown |
| `haveRoutesMet` | both routes are fully shown (true at once when there are no steps: a^(1/1)) |

**Actions** (only `showBoth` is timed)

| Action | Changes | Keeps fixed | Reveals |
|---|---|---|---|
| `stepRootFirst` | shows the next step of the root-first route; does nothing once it has arrived. The learner's tap. | the numbers, the other route | no |
| `stepPowerFirst` | the same for the power-first route. The learner's tap. | the numbers, the other route | no |
| `showBoth` | timed: steps the two routes in turn (root first, then power first, …) with 0.7 s between, until both have arrived; finishes when they meet | the numbers | **yes** |
| `hideSteps` | both routes back to 0 steps | the numbers | no |
| `setNumbers { base, power, root }` | a new a^(m/n), both routes back to 0 | nothing (a new expression) | no |
| `changeBase { by }` | a + by, held to 1–1000; routes back to 0. The learner's − / +. Refused unless `canChangeNumbers`, or if a^\|m\| would pass 10¹². | m, n | no |
| `changePower { by }` | m moves `by` places along −6 … −1, 1 … 6 (it skips 0: −1 then + 1 is 1), held to the ends; routes back to 0. The learner's − / +. Refused as above. | a, n | no |
| `changeRoot { by }` | n + by, held to 1–6; routes back to 0. The learner's − / +. Refused unless `canChangeNumbers`. | a, m | no |

A change held at an end (n = 6, then + 1) does nothing.

**Signals** (none is a commit)

- `stepped { route, step }`: one more step of a route is shown; `route` is `"rootFirst"` or `"powerFirst"`, `step` counts from 1.
- `routesMet { valueText }`: the second route has arrived; both now show the same value.

**Parts**: `start` (the expression), `exponent` (its m/n), `base`, `power`, `root` (the numbers in the expression; `root` only when n > 1), `routeRootFirst:<i>` and `routePowerFirst:<i>` (step i, from 1: the operation on its arrow and the node it leads to; the last step leads to `end`), `end` (the meeting node). All have `locate`, in the prop's pixels at the given width. The − / + buttons are marked `data-part` `baseStepper`, `powerStepper`, `rootStepper`.

**With a finger**: a tap on a route's next node, or on the operation of its next arrow, is `stepRootFirst` / `stepPowerFirst` (a tap on the meeting node steps whichever route is behind, root first on a tie). The blue − / + buttons under the figure, shown when `canChangeNumbers`, are `changeBase`, `changePower`, `changeRoot` with `by` ±1.

## Files

- `src/model.ts`: the definition.
- `src/surd.ts`: the exact arithmetic (BigInt whole-number roots, values (p/q)^(1/k), the two routes, the 10¹² rule, formatting).
- `src/layout.ts`: where everything is drawn at a width (shared by the view and `locate`).
- `src/view.tsx`: a diamond. At the top a^(m/n) in display type with a raised fraction exponent; the root-first route runs down the left and the power-first route down the right, nodes joined by arrows carrying their operation as a pill acting on x (∛x, x², 1/x); both meet in one node at the bottom with the value in saffron-deep. An unshown node is a dashed outline with "?". When both have arrived the meeting node pulses once and the two last arrows turn saffron. Under the figure, when `canChangeNumbers`, blue − / + buttons for a, m and n. No words.
- Styles live in the player's `styles.css`, section "exponents: exponentRoutes".
- `src/surd.test.ts`, `src/model.test.ts`: Exercise 1.6 by hand on both routes; 4^(3/2) and 27^(2/3) with their intermediates; negative powers; √2 inexact on both routes; 4^(2/4) exact at the end of both; whole-number roots against a separate search; many generated (a, m, n) where both routes agree with each other and with Math.pow; every action; step bounds; refusals; `showBoth` through the one door at every step; parts and `locate`.

May import: `@chalk/prop`, `@chalk/player` (types), `preact`, `zod`. Exports: `exponentRoutesProp` (the module), `exponentRoutesDef`, `ExponentRoutesState`, `ExponentRoutesSignal`, `ExponentRoutesPart`, `Route`.
