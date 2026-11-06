# @chalk/prop-chemistry

Chemical equations as atoms you can count: balancing keeps every atom.

May import: `@chalk/prop`, `@chalk/player`, `@chalk/draw`, `@chalk/content`, `@chalk/sounds`, preact, zod. Exports `equationBalanceProp` (and `chemistryProps`); `defs` from `./defs`.

## `equationBalance`

**The world.** A chemical equation drawn as its molecules: reactants left of the arrow, products right, each molecule as its atoms (coloured balls, joined), drawn as many times as its coefficient. Under the picture, each element's atoms counted on both sides. The formulae never change; only the coefficients do. It is balanced when every element has as many atoms on the left as on the right (the law of conservation of mass: atoms are neither made nor lost, only regrouped), and then the atoms on the left can be moved across to make the molecules on the right.

**Variables**

| Name | What | Start |
|---|---|---|
| `reactants`, `products` | each side's molecules, 1 to 4: `{ formula, coefficient }`. A formula as the book writes it, digits for subscripts (`H2O`, `Fe3O4`, `Ca(OH)2`); a coefficient 1 to 6 | `H2 + O2 → H2O`, all 1 |
| `colors` | each element's colour (a look role or `#rrggbb`), by symbol; an element without one is grey | H white, O red, C charcoal, N blue, Fe rust, … |
| `pop` | the molecule whose copies are popping in or out now (`{ side, index, was }`: its coefficient before), or none | none |
| `popped` | how far that pop has gone, 0 to 1 (a planned move) | 0 |
| `regrouped` | 0: every atom in its own molecule on the left; 1: the left's atoms moved across into the right's molecules (a planned move) | 0 |

**Invariant.** Every element on one side is on the other (else no coefficients could balance it). A pop names a molecule there is.

**Facts**

- `tally`: each element's atoms, `[{ element, left, right }]`, in the order the elements first appear.
- `isBalanced`: every row of the tally has left = right.
- `equation`: the equation as text, `2H₂ + O₂ → 2H₂O` (a coefficient of 1 not written).
- `solution`: the smallest whole-number coefficients that balance it (`{ reactants, products }`), or null if none up to 6 do.

**Needs.** None.

**Actions**

| Action | From | Does | Refuses |
|---|---|---|---|
| `step { side, index, by: 1 \| −1 }` | screen (+ and − under each molecule) | one molecule more or fewer; the new copy pops in (or the last pops out); atoms back in their own molecules | below 1, above 6, a molecule not there |
| `setCoefficient { side, index, coefficient }` | board | that molecule's coefficient, its copies popping in or out together | the same as now, out of 1–6, not there |
| `startAgain {}` | screen (↺) | every coefficient back to 1 | nothing to undo |
| `regroup {}` | screen and board | the left's atoms fly across, one after another, into the right's molecules | not balanced; already regrouped |
| `ungroup {}` | screen and board | they fly back | not regrouped |

**Signals**

- `counted { side, index, coefficient, isBalanced }`: when a pop ends.
- `balanced { equation }`: with `counted`, when that change balanced it.
- `regrouped {}`, `ungrouped {}`: when the atoms have arrived.

**What the student sees**

- `equation` (text): the equation, coefficients picked out.
- `verdict` (boolean): balanced or not, in words.
- `reactants:<i>`, `products:<i>` (number): each molecule's copies, the formula and how many.
- `tally:<element>` (`{ left, right }`): the atoms of one element on each side, as dots and numbers; red when they differ, green when they match.
- inputs: `step:<side><i>-more`, `step:<side><i>-less`, `startAgain`, `regroup`, `ungroup`.
- `summary`: `H₂ + O₂ → H₂O: not balanced (O 2 vs 1)`.
- offScreen: none (the solution is a fact, never drawn).
