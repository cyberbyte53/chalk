# @chalk/prop-number-line

A number line you can magnify, mark and cut into equal parts, with a draggable marker. It knows numbers on a line, nothing about any lesson (no squares, no roots, no fractions as such).

## Contract: `numberLine`

**Stored state**

| Field | What |
|---|---|
| `from`, `to` | the window: the stretch of the line on screen, inside −10 to 10, at least 10⁻⁸ and at most 20 wide |
| `marker`, `showMarker` | the learner's draggable marker and whether it is drawn |
| `marks` | labelled points `{ at, label }` (up to 16); the label is maths only ("1/2", "√2", "π"). Points at the same place stack their labels |
| `split` | a stretch cut into equal parts `{ from, to, parts }`, or null |
| `lens` | a tenth of the window picked out as the next one to magnify, or null |
| `isZoomable` | input: the learner has zoom buttons |
| `isSplittable` | input: the learner has a − / + stepper for the split's parts |

**Derived state**: `between` (the tenths the marker sits between, "1.4 and 1.5"), `level` (decimal places of the ticks at this zoom), `splitParts`, `splitPointsBetween` (cut points strictly between the split's ends: parts − 1).

**Actions**

| Action | Changes | Keeps fixed | Timed | Learner |
|---|---|---|---|---|
| `moveMarker { to }` | the marker | the window | | yes |
| `showMarker { isShown }` | whether the marker shows | | | |
| `zoomTo { from, to, over }` | the window | marks, split | glide | |
| `showLens { value }` / `hideLens` | the tenth that holds `value` is picked out | the window | | |
| `magnify { value }` | zooms ten times into the tenth that holds `value` (successive magnification: one more decimal place of `value` decided) | marks, split | glide 1.2 s | |
| `zoomIn` / `zoomOut` | ten times in (around the marker, or the middle) / out | marks, split | glide | yes |
| `placeMark { at, label }`, `removeMark { label }`, `clearMarks` | marks (same label moves, never doubles) | | | |
| `splitInto { from, to, parts }`, `clearSplit` | the split | | | |
| `changeParts { by: ±1 }` | the split's parts | its ends | | yes |

A glide scales evenly in log (each tenth of the time narrows by the same factor) about the one point both windows put at the same place on screen, so what is being zoomed into stays still under the eye. It stops if anything else moves the window. No action reveals an answer.

**Signals** (none is a commit): `markerReleased`, `zoomed { from, to, level }` (a glide finished), `split { parts, between }`.

**Parts** (all with `locate`): `axis`, `marker`, `mark:<label>`, `tick:<value>`, `split`, `splitPoint:<i>`, `lens`; `zoomIn`, `zoomOut`, `splitStepper` (buttons, `data-part`).

**The view.** Arrows at both ends (the line goes on). Tick labels in full while they fit; once they crowd, the ends keep theirs and the ticks between show only the digit this zoom decides, like the book's magnified pictures (Fig 1.12–1.14). Marks are saffron dots with labels above, stacked so they never overlap. The split is a saffron band with its cut points as rings. The lens is a saffron box round the tenth about to be magnified.

## Files

- `src/model.ts`: the definition and the glide.
- `src/scale.ts`: value ↔ x, tick steps (exactly tenths for a power-of-ten window), `magnifyTarget`, `zoomFrame`.
- `src/view.tsx`: draws it in SVG; every drag and button is an action.
- `src/model.test.ts`: 2.665 and 5.373737… by successive magnification, the zoom keeping its point still, glides through the one door and stopping when interrupted, stacking marks, Example 2's split, refusals, parts.

May import: `@chalk/prop`, `@chalk/player` (types), `preact`, `zod`. Exports: `numberLineProp` (the module), `numberLineDef`, `NumberLineState`, `NumberLinePart`, `NumberLineSignal`.
