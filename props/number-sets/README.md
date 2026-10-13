# @chalk/prop-number-sets

The families of real numbers as rings inside rings, and number cards to sort into them. It knows which family holds which (N ⊂ W ⊂ Z ⊂ Q ⊂ R, irrationals ⊂ R and not in Q), nothing about any lesson.

## Contract: `numberSorter`

**Stored state**

| Field | What |
|---|---|
| `cards` | up to 12 `{ id, label, family, placedIn }`: `label` is the number as written ("12/4", "√2"); `family` the smallest family it belongs to (12/4 = 3 is natural); `placedIn` a family, `"outside"`, or null while in the tray |
| `families` | the rings drawn (any of natural, whole, integer, rational, irrational, real). Rings can be added one at a time, so the bag grows as the book grows it |
| `selected` | the card picked up, or null |
| `isMarked` | whether placed cards show right / wrong |
| `names` | words beside the rings by family, `{ en, hi }`, from the lesson (the letters N, W, Z, Q, R always show) |
| `outsideName` | words for the space outside every ring, or null |

**Derived state**: `placedIn` (by card id, for rules: `sorter.placedIn.zero == "natural"`), `placedCount`, `isAllPlaced`; and, not on screen, `rightPlace` (by card id), `wrongCount`, `isAllRight`.

A card belongs in the innermost ring drawn that holds it, or outside if none does: with only N drawn, 0 belongs outside; with R drawn and no irrational ring, √2 belongs in R.

**Actions**

| Action | What | Learner | Reveals |
|---|---|---|---|
| `pick { card }` | picks a card up (again: puts it down) | yes | |
| `drop { place }` | puts the picked card in a ring or outside | yes | |
| `place { card, place }` | puts a card somewhere | | |
| `takeBack { card }` | back to the tray | | |
| `showFamily { family }` | draws one more ring; placed cards stay put | | |
| `setCards { cards }`, `addCard { … }` | the cards (in the tray) | | |
| `mark { isMarked }` | shows right / wrong on placed cards | | yes |
| `putEachRight` | puts every card where it belongs | | yes |

**Signals** (none is a commit): `picked { card }`, `placed { card, place, isRight }`.

**Parts** (`data-part`): `card:<id>`, `region:<family>`, `region:outside`.

**The view.** Nested rounded regions in HTML (they wrap with the width): R holds Q and, beside it, the irrational numbers; Q holds Z holds W holds N, each a deeper blue; irrationals saffron. A ring's own cards sit at its top. Tap a card (it lifts, blue), then tap a ring; while a card is up, every ring is a dashed drop target.

## Files

- `src/model.ts`: the definition and the family laws (`placeFor`, `isInside`).
- `src/view.tsx`: the rings, the tray and the outside space.
- `src/model.test.ts`: the nesting, where a card belongs as rings are added, pick and drop, refusals.

May import: `@chalk/content`, `@chalk/prop`, `@chalk/player` (types), `preact`, `zod`. Exports: `numberSorterProp`, `numberSorterDef`, `NumberSorterState`, `Family`, `FamilySymbol`, `OUTSIDE`, `placeFor`, `isInside`, `NumberSorterPart`, `NumberSorterSignal`.
