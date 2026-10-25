# @chalk/prop-polynomials

Polynomials as a graph on a plane (`zeroPlane`), as a machine that gives values (`valueMachine`), as a box of terms (`polyBox`) and as a long division (`longDivision`). Built for Class 10 Polynomials, used again for quadratic equations; each prop knows only its own world.

Polynomials are coefficient lists, highest power first (`x² − 2x − 3` is `[1, −2, −3]`). `src/poly.ts` holds the shared laws: `valueAt`, `fromZeroes`, `realZeroes` (each real zero with its multiplicity), and writing a polynomial or a number the book's way (`polyTex`, `polyText`, `niceNumber`: `−3/2`, `√3`, `2 + √3`). `src/box-algebra.ts` does the box's arithmetic exactly, with fraction.js.

## `zeroPlane`: the graph of y = p(x)

The plane is drawn by **Mafs** from the prop's state (see the toolkit in `docs/making-a-prop.md`): Mafs holds no state here. Every drag calls an action; the prop snaps and stores the point.

**Stored:**
- `form`: how the graph is held: `zeroes` (y = a(x − z₁)(x − z₂)…), `vertex` (y = a(x − h)² + k) or `coefficients` (fixed);
- `leading` a, `zeroes` (in the order their handles were placed, so a drag keeps hold of the same one), `vertex` [h, k], `fixed` (coefficients form);
- `variable` (x, u, s, t), `snap` (0.5), `window` {xMin, xMax, yMin, yMax};
- `isDraggable`, `canSetLeading`, `isEquationShown`, `isFactoredShown`, `isSymmetryShown` (x = −b/2a), `isInterceptShown` ((0, p(0))), `probe` (x of a point sliding along the curve, or null).

**Derived:** `coefficients`, `degree`, `zeroes` (real, each once, smallest first), `zeroCount` (a touch counts once), `hasTouch`, `sumOfZeroes` (−b/a), `productOfZeroes` (c/a, −d/a), `yIntercept`, `probeValue`, `equation`.

**Actions** (by learner unless noted): `moveZero {index, to}`, `moveVertex {x, y}`, `setLeading {leading}` (k·p(x) keeps the zeroes), `moveProbe {x}`; `setCoefficients {coefficients}` (lessons and Jugnu only). **Signals:** `changed {zeroes, equation}`, `probed {x, value}`.

**Observation:** `curve`, `zero:i` (with "touches" and "draggable"), `vertex`, `symmetry`, `intercept`, `probe`, `equation`, `factored`, `leading`. Points on the plane are found by `locate` (Mafs's points take no `data-part`); the readouts below it are tagged.

## `polyBox`: the box method

**Stored:** `mode` (`multiply` or `divide`), `side` (multiply: the factor down the side; divide: the divisor), `top` (multiply: the other factor), `dividend` (divide), `steps` (cells filled, or quotient terms found), `variable`.

**Derived:** `stepCount`, `isDone`, `result` (multiply), `quotient`, `remainder` (divide).

**Actions:** `next` (by learner: the next cell, or the next quotient term), `all` (reveals), `startAgain` (by learner), `setProblem {mode, side, top, dividend}`. **Signals:** `stepped {step}`, `finished {result}` or `finished {quotient, remainder}`.

**View:** cells of the same power share a colour (category tokens), so like terms can be seen before they're added: for (x − α)(x − β) the two x-cells sit side by side in one colour. Dividing, the quotient grows along the top one column per step; under the box, what's left of the dividend, labelled r once its degree is below the divisor's.

**Observation:** `side:i`, `top:j`, `cell:i:j`, `dividend`, `left`, `result`, `next`, `startAgain`; the product, quotient and remainder sit under `hidden` until they're on screen.

## `valueMachine`: put a number in, get its value

**Stored:** `coefficients`, `name` and `variable` (p, x), `input` (the number in now, or null), `tried` (every number put in, oldest first, at most 60: a dot each), `step` (0.1 by default; the input snaps to it), `min`, `max`, `window`.

**Derived:** `value` (p at the input), `working` (the substitution written out, in LaTeX), `zeroesFound`.

**Actions** (by learner unless noted): `move {x}` (the learner dragging the handle along the x-axis: the working follows, no dot, no signal), `put {x}` (letting go of the handle, or a − / + nudge: leaves a dot), `startAgain`. **Signals:** `put {x, value}`, `foundZero {x}`.

**View:** p(x), then x with − and +, the working, and the grid. x is a handle on the grid's x-axis: drag it, or touch the grid anywhere. While it moves, a dashed line runs from the axis up to (x, p(x)); letting go puts the number in. A cubic's working puts its value on a second line. Numbers are written as the book would: halves and quarters as fractions (½), other decimals as decimals (p(2.3) = −5.61, not 23/10).

**Observation:** `rule`, `input`, `handle`, `working`, `dots`, `startAgain`.

## `longDivision`: long division, set out as in the book

**Stored:** `dividend`, `divisor` (coefficients, highest first), `steps` (moves made), `variable`.

**Derived:** `stepCount` (three moves per quotient term), `isDone`, `quotient`, `remainder`.

**Actions:** `next` (by learner: the next move), `all` (reveals), `startAgain` (by learner), `setProblem {dividend, divisor}`. **Signals:** `stepped {step}`, `finished {quotient, remainder}`.

Each quotient term takes three moves: **divide** (what's left's first term ÷ the divisor's first term, written on top), **multiply** (the divisor by it, written underneath as −( … )) and **subtract** (what's left, under a line). Like powers stand in one column, the quotient's included. Under the layout, the maths of the move just made (2x²/x = 2x; 2x(x + 2) = 2x² + 4x; the subtraction), and after the last move dividend = divisor × quotient + remainder.

**Observation:** `working` (the layout, row by row), `move`, `next`, `startAgain`; the quotient and remainder sit under `hidden` until the last move.

## Tests

`src/poly.test.ts`: the laws against NCERT's own examples (Examples 6–9, Exercise 2.3, zeroes that are fractions, surds and repeats) and divisor × quotient + remainder = dividend over many generated cases. `src/props.test.tsx`: every action, and that every observed element is drawn and findable, rendering the Mafs view in Node.

Running Mafs on Preact: `react` and `react-dom` are `npm:@preact/compat` in this package, and the root `vitest.config.ts` points two of Mafs's dependencies at their ES builds so Node loads one Preact.
