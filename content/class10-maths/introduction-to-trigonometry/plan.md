---
status: built
source: content/sources/text/ma10-ch08-trigonometry.txt
approved: 2026-10-20
---

# Class 10 Maths: Ch 8 Introduction to Trigonometry

Source: NCERT Class 10 Mathematics, old full edition, Ch 8. Everything is kept: ratios, specific angles (0°–90°), complementary angles (8.4) and identities (8.5) with all their examples and exercises.

## Mission: The Kite Hill (Ch 8 → Ch 9)

Makar Sankranti is a month away. The family will fly kites from the old fort on the hill, the way Grandpa did as a boy. Kabir asks, "How high does my kite actually go?" Nobody can climb a string. Grandpa says the surveyors who measured Everest never climbed it either: they measured angles. He shows the kids how to make a **clinometer** (a protractor, a straw and a thread with a nut on it), and Riya sets out to learn what an angle can tell you about lengths.

- **Ch 8** builds the tool and the table. By the end Riya has a "ratio card" of sin/cos/tan for 0°, 30°, 45°, 60° and 90°, and knows why one angle fixes every ratio.
- **Ch 9** is festival day on the hill. They use the clinometer to measure the fort's tower, the kite, the temple flag and the river below (see `content/class10-maths/applications-of-trigonometry/plan.md`).

Every lesson runs **hook → learn → see it in life → practice**, then a mission-log line. Proofs and derivations go one step per line, revealed on Next.

## Lessons (in NCERT order)

1. **trigonometric-ratios** (8.1, 8.2 up to "values do not vary", the Aryabhata box)
   - Hook: the fort, the kite, "how high?"; Grandpa's clinometer.
   - Learn:
     - opposite, adjacent and hypotenuse *relative to an angle*, then what changes when the angle is C instead of A (Fig 8.4–8.5);
     - the six ratios, the reciprocals, and tan = sin/cos;
     - "sin A is not sin × A";
     - Fig 8.6: the same angle in a bigger or smaller triangle gives the same ratios (AA similarity from Ch 6);
     - the notation sin²A, and θ.
   - See it in life: Kabir's kite string drawn as a right triangle. At the same angle a longer string means a higher kite, but height ÷ string stays the same.
   - Props: `trigRatios` (drag the angle, scale the triangle, swap the reference angle), scenes `fortHill` and `clinometer`.

2. **ratios-from-one-ratio** (8.2 rest, Examples 1–5, Exercise 8.1)
   - Learn:
     - sin A = 1/3 gives sides k and 3k; Pythagoras gives the third side;
     - why AB is not −2√2k;
     - sin and cos are never more than 1.
     - Examples 1 (tan A = 4/3), 2 (sin B = sin Q, so B = Q), 3 (29-21-20), 4 (tan A = 1) and 5 (OQ − PQ = 1).
   - See it in life: Riya's ladder against the wall in the fort courtyard.
   - Props: `trigRatios` in given-ratio mode (k-steps revealed).

3. **ratios-of-specific-angles** (8.3, Table 8.1, Examples 6–8, Exercise 8.2)
   - Learn:
     - 45° from half a square (Fig 8.14);
     - 30° and 60° from half an equilateral triangle (Fig 8.15), with the congruence step written out;
     - 0° and 90° as limits (Figs 8.16–8.18), and why tan 90° and cot 0° are not defined;
     - filling Table 8.1, and the remark that sin rises from 0 to 1 while cos falls.
   - See it in life: Riya's ratio card goes on the clinometer.
   - Practice: Examples 6–8, Exercise 8.2 (2 sin A = sin 2A? and true/false).
   - Props: `specialAngles` (square, equilateral and limits modes, step-through, table that fills in).

4. **complementary-angles** (8.4, Examples 9–11, Exercise 8.3)
   - Learn:
     - A and C = 90° − A in the same triangle;
     - the side opposite one is the side adjacent to the other;
     - the six pairs, and the check at 0° and 90°.
   - See it in life: Grandpa's riddle "sin 60° = cos 30°?" on the clinometer.
   - Practice: Exercise 8.3 Q1–7.
   - Props: `trigRatios` with the reference swapped (pairs view).

5. **trigonometric-identities** (8.5, Examples 12–15, Exercise 8.4), the Ch 8 finale
   - Learn:
     - definition of an identity;
     - AB² + BC² = AC² divided by AC², AB² and BC² in turn gives the three identities, each with where it holds;
     - expressing ratios through one ratio;
     - Examples 13–15 as step-through proofs.
   - See it in life: the ratio card is complete, and the clinometer is ready for the hill.
   - Practice: Exercise 8.4 (choose-the-option and selected proofs as order-the-steps).
   - Props: `unitIdentity` (hypotenuse 1, squares on the legs, divide-by switch), scene `ratioCard`.

## Props (shared package `@chalk/prop-trigonometry`, props/trigonometry)

| Prop | Use | Key state | Signals |
|---|---|---|---|
| `trigRatios` | opposite/adjacent/hypotenuse, the six ratios, sizes don't matter, complementary pairs | angle, size, reference (A or C), shown (ratios), showSides, showValues, showPairs, can* | changed, swapped |
| `specialAngles` | 45°, 30°/60°, 0°/90° derivations and Table 8.1 | mode (square, equilateral, limits), step, limit, filled | stepped, filled |
| `unitIdentity` | sin² + cos² = 1 and the other two by dividing | angle, divideBy (hyp, adjacent, opposite), showSquares, canSetAngle, canDivide | changed |
| `trigScene` | mission pictures | scene | none |

Ch 9 adds `heightFinder` and `clinometer`, from the same package.

All shown words are in English and Hindi. Ratio values use TeX (\tfrac{\sqrt3}{2} and so on), which needs no translation.
