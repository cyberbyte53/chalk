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
| clues | `clues.ts` | `hidden` (off screen), `clueChoices`, `given`, `isHiddenShown`, `canHide` | `giveClue`, `clearClues`, `hideAt`, `showHidden` (reveals) (all learner); derived `still`: anywhere, a region, a line, one point or nowhere | there are clues |
| plotting | `plotting.ts` | `toPlot`, `plotted`, `showSwaps`, `showTable`, `scaleChoices` | `plotAt`, `setScale`, `clearPlotted` (learner); `plotNext` (reveals) | there are pairs |
| dice | `dice.ts` | `counters`, `playerNames`, `turn`, `lastThrow`, `seed` (off screen), `throwsMade`, `goal`, `winner` | `throwDice` (learner, timed), `startAgain` (learner) | there are counters |

Chance is seeded: the same seed gives the same throws. No `Math.random`. `throwsMade` counts every throw across games, so a new game goes on along the seed's throws instead of repeating the last one. A die that would take its coordinate past the goal isn't used and the counter moves by the other alone; only when both would is the turn missed. (The book misses the turn whenever either would, which leaves a counter at 10 on one coordinate stuck for ever; the person chose this instead.)

## The view

`view.tsx` draws everything in the plane's own frame (`FrameStage`, with `planeFrame`), so drags and taps are in the plane's units: the point to read and the vertical line's zero are drags (`useDrags`); a tap on the plane plots the next pair (to the nearest quarter) or hides the learner's point. `plane-view.tsx` draws the core (scene, grid, lines and only the marks defined so far, O, X/X′/Y/Y′, the quadrants and their signs, a figure's points); `pictures.tsx` the houses, desks, crossings, stalls, Riya and the counters. In the town, every street and house number is a button that lights the places with it. Riya's two numbers are steppers, → and ↑; she walks along first, then up. Words on the prop's own buttons are in `words.ts`, in English and Hindi.

Tests: `model.test.ts` (the laws, against the book's figures and answers), `seen.test.ts` (`checkProp` from each kind of board, and what the student sees).

May import: `@chalk/content`, `@chalk/prop`, `zod` (and, with the view, `@chalk/draw`, `@chalk/player`, `preact`).
