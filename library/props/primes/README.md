# @chalk/prop-primes

Whole numbers and their primes: division with remainder, Euclid's algorithm, prime factorisation as a **bag of beads**, HCF and LCM, and what the bags say about square roots and decimals. Built for Class 10 Real Numbers, but each prop knows only its own world.

**One picture across every prop: a prime is a bead.** Each prime keeps one colour on every page (2 the primary blue, 3 teal, 5 saffron, 7 violet, larger primes grey) and is always written on its bead. A number's prime factorisation is its bag: 360 holds 2, 2, 2, 3, 3, 5. The bag of a product is the two bags poured together; the bag of nᵏ is n's bag k times. Props show no words (only numbers and maths symbols); words come from the lesson.

**What Jugnu sees.** Each prop defines `observe`: a one-line summary and every element on screen with what it shows (see docs/board-model.md). Every element's id is a `data-part` in the view, so `point` can ring it; a disabled button says `disabled`, a pressed-in option `chosen`. What the prop knows but the screen doesn't show yet sits under `hidden`: the HCF until the cutter finishes or the HCF column is shown, the LCM likewise, a factor tree's factorisation until every end is prime, when the gears meet until they have, a fraction's decimal until it is topped up. `src/seen.ts` holds the wording the views and observations share; `src/observe.test.ts` checks both rules for each prop.

`src/arithmetic.ts` holds the shared laws: `bagOf`, `bagText` (2³ × 3² × 5), `common` (HCF's bag: smallest counts), `covering` (LCM's bag: largest counts), `divide` (a = bq + r, 0 ≤ r < b), `euclidSteps`, `gcd`, `lcm`, `isPrime`.

## `divisionRows`: a counters in rows of b

**Stored:** `dividend` a (0–120), `divisor` b (1–12). **Derived:** `quotient` q (full rows), `remainder` r (left over).
**Actions** (both by learner, − / + buttons): `setDividend { value }`, `setDivisor { value }`. **Signal:** `changed { q, r }`.
**View:** full rows blue, the r left over saffron, the b − r places that would make another row dashed, so r < b is seen; `a = b × q + r` and `r < b` underneath.

## `squareCutter`: Euclid's algorithm as cutting squares

**Stored:** `sideA`, `sideB` (1–100000), `cuts` (rounds done). **Derived:** `steps` (the divisions done, `{ a, b, q, r }`), `stepCount`, `hcf` (off screen), `isDone`, `piece` (the rectangle still to cut, or null).
**Actions:** `cut` (learner, ✂: one round, as many squares as fit), `startAgain` (learner, ↺), `setSides { sideA, sideB }` (learner), `cutAll` (**reveals** the HCF).
**Signals:** `cut { a, b, q, r }`, `finished { hcf }`.
**View:** the whole rectangle with every round's squares; when the pieces get too small to see, the latest piece again, magnified (⤢). The divisions are listed under it, the latest in blue. The last round's squares, whose side is the HCF, are saffron.

## `remainderShelves`: every number has one remainder

**Stored:** `divisor` b (2–12), `power` (1, 2 or 3: place n, n² or n³), `placed` (n = 1 … placed are on the shelves, up to 60). **Derived:** `placements` (`{ n, value, shelf }`), `litShelves`, `next`.
**Actions** (all by learner): `placeNext` (+1), `placeMany { count }` (+10), `setPower { power }` (n, n², n³), `setDivisor { divisor }`, `clear` (↺). **Signal:** `placed { n, value, shelf }`.
**View:** one shelf per remainder, named bq, bq + 1, …; the newest number saffron and written out (49 = 3 × 16 + 1). A shelf nothing reaches stays dashed: squares on 3 shelves never reach 3q + 2.

## `factorTree`: any splits, the same primes

**Stored:** `number` (2–999999), `splits` (`{ node, factor }` in order; nodes are `r`, `r0`, `r1`, `r00`, …), `selected` (the end tapped, or null). **Derived:** `nodes`, `isComplete`, `bag` (primes at the ends so far), `bagText`, `primes` (the full factorisation, off screen).
**Actions:** `select { node }` and `split { node, factor }` (learner: tap a dashed number, then one of its factor pairs), `startAgain` (learner, ↺), `setNumber { number }` (learner), `splitAll` (**reveals**: splits at the smallest prime until done).
**Signals:** `split { node, factor }`, `completed { primes }`.
**View:** the tree top down; numbers still to split dashed, primes as beads. The primes collect in the bag underneath, with `360 = 2³ × 3² × 5` once complete.

## `primeBag`: the bag of nᵏ

**Stored:** `base` n (1–999), `power` k (1–12), `isPowerShown`. **Derived:** `bag`, `bagText`, `valueText` (nᵏ in full, exact), `lastDigit`, `hasTwoAndFive`.
**Actions** (learner): `setBase { base }` (typed), `setPower { power }` (slider).
**View:** `4⁵ = 1024` with the last digit picked out; with a power, n's bag drawn k times over, copy by copy, so only n's primes ever appear (4ⁿ is all 2s: no 5, so never a 0 at the end).

## `bagCompare`: HCF and LCM, row by row

**Stored:** `numbers` (two or three, 2–99999), `show` (`apart`, `hcf`, `lcm`, `product`), `isEditable`, `names` (`{ hcf, lcm }`, the words for them, `{ en, hi }`). **Derived:** `bags`, `primes` (the rows), `hcf`, `lcm`, `hcfBag`, `lcmBag`, `product`, `hcfTimesLcm`.
**Actions:** `show { show }` (learner, **reveals**), `setNumbers { numbers }` (learner, typed when editable). **Signal:** `shown { show }`.
**View:** a column per number and a row per prime. HCF rings, in each row, the fewest beads any number has and collects them in its own column; LCM the most. For two numbers, `product` shows HCF and LCM together: each row's smaller and larger count are the two numbers' counts, so HCF × LCM = a × b.

## `gearPair`: when the painted teeth meet again

**Stored:** `teethA`, `teethB` (4–40), `turned` (teeth passed the meeting point, the same for both gears). **Derived:** `meetEvery` (LCM, off screen), `turnsA`, `turnsB`, `isMarkMet`, `timesMet`.
**Actions:** `turnBy { teeth }` (learner, ↻ 1, ↻ a, ↻ b; timed), `turnToMeet` (learner, **reveals**; timed), `setTeeth { teethA, teethB }`, `startAgain` (↺).
**Signals:** `stopped { turned }` after every turn; `met { turned, turnsA, turnsB }` when the painted teeth are together again.
**View:** two meshing gears, each with its painted tooth, starting together at the meeting point ▾; the teeth passed between them, each gear's turns underneath. At the LCM the mark glows.

## `squareBalance`: why a² never equals 2b²

**Stored:** `root` n (2–99), `a`, `b` (1–9999). **Derived:** `left` (a²), `right` (n × b²), `leftBag`, `rightBag`, `leftText`, `rightText`, `isBalanced`, `oddOnRight` (the primes the right pan has an odd number of).
**Actions** (learner, steppers): `setA { a }`, `setB { b }`, `setRoot { root }`.
**View:** a beam that tips to the heavier pan, and each pan's bag with every prime's count. A square's bag has even counts only; the primes odd on the right are ringed on both pans and their counts marked. For √2 the 2s are always odd on the right (17/12: 289 against 288), so the pans never balance. √4 balances (2/1).

## `tenMaker`: which fractions end

**Stored:** `numerator` p, `denominator` q (up to 99999), `stage` (`given`, `lowest`, `toppedUp`). **Derived:** `lowest`, `denominatorBag`, `twos`, `fives`, `others` (primes other than 2 and 5), `canEnd`, `places`, `multiplier`, `decimal` (off screen, with `canEnd`).
**Actions** (learner): `reduce` (÷: lowest terms), `topUp` (→ 10ⁿ, **reveals**: multiply by the missing 2s and 5s; refused with `cantTopUp { others }` if another prime is there), `startAgain`, `setFraction { numerator, denominator }`.
**Signals:** `reduced`, `toppedUp { decimal }`, `cantTopUp { others }`.
**View:** the fraction, then its denominator's bag with 2s and 5s paired into tens; a missing partner drawn hollow (what topping up adds), any other prime boxed in red, since it can never be paired. Topped up: `3/8 = 3 × 125 / 8 × 125 = 375/1000 = 0.375`.

## Files

- `src/arithmetic.ts`: the shared laws; `src/arithmetic.test.ts` checks them against the book (NCERT 1.2–1.3) and over every small case.
- `src/<prop>.ts` and `src/<prop>-view.tsx` for each prop; `src/ui.tsx`: beads, bag rows, symbol buttons, steppers, number boxes.
- `src/props.test.ts`: every prop's laws and actions, against cases known by hand; `src/test-door.ts` runs actions through the one door for it.
- `src/styles.css`: drawn only with the look's tokens.

May import: `@chalk/content`, `@chalk/prop`, `@chalk/draw`, `@chalk/player` (types), `preact`, `zod`. Exports every prop's module (`primeProps`), definition (`…Def`) and enums.
