# @chalk/prop-coordinates

The plane, located by two perpendicular lines: one prop, `coordinatePlane`, holding parts a board turns on by what it gives them. Built for Class 9 Coordinate Geometry, but it knows only its own world.

**One picture from first to last.** The town a student walks in (a main road, streets counted from 1, houses along them) is the same drawing as the graph paper they plot on later: the core draws only the marks the lesson has defined so far (`marks`: none, counts, numbers; O, the directions and the quadrants each a field), so nothing appears before it is taught.

**One move.** The walker goes along the horizontal line by the first number, then up or down by the second, on the lines only. An address, a point's coordinates, plotting and the dice game are all this walk; swapped numbers visibly end somewhere else.

## The coordinate plane (`coordinate-plane.ts`)

It holds the parts and joins them: its facts are the plane's window, lines and marks, where Riya is headed (the places' target), whether the plane is alone, and each part needs those by name. It hears `places.targetChosen` (another house is a new walk: Riya goes back to the corner). A part is on when a board gives it something to show (places, a start, clues, pairs, counters).

## Its parts

Each part is one file: its logic and its definition. `(screen)` marks what the student does.

| Part | Variables | Needs | Actions | Signals |
|---|---|---|---|---|
| plane (`plane.ts`) | `window`, `axes`, `marks`, `tickEvery`, `hasGrid`, `axisNames`, `showAxisNames`, `showOrigin`, `showDirections`, `quadrantsNamed`, `showQuadrantSigns`, `scene`, `apart`, `upLines`, `numbered`, `rising`, `named`, `points`, `canShowPoints`; fact `isCrossed` | `isAlone`, `canTapNumbers`, `lit` | `namePart`, `numberQuadrants`, `moveApart`, `bringTogether`, `showPoint`, `tapNumber` (screen); `raiseUpLine`, `raiseAllUpLines`, `raiseNext`, `numberLine`, `setScale`, `showAllPoints` | `risen`, `crossed`, `named`, `quadrantsNumbered`, `numberTapped` |
| reading (`reading.ts`) | `point`, `pointStep`, `reading`, `isReadingHidden`, `visited`, `unit`; facts `abscissa`, `ordinate`, `place` | `window` | `movePoint`, `showReading` (screen); `askAt` | `moved`, `enteredQuadrant`, `readingShown` |
| places (`places.ts`) | `placeKind`, `places`, `target`, `targetName`, `choosing` (never, always, once open), `lit`, `isLitByTap`, `showAddress`; facts `litCount`, `canChoose` | `window`, `axisNames`, `rising`, `upLines`, `isOpen` | `chooseTarget`, `clearLight` (screen); `markTarget`, `lightLine` | `targetChosen`, `lineLit` |
| walker (`walker.ts`) | `walkerName`, `walkerKind`, `showWhere`, `walkFrom`, `at`, `roads`, `trail`, `isWalking`, `canStep` | `window`, `upLines`, `axes`, `marks`, `axisNames`, `scene`, `target`, `targetName`, `canChooseTarget` | `step`, `backToStart` (screen); `walkTo` | `stepped`, `arrived`, `blocked` |
| clues (`clues.ts`) | `hidden` (off screen), `clueChoices`, `given`, `isHiddenShown`, `canHide`, `canGiveClues`; fact `still` (anywhere, a region, a line, one point) | `window`, `unit`, `isPlaneFree` | `giveClue`, `hideAt`, `showHidden` (screen); `putAway` | `clueGiven`, `pinned` |
| plotting (`plotting.ts`) | `toPlot`, `plotted`, `showSwaps`, `showTable`, `scaleChoices`; facts `offPlane`, `next` | `window`, `tickEvery` | `plotAt`, `chooseScale`, `clearPlotted` (screen); `plotNext` | `plotted`, `scaleChosen`, `allPlotted` |
| dice (`dice.ts`) | `counters`, `playerNames`, `turn`, `lastThrow`, `seed` (off screen), `throwsMade`, `goal`, `winner` | none | `throwDice`, `startAgain` (screen) | `thrown`, `counterMoved`, `missed`, `sentHome`, `won` |
| parabola (`parabola.ts`) | `zeroes` (α, β), `a`, `lift`, `traced`, `step`, `canDrag`, `canFlip`, `showsValues`, `showsSymmetry`, `showsExpression`; facts `coefficients`, `realZeroes`, `zeroCount`, `vertex`, `isTouching`, `expanded`, `factored` | `window` | `moveAlpha`, `moveBeta`, `flip` (screen); `trace`, `moveZeroes`, `lift` | `zeroMoved`, `flipped`, `traced`, `zeroesMoved`, `lifted` |

**The parabola** is the graph of y = a(x − α)(x − β) + k, held by its zeroes α and β (k is `lift`, 0 unless a board lifts it). Its laws: it meets the x-axis where y = 0, so at α and β when k = 0; its vertex is midway, at x = (α + β)/2; a > 0 opens up, a < 0 down; when α = β it touches the axis at one point (one zero); lifted clear of the axis (b² − 4ac < 0) it has no real zeroes. The student drags either zero along the x-axis (to the `step`, only while k = 0) and the whole curve and its expression follow; `flip` turns it over (every coefficient's sign, so the zeroes stay). A board plays it with planned moves, each telling a signal at its end: `trace` draws it from left to right, a point leaving the curve behind it and a dot at each whole number x (`traced`); `moveZeroes` slides α and β to new places (`zeroesMoved`); `lift` raises or lowers it to k (`lifted`, with how many zeroes it has then). Under the plane: y = x² − 2x − 3 = (x + 1)(x − 3), and its zeroes.

Riya glides one block per step (a planned move, `SECONDS_PER_BLOCK`), on roads only: in the town, along the main road and up or down a street that has risen; on a grid, anywhere. Streets rise one after another (`raiseNext`), each a planned move. Chance is seeded: the same seed gives the same throws, no `Math.random`; `throwsMade` counts every throw across games, so a new game goes on along the seed's throws.

## The view

`view.tsx` draws the coordinate plane with `groupView`: the plane provides the frame, and each part draws into it from its own `<part>-view.tsx`, in its places (behind, on the lines, in front, below, its controls), so drags and taps are in the plane's units: the point to read and the vertical line's zero are drags (`useDrags`); a tap on the plane plots the next pair (to the nearest quarter) or hides the student's point. `plane-view.tsx` draws the plane (scene, grid, lines and only the marks defined so far, O, X/X′/Y/Y′, the quadrants and their signs, a figure's points); `pictures.tsx` the houses, desks, crossings, stalls, Riya and the counters. In the town, every street and house number is a button that lights the places with it. Riya walks with the arrows, a block a tap. Words on the prop's own buttons are in `words.ts`, in English and Hindi. Its sound (a step, a street rising) is `sound.ts`.

Tests: `town.test.ts` (the town as a board plays it: walking, streets rising, a new house), `parts.test.ts` (each part's laws, against the book's figures and answers), `seen.test.ts` (`checkProp` from each kind of board, and what the student sees).

May import: `@chalk/content`, `@chalk/prop`, `zod` (and, with the view, `@chalk/draw`, `@chalk/player`, `preact`).
