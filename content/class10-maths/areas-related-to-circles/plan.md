---
status: built
source: content/sources/text/ma10-ch12-areas-circles.txt
approved: 2026-10-20
---

# Class 10 Maths — Ch 12 Areas Related to Circles

Source: NCERT Class 10 Mathematics, old full edition, Ch 12. We keep all of it: 12.1–12.5, Examples 1–6 and Exercises 12.1–12.3.

## Mission: Kabir's cycle poster (finale of Ch 10 → 11 → 12)

The poster needs numbers:
- how far one turn of the wheel takes the cycle;
- how much the sector-shaped mudguard and the cut-off reflector cover;
- how much paint the shaded border designs need.

The fair day closes all three chapters.

Every lesson runs **hook → learn → see it in life → practice**, plus a mission-log line.

## Lessons (in NCERT order)

1. **circumference-and-area** (12.1–12.2, Fig 12.2, Example 1, Ex 12.1)
   - Hook: the `wheelRoll` scene. One turn moves the cycle 2πr.
   - Learn:
     - circumference / diameter = π (Aryabhata's 62832/20000; π is irrational; we use 22/7 or 3.14);
     - roll the wheel to unroll its rim;
     - cut the disc into slices and rearrange them into a near-rectangle πr × r, so the area is πr².
   - Example 1: fence ₹5280 at ₹24 per m gives 220 m, so r = 35 m and ploughing costs ₹1925.
   - Practice: Ex 12.1, including Q4 (car wheels: 4375 turns in 10 minutes) and Q5 (perimeter = area gives r = 2).
   - Props: `circleArea` in roll mode, then slices mode (8 → 32 slices, with the Arranged signal).

2. **sector-and-segment** (12.3, Figs 12.4–12.10, Examples 2 and 3)
   - Hook: the `mudguard` scene.
   - Learn:
     - minor and major sector and segment;
     - by the unitary method, 360° ↔ πr², so sector = θ/360 × πr² and arc = θ/360 × 2πr;
     - segment = sector − ∆OAB;
     - major = πr² − minor.
   - Example 2: r 4, θ 30°, π 3.14 gives 4.19 and 46.1 cm².
   - Example 3: r 21, θ 120° gives segment = 462 − (441/4)√3.
   - Props: `sectorSegment` with show sector, then segment, then showMajor and showArc.

3. **using-sectors** (Ex 12.2)
   - Practice:
     - the clock's minute hand (Q3);
     - the horse on a rope (Q8);
     - the brooch (Q9);
     - umbrella ribs (Q10);
     - wipers (Q11);
     - the lighthouse (Q12);
     - the table cover (Q13);
     - the formula check (Q14).
   - Props: `sectorSegment` with θ set per question (canTurn off for checks).

4. **combinations-of-figures** (12.4, Examples 4–6, Ex 12.3)
   - Hook: the `posterDesign` scene.
   - Learn: find a shaded area by adding and taking away known shapes, one piece at a time.
     - Example 4: the lawn and flower beds give 4032 m².
     - Example 5: a square less four circles gives 42 cm².
     - Example 6: semicircle petals give 57 cm².
   - Practice: Ex 12.3 Q1–16.
   - Finale: the `fairDay` scene and the mission log.
   - Props: `combinedFigures` with kinds lawnBeds, fourCircles and petals.

## Props (`@chalk/prop-circles`, props/circles)

| Prop | Use | Key state | Signals |
|---|---|---|---|
| `circleArea` | 2πr by rolling, πr² by slices | mode (roll, slices), r, rolled (eighths), slices (4–32), isArranged, pi (22/7, 3.14, exact), canChange, showWorking | changed, rolled, arranged |
| `sectorSegment` | sector, arc, segment, major parts | r, theta, step, show (sector/segment), showMajor, showArc, pi, canTurn, showWorking | changed |
| `combinedFigures` | add/subtract shaded regions | kind (lawnBeds, fourCircles, petals), step, canStep | stepped, done (total) |
| `circlesScene` | mission pictures | scene (wheelRoll, mudguard, posterDesign, fairDay, …) | — |

All words appear in English and Hindi.
