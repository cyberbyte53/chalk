# @chalk/prop-roots

Square roots as lengths you can construct with a ruler and compass (NCERT Class 9, Ch 1, §1.2 and §1.5). Three props, each a textbook figure brought to life. They know right triangles, circles and lengths on a line, nothing about any lesson. The shared maths (√ text, perfect squares, the figures' coordinates and pixel layouts) lives in `src/surd.ts` and `src/geometry.ts`.

The laws they share: legs `a` and `b` give a hypotenuse `√(a² + b²)`; a compass carries a length onto the line exactly, so √n has an exact point even though its decimal never ends; when n is a perfect square the length lands on a whole number (√4 = 2).

## Contract: `rootBuilder` (Fig 1.6–1.8, "place √5")

A number line with a faint unit grid and a right triangle standing on it: the base lies along the line from 0 to a point already on the line (a whole number, or a √n already landed), a perpendicular of whole-number height stands at the base's end, and the hypotenuse goes from 0 to its top. A compass centred at 0 swings the hypotenuse down onto the line.

**Stored state**

| Field | What |
|---|---|
| `base` | n, where the base is √n long (a whole number 1 to 64: n = 4 is a base of 2). It must be a point on the line: a perfect square, or one of `landed`. |
| `height` | the perpendicular's height, a whole number 0 to 5 (0: no perpendicular yet) |
| `swing` | how far the compass has swung, 0 to 1 (1: the hypotenuse lies on the line) |
| `landed` | the n of every √n placed on the line so far, oldest first (at most 10, each 2 to 64, no repeats) |
| `maxValue` | how far the line goes, a whole number 2 to 8 |

Rules across fields: √`base` and the hypotenuse must fit on the line (`base + height² ≤ maxValue²`); every landed √n fits too; a swing needs a perpendicular; a finished swing (1) has its √n in `landed`.

**Derived state**

| Field | What |
|---|---|
| `hypotenuseSquared` | `base + height²` (exact, a whole number) |
| `hypotenuseText` | the hypotenuse as maths: `"√5"`, `"2"` for 4, `"√8"` |
| `baseText` | the base as maths: `"1"`, `"√2"` |
| `landsAt` | where the hypotenuse lands, √(`hypotenuseSquared`), as a decimal. Not on screen. |
| `isWhole` | `hypotenuseSquared` is a perfect square (it lands on a whole number) |
| `hasLanded` | the swing is finished |
| `canSwing` | there is a perpendicular and it hasn't swung yet |
| `maxHeight` | the tallest perpendicular that still fits on the line at this base. Not on screen. |

**Actions**

| Action | Changes | Keeps fixed | Reveals | Timed |
|---|---|---|---|---|
| `setBase { n }` (finger: drag the base's end; it snaps to whole numbers and landed points) | `base`; `swing` back to 0; `height` lowered if the triangle would no longer fit. Refused if √n is not on the line. | `landed`, `maxValue` | no | no |
| `setHeight { h }` (finger: drag the top of the perpendicular; snaps to whole units) | `height`; `swing` back to 0. Refused if it wouldn't fit. | `base`, `landed` | no | no |
| `swing { over? }` (finger: tap the compass) | rotates the hypotenuse about 0 down onto the line over `over` seconds (1.6 by default), drawing the arc; then adds `hypotenuseSquared` to `landed` and raises `landed`. Refused with no perpendicular; nothing if already swung. | the triangle | no | yes |
| `buildOn` | the last landed point becomes the base, `height` 0, `swing` 0 (the Fig 1.8 step). Refused if nothing has landed. | `landed` | no | no |
| `clearLanded` | `landed` emptied, `swing` 0; a base standing on a landed point moves back to the whole number below it | `height` (unless it no longer fits) | no | no |
| `startAgain` | `base` 1, `height` 0, `swing` 0, `landed` empty | `maxValue` | no | no |

**Signals** (none is a commit): `landed { squared, isWhole }`: the swing finished; √`squared` now has its point on the line.

**Parts** (with `locate`): `zero`, `base`, `perpendicular`, `hypotenuse` (with a perpendicular), `arc` (while swinging or swung), `baseHandle`, `heightHandle`, `landed:<n>`, `tick:<k>` (k = 0 to `maxValue`).

## Contract: `rootSpiral` (Fig 1.9, the square-root spiral)

Start with OP1 = 1. At P1 raise a unit perpendicular to OP1, ending at P2: OP2 = √2. At P2 a unit perpendicular to OP2 gives P3 with OP3 = √3, and so on: OP(k+1)² = OPk² + 1.

**Stored state**

| Field | What |
|---|---|
| `steps` | how many triangles, 1 to 16 (1: OP1 = 1 and OP2 = √2) |
| `grow` | how far the newest triangle is drawn, 0 to 1 (first its unit leg, then its hypotenuse) |

**Derived state**: `lastSquared` (OP(steps+1)² = `steps + 1`), `lastText` (`"√(steps+1)"`, or `"2"`, `"3"`, `"4"` for perfect squares).

**Actions**

| Action | Changes | Keeps fixed | Reveals | Timed |
|---|---|---|---|---|
| `addStep` (finger: tap the spiral) | one more triangle, drawn over 1.2 s: the unit perpendicular, then the new hypotenuse; raises `grown`. Refused at 16. | the triangles already there | no | yes |
| `removeStep` | one triangle fewer (not below 1) | the rest | no | no |
| `showSteps { steps }` | that many triangles, drawn at once | | no | no |
| `startAgain` | back to 1 triangle | | no | no |

**Signals** (not commits): `grown { squared }`: the newest hypotenuse, √`squared`, is drawn.

**Parts** (with `locate`): `centre` (O), `hypotenuse:<k>` (OPk, k = 1 to `steps + 1`), `leg:<k>` (the unit leg at Pk, k = 1 to `steps`).

## Contract: `rootSemicircle` (Fig 1.15–1.17, √x for any x > 0)

On a line, AB = x and BC = 1. O is the midpoint of AC; the semicircle with centre O and radius OC = (x + 1)/2 meets the perpendicular at B in D. Then BD = √x, because OB = (x − 1)/2 and BD² = OD² − OB² = x. With B as 0, a compass centred at B swings BD down onto the line, landing at E = √x.

**Stored state**

| Field | What |
|---|---|
| `x` | the length AB, 0.5 to 12 in steps of 0.1 |
| `isProofShown` | whether O, OD and OB are drawn with their lengths and the line `BD² = OD² − OB² = x` |
| `swing` | how far BD has swung down onto the line about B, 0 to 1 (1: it lies on the line, ending at E) |

**Derived state**

| Field | What |
|---|---|
| `bd` | the length BD, √x, as a decimal. Not on screen. |
| `bdSquared` | BD², which is exactly x |
| `isWhole` | x is a perfect square (only whole numbers can be, in tenths) |
| `xText` | x as text: `"3.5"`, `"9"` |
| `bdText` | BD as maths: `"√3.5"`, `"3"` for x = 9 |
| `od`, `ob` | OD = (x + 1)/2 and OB = (x − 1)/2 (negative when B is left of O). On screen only with the proof. |
| `hasLanded` | the swing is finished |

**Actions**

| Action | Changes | Keeps fixed | Reveals | Timed |
|---|---|---|---|---|
| `setX { x }` (finger: drag A along the line; snaps to 0.1) | `x`; `swing` back to 0 | `isProofShown` | no | no |
| `showProof { isShown }` | `isProofShown` | `x`, `swing` | no | no |
| `swing { over? }` (finger: tap the compass) | swings BD onto the line about B over `over` seconds (1.6 by default); raises `landed`. Nothing if already swung. | `x` | no | yes |
| `startAgain` | `swing` 0, proof hidden | `x` | no | no |

**Signals** (not commits): `landed { x }`: E is placed at √x.

**Parts** (with `locate`): `a`, `b`, `c`, `d`, `o` (with the proof), `e` (once swung), `bd`, `semicircle`, `xSegment` (AB), `unitSegment` (BC).

## Files

- `src/surd.ts`: perfect squares and √ text, with exact integer arithmetic (tenths for x).
- `src/geometry.ts`: the figures' coordinates in units (the swinging tip, the spiral's points, the semicircle's points) and each view's pixel layout (shared by the views and `locate`).
- `src/glide.ts`: eases a 0–1 field frame by frame inside a task, stopping if the learner changes the prop.
- `src/builder.ts`, `src/spiral.ts`, `src/semicircle.ts`: the definitions; `*-view.tsx`: the SVG figures. No words: only numbers, √ and point letters.
- Styles in the player's `styles.css`, sections "roots: rootBuilder", "roots: rootSemicircle", "roots: rootSpiral".
- Tests next to each: hypotenuses known by hand (√2, √3, √5 two ways, 2 from √4), perfect squares land on whole numbers, the spiral's lengths and right angles, BD² = x from the drawn circle for every x, every action, snapping, refusals, timed actions passing the one door at every frame.

May import: `@chalk/prop`, `@chalk/player` (types), `preact`, `zod`. Exports: `rootBuilderProp`, `rootSemicircleProp`, `rootSpiralProp` (the modules), `rootBuilderDef`, `rootSemicircleDef`, `rootSpiralDef`, and their `…State` types.
