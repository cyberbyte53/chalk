# @chalk/prop-coordinates

The plane, located by two perpendicular lines: one prop, `coordinatePlane`, a host whose layers a board turns on. Built for Class 9 Coordinate Geometry, but it knows only its own world.

**One picture from first to last.** The town a student walks in (a main road, streets counted from 1, houses along them) is the same drawing as the graph paper they plot on later: the core draws only the marks the lesson has defined so far (`marks`: none, counts, numbers; O, the directions and the quadrants each a field), so nothing appears before it is taught.

**One move.** The walker goes along the horizontal line by the first number, then up or down by the second, on the lines only. An address, a point's coordinates, plotting and the dice game are all this walk; swapped numbers visibly end somewhere else.

## Core: the plane (`plane.ts`)

**Stored:** `window`, `axes` (both, or the horizontal line alone), `marks`, `tickEvery`, `hasGrid`, `axisNames` (`{ en, hi }` pair: Street number and House number, x and y, t and d), `showAxisNames`, `showOrigin`, `showDirections`, `quadrantsNamed` (0–4), `showQuadrantSigns`, `scene` (none, paper, town, classroom, fair ground), `apart` (the vertical line's zero from the horizontal's: (0, 0) is the axes), `named` (the part a tap named), `points` (a figure's named points, each shown or not, with or without drop lines).
**Actions:** `namePart { part }` (learner), `numberQuadrants` (learner, timed sweep), `moveApart { x, y }` (learner drag), `bringTogether` (learner, timed), `showPoint { name? }` (learner), `showAllPoints`.
**Signals:** `crossed`, `named { part }`, `quadrantsNumbered`.

## Layers

| Layer | File | Stored | Actions | On when |
|---|---|---|---|---|
| reading | `reading.ts` | `point`, `pointStep`, `reading` (none → perpendiculars → distances → abscissa → pair), `isReadingHidden`, `visited` | `movePoint` (learner), `showReading` (learner, reveals), `askAt` | there is a point |
| places | `places.ts` | `placeKind`, `places`, `target`, `targetName`, `canChooseTarget`, `lit` | `chooseTarget` (learner tap), `lightLine` (learner), `clearLight` (learner) | there are places |
| walker | `walker.ts` | `walkerName`, `walkFrom`, `along`, `up`, `walked`, `isWalking`, `canSetSteps` | `setAlong`, `setUp`, `walk` (timed), `backToStart` (all learner); `walkTo` (reveals) | she has a start |
| clues | `clues.ts` | `hidden` (off screen), `clueChoices`, `given`, `isHiddenShown`, `canHide` | `giveClue`, `clearClues`, `hideAt`, `showHidden` (reveals) (all learner) | there are clues |
| plotting | `plotting.ts` | `toPlot`, `plotted`, `showSwaps`, `showTable`, `scaleChoices` | `plotAt`, `setScale`, `clearPlotted` (learner); `plotNext` (reveals) | there are pairs |
| dice | `dice.ts` | `counters`, `playerNames`, `turn`, `lastThrow`, `seed` (off screen), `throwsMade`, `goal`, `winner` | `throwDice` (learner, timed), `startAgain` (learner) | there are counters |

Chance is seeded: the same seed gives the same throws. No `Math.random`.

May import: `@chalk/content`, `@chalk/prop`, `zod` (and, with the view, `@chalk/draw`, `@chalk/player`, `preact`).
