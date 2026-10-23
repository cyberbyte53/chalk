# @chalk/prop-decimal

Turning a fraction p/q into a decimal by long division, one digit at a time. Each step multiplies the remainder by 10 and divides by q; the remainder is always less than q, so either a remainder becomes 0 (the expansion terminates) or a remainder comes back and the digits repeat from there (non-terminating recurring). It knows division, nothing about any lesson.

## Contract: `decimalExpansion`

**Stored state**

| Field | What |
|---|---|
| `numerator` | p, a whole number, 0 to 99999 |
| `denominator` | q, a whole number, 1 to 999 |
| `digitsShown` | how many digits after the decimal point have been worked out, 0 to 60. For a terminating fraction it can't go past the last digit (1/8 stops at 3). |
| `isClockShown` | whether the remainder clock is drawn beside the division |
| `isAskingDigit` | whether the learner works out each next quotient digit on a digit pad (instead of a tap doing the step) |
| `rejectedDigit` | the digit the learner last tried that doesn't fit, or null |

**Derived state**

| Field | What |
|---|---|
| `wholePart` | the whole-number part, p ÷ q rounded down |
| `digits` | the digits after the decimal point worked out so far, as text (`"142857"`) |
| `remainders` | the remainder at each step so far: `remainders[0]` is left after the whole part, `remainders[i]` after the i-th digit (`digitsShown + 1` of them) |
| `remainder` | the latest remainder (the last of `remainders`), for rules |
| `isTerminating` | whether the expansion terminates: in lowest terms, q has no prime factors other than 2 and 5. A property of the number, true or false before any digit is shown. Not on screen. |
| `repeatStart` | digits after the point before the repeating block (1/6 = 0.1666…: 1). For a terminating fraction, how many digits it has (1/8: 3). Not on screen. |
| `repeatLength` | how many digits repeat (1/7: 6); 0 when it terminates. Not on screen. |
| `hasEnded` | it terminates and its last digit is shown (remainder 0 reached) |
| `hasRepeated` | a remainder already seen has appeared in what's shown (the repeating block is visible once) |
| `partialDividend` | the number divided at the next step: the latest remainder times 10 (a 0 brought down) |
| `slots` | q − 1: how many different non-zero remainders dividing by q can leave (the slots on the clock) |
| `decimalText` | what's shown, as text: `"3.142857…"`, `"0.125"`, `"7"` |

**Actions** (none is timed)

| Action | Changes | Keeps fixed | Reveals |
|---|---|---|---|
| `tryDigit { digit }` | the learner's answer to "how many times does q go into the partial dividend?". Right: the step is done, as `nextDigit`. Wrong: nothing moves, `rejectedDigit` is set and `digitRejected` says whether it was too big or too small | the fraction | no |
| `askForDigits { isAsking }` | turns the digit pad on or off | the division | no |
| `showClock { isShown }` | shows or hides the remainder clock | the division | no |
| `nextDigit` | one more step of the division: `digitsShown` + 1. Does nothing once it has ended, or at 60 digits. | the fraction | no |
| `showDigits { count }` | shows `count` digits (stops at the last digit of a terminating fraction) | the fraction | no |
| `completeDivision` | carries on until it ends or a remainder repeats (or 60 digits) | the fraction | **yes**: it answers "does it terminate?" and "what repeats?" |
| `startAgain` | back to 0 digits shown | the fraction | no |
| `setFraction { numerator, denominator }` | a new p/q, back to 0 digits | nothing (it is a new division) | no |

**Signals** (none is a commit)

- `digitFound { position, digit, remainder }`: `nextDigit` worked out one digit (position counts from 1 after the point).
- `ended`: the remainder became 0; the expansion terminates here.
- `repeated { start, length }`: a remainder came back; the block of `length` digits after the first `start` repeats.
- `digitRejected { digit, dividend, product, isTooBig }`: the learner tried a digit that doesn't fit: its product is more than the partial dividend (too big), or what's left would still be q or more (too small).

`showDigits` and `completeDivision` raise `ended` / `repeated` when they bring that moment into view, but not one `digitFound` per digit.

**Parts**: `digit:<n>` (the n-th digit after the point, from 1), `remainder:<i>` (as in `remainders`), `repeatBar` (once it has repeated), `clock` and `slot:<r>` (while the clock is shown), `nextDigit` and `digitPad` (while asking). Parts are marked in the view with `data-part`; there is no `locate`.

**With a finger**: a tap on the paper is `nextDigit`; with the digit pad on, a digit is `tryDigit`.

**The view.** The division is written the way NCERT p. 9 and a school notebook write it: the divisor outside the bracket, the quotient on top, and under the dividend the staircase of "product, line, what's left with a 0 brought down", one place further right each step. Remainders are saffron and the brought-down 0 grey, so the remainder is the thing you watch; a remainder that comes back is filled in, and the repeating block of the quotient gets its bar. The quotient and dividend stay pinned while the steps scroll under them. The remainder clock has a slot for each of the q − 1 non-zero remainders and 0 in the middle; each step draws a chord to the slot of its remainder, and when a slot is visited again the loop turns saffron: there are only q − 1 slots, so within q − 1 steps the division must stop (0) or come back to a slot and repeat.

## Files

- `src/model.ts`: the definition.
- `src/division.ts`: the arithmetic (long division steps, lowest terms, terminating test, repeating block).
- `src/paper.ts`: where every digit of the written-out division goes (columns and rows), pure; `src/paper.test.ts` checks it against the notebook layout (1 ÷ 7, 10 ÷ 3, 7 ÷ 8).
- `src/view.tsx`: the paper, the digit pad and the remainder clock. No words.
- Styles live in `src/styles.css`, drawn with the look's tokens.
- `src/model.test.ts`: 1/8, 1/3, 1/7, 1/6, 22/7, 7/1, 3/12 by hand; terminating iff q is 2s and 5s for every q ≤ 200; remainders < q; period ≤ q − 1 and the digits really repeat; exactly one digit fits at every step; every action; signals; refusals.

May import: `@chalk/prop`, `@chalk/player` (types), `preact`, `zod`. Exports: `decimalExpansionProp` (the module), `decimalExpansionDef`, `DecimalExpansionState`, `DecimalExpansionSignal`, `DecimalExpansionPart`.

## Contract: `decimalShift`

**What world is this?** A recurring decimal x = whole . prefix block block block … (the block repeats forever), written on two tapes: one shows 10^topPower × x, the other 10^bottomPower × x. Multiplying by 10 slides every digit one place to the left. Subtracting the two tapes takes away their infinite tails exactly when the tails are identical digit for digit, which happens when the shift between the tapes is a whole number of repeating blocks. What is left, (10^topPower − 10^bottomPower) × x, is then a decimal that ends, and x is a fraction p/q. It knows recurring decimals, nothing about any lesson.

**Stored state**

| Field | What |
|---|---|
| `whole` | the whole-number part of x, 0 to 999 |
| `prefix` | the digits after the point that do not repeat, as text, 0 to 4 digits (`"2"` in 0.2353535…) |
| `block` | the repeating block, as text, 1 to 4 digits, not all zeros (`"35"` in 0.2353535…). Kept as written: `"33"` is allowed and is the same number as `"3"`. |
| `topPower` | the top tape shows 10^topPower × x; 0 to 6 |
| `bottomPower` | the bottom tape shows 10^bottomPower × x; 0 to 6 |
| `cancel` | how far the subtraction has gone, 0 to 1: 0 the tapes are just lined up, 1 subtracted. Above 0 only when `topPower` > `bottomPower`. |
| `showResult` | whether the line `x = p/q` may be shown (input: a lesson may own it with an IS). It is drawn once the subtraction is done with the tails lined up. |

**Derived state**

| Field | What |
|---|---|
| `numerator`, `denominator` | x as p/q in lowest terms, worked out exactly (0.2353535… → 233, 990). Not on screen. |
| `period` | the length of the shortest repeating block (`"33"` → 1, `"35"` → 2). Not on screen. |
| `xText` | x as written, three blocks then "…": `"0.2353535…"` |
| `topText`, `bottomText` | each tape as an equation: `"100x = 23.535353…"`, `"x = 0.2353535…"` (digits as written, so 0.999… × 10 is `"10x = 9.999999…"`) |
| `multiplier` | 10^topPower − 10^bottomPower (99 for 100x − x); 0 or less when the top tape is not the larger |
| `areTailsLinedUp` | from some place on, the two tapes' digits after the point agree forever: `topPower − bottomPower` is a positive multiple of `period` |
| `isDifferenceWhole` | top − bottom is a whole number (needs the tails lined up and every digit after the point cancelling: `1000x − 10x` for 0.2353535…, not `100x − x`) |
| `differenceText` | `"99x = 23.3"` exactly when the tails are lined up; otherwise the first digits and "…" (`"9x = 2.1181818…"`); `""` when the top tape is not the larger |
| `hasSubtracted` | `cancel` is 1 |
| `isResultShown` | `showResult`, subtracted, and the tails lined up: the line `x = p/q` is on screen |
| `resultText` | `"x = 233/990"` in lowest terms (`"x = 1"` for 0.999…). Not on screen until `isResultShown`. |

**Actions**

| Action | Changes | Keeps fixed | Reveals | Finger |
|---|---|---|---|---|
| `shift { tape: "top" \| "bottom", by: 1 \| -1 }` | that tape's power by one (the ×10 and ÷10 buttons); `cancel` back to 0. Does nothing past 0 or 6. | x, the other tape | no | yes |
| `setPower { tape, power }` | that tape's power; `cancel` back to 0 | x, the other tape | no | no |
| `subtract` | **timed**, about 1.4 s: `cancel` glides from where it is to 1, then raises `subtracted`. Refused unless `topPower` > `bottomPower`; does nothing once subtracted. Stops if anything else changes the prop meanwhile. | x, both powers | no | yes |
| `startAgain` | `cancel` back to 0 (the tapes un-subtracted) | x, both powers | no | no |
| `setNumber { whole, prefix, block }` | a new x; `cancel` back to 0 | both powers | no | no |
| `revealResult` | `showResult` to true | everything else | **yes**: it gives p/q | no |

**Signals** (none is a commit)

- `shifted { tape, power }`: a tape was multiplied or divided by 10 (`shift`, `setPower`).
- `subtracted { isLinedUp, isWhole, multiplier }`: the subtraction finished; whether the tails cancelled, whether what is left is whole, and the multiplier on the left (99).

**Parts** (marked in the view with `data-part`; no `locate`, the tapes size themselves in CSS): `topTape`, `bottomTape`, `topDigit:<n>` / `bottomDigit:<n>` (the n-th digit after the point on that tape, from 1, for the digits drawn), `tail` (the digits that cancel, while the tails are lined up), `topShift`, `bottomShift` (the ×10 / ÷10 buttons), `minus` (the subtract button), `difference` (once subtracted), `result` (while `isResultShown`).

**With a finger**: ×10 and ÷10 beside each tape are `shift`; the − button is `subtract`.

### Files

- `src/shift.ts`: the definition.
- `src/shift-maths.ts`: the arithmetic, exact (BigInt): x as p/q, the digit at any place, each tape's digits, the difference, shortest period, decimals of a fraction.
- `src/shift-view.tsx`: two tapes of digit cells, the decimal points in one column, each digit keyed by its place in x so ×10 slides it a cell left. Repeating blocks tinted in alternate bands; lined-up tails joined by a saffron band and struck out as `cancel` grows; under a rule the difference `99x = 23.3` and then `x = 23.3/99 = 233/990`. About 12 digits, then the tape fades out to say "forever". Only maths, no words.
- Styles live in `src/styles.css`, drawn with the look's tokens.
- `src/shift.test.ts`: NCERT Examples 7–9 (0.3̅, 1.2̅7̅, 0.23̅5̅) and 0.9̅ = 1, 0.4̅5̅, 0.47̅, 0.0̅0̅1̅ by hand; p/q checked against long division for many generated numbers; lined up iff the shift is a multiple of the period; every action; refusals; `subtract` passes the one door at every step.

Exports (through `src/index.ts`): `decimalShiftProp` (the module), `decimalShiftDef`, `DecimalShiftState`.
