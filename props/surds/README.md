# @chalk/prop-surds

The product of two factors drawn as an area. Each factor is a sum of one or two terms, each term a whole-number coefficient times the square root of a positive whole number (radicand 1 is a rational term). One factor runs down the side, the other along the top, and the rectangle splits into one tile per pair of terms: every term of the expansion is one tile. Tiles with the same surd are like terms and add; equal and opposite tiles cancel. All arithmetic is exact (integers; √(k²·s) = k√s by trial division). It knows multiplying surds, nothing about any lesson.

## Contract: `surdTiles`

A term is `{ coefficient, radicand }`, meaning coefficient × √radicand: `{ 3, 2 }` is 3√2, `{ -1, 5 }` is −√5, `{ 7, 1 }` is 7.

**Stored state**

| Field | What |
|---|---|
| `left` | the factor down the side: 1 or 2 terms. Coefficient a whole number −20 to 20, not 0; radicand a whole number 1 to 200. A radicand need not be simplified (√8 stays √8 on the factor). |
| `right` | the factor along the top, the same kind |
| `combine` | 0 to 1: how far the tiles have merged into the simplified sum (0 the bare tiles, 1 the result shown). Moves only while `combine` / `separate` run. |
| `canChangeRight` | whether the learner may change the top factor (flip a sign, pick an offered factor). An input. |

**Derived state**

| Field | What |
|---|---|
| `tiles` | one per (row, column), row-major: `{ row, col, coefficient, radicand, text, isCancelled }`, the product of that row's and column's terms, simplified (√2·√8 → 4, 3√2·√6 → 6√3, √6·√10 → 2√15). `isCancelled`: its like terms add up to 0. |
| `terms` | the simplified sum `[{ coefficient, radicand }]`: like terms (same radicand) added, zeros dropped, the rational term first, then by radicand |
| `resultText` | `terms` as text: `"6 + 3√2 + 2√3 + √6"`, `"7 + 2√10"`, `"3"`, `"0"` |
| `expandedText` | every tile in order, before adding like terms: `"5 − √15 + √15 − 3"` |
| `leftText`, `rightText` | the factors as text: `"(√5 + √3)"`, `"(3 − √3)"`; a single term bare: `"√7"`, `"(−√7)"` |
| `isRational` | the result has no surd term. Not on screen until combined. |
| `cancelledTiles` | the tiles whose like terms add up to 0, as `"row-col"` (`["0-1", "1-0"]` for (√5 + √3)(√5 − √3)) |
| `hasCombined` | `combine` is 1 |

**Actions**

| Action | Changes | Keeps fixed | Reveals | Finger |
|---|---|---|---|---|
| `setFactors { left, right }` | both factors; `combine` back to 0 | `canChangeRight` | no | |
| `setRight { right }` | the top factor (choosing among offered multipliers); `combine` back to 0. Refused unless `canChangeRight`. | the side factor | no | yes |
| `flipSign { term }` | the sign of one term of the top factor (√5 + √3 → √5 − √3); `combine` back to 0. Refused unless `canChangeRight`. | everything else | no | yes |
| `combine { over? }` | timed (default 1.5 s, `over` 0–10): equal and opposite tiles are outlined and fade, like terms gather, the result appears below; then raises `combined`. Every step passes the one door. Stops if the factors change on the way. | the factors | **yes**: shows the product | yes |
| `separate` | glides `combine` back to 0 (0.5 s) | the factors | no | yes |

**Signals** (none is a commit)

- `combined { isRational }`: the tiles have merged into the result.

**Parts**: `tile:<row>-<col>` (from 0), `leftTerm:<i>`, `rightTerm:<i>`, `result` (the lines under the tiles). All have `locate`.

**With a finger**: tap a top term to flip its sign (when `canChangeRight`); tap `=` under the tiles to combine; tap the result to separate.

## Files

- `src/surd.ts`: exact arithmetic (simplify a root, multiply terms, add like terms, text).
- `src/layout.ts`: where everything is drawn at a width (shared by the view and `locate`).
- `src/model.ts`: the definition.
- `src/view.tsx`: the area model. Side terms label the rows, top terms the columns; tile sizes follow |coefficient|·√radicand with a minimum. Rational tiles on the panel colour, surd tiles tinted by radicand (like terms match), negative tiles hatched. Under the tiles, the expanded sum, then the result. No words.
- Styles live in `src/styles.css`, drawn with the look's tokens.
- `src/surd.test.ts`, `src/model.test.ts`: NCERT Exercise 1.5 Q2 products, conjugates (rationalising), simplification, the value of the result equals the product of the factors' values over many generated factors, every action, refusals, `combine` passing the one door at every step.

May import: `@chalk/prop`, `@chalk/player` (types), `preact`, `zod`. Exports: `surdTilesProp` (the module), `surdTilesDef`, `SurdTilesState`.
