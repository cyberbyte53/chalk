# @chalk/prop-polynomials

Polynomials, two ways: as a graph on a plane (`zeroPlane`) and as a box of terms (`polyBox`). Built for Class 10 Polynomials, used again for quadratic equations; each prop knows only its own world.

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

## Tests

`src/poly.test.ts`: the laws against NCERT's own examples (Examples 6–9, Exercise 2.3, zeroes that are fractions, surds and repeats) and divisor × quotient + remainder = dividend over many generated cases. `src/props.test.tsx`: every action, and that every observed element is drawn and findable, rendering the Mafs view in Node.

Running Mafs on Preact: `react` and `react-dom` are `npm:@preact/compat` in this package, and the root `vitest.config.ts` points two of Mafs's dependencies at their ES builds so Node loads one Preact.
