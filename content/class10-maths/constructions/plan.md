---
status: built
source: content/sources/text/ma10-ch11-constructions.txt
approved: 2026-10-20
---

# Class 10 Maths — Ch 11 Constructions

Source: NCERT Class 10 Mathematics, old full edition, Ch 11. We keep all of it: Constructions 11.1–11.3, the alternative method, every justification, and Exercises 11.1 and 11.2.

## Mission: Kabir's cycle poster (continued from Ch 10)

Riya draws the cycle for the poster with compass and ruler. She has to:
- mark the frame's tubes in the right ratios;
- scale Kabir's small sketch up for the poster and down for the handout;
- draw the chain's straight runs as tangents to the sprockets.

The `compassBox` and `posterDesk` scenes carry the story. Each construction is walked step by step: the compass or ruler appears for the step being made, a caption says what to do, and the last step gives the justification.

Every lesson runs **hook → learn → see it in life → practice**, plus a mission-log line.

## Lessons (in NCERT order)

1. **dividing-a-segment** (11.1, Construction 11.1 and the alternative method)
   - Hook: the `compassBox` scene. The frame tube must be split 3 : 2.
   - Learn: draw the ray AX, mark m + n equal steps, join B to A₍ₘ₊ₙ₎, then draw the parallel through Aₘ. Justification by the BPT (Ch 6). Alternative method: the parallel rays AX and BY, where AₘBₙ cuts AB, justified by similar triangles (AA).
   - Practice: Ex 11.1 Q1 (7.6 cm in 5 : 8).
   - Props: `construction` with kind divide, then divideAlt.

2. **similar-triangle-smaller** (Construction 11.2, Example 1)
   - Learn: scale factor 3/4 on sides 5, 6 and 7 cm. Mark max(m, n) points on BX, join Bₙ to C, draw the parallel through Bₘ to get C′, then the parallel to CA to get A′. Justification line by line.
   - See it in life: the `posterDesk` scene (the handout copy).
   - Props: `construction` with kind similar, m 3, n 4.

3. **similar-triangle-larger** (Example 2, Ex 11.1 Q2–7)
   - Learn: scale factor 5/3, where C′ and A′ fall on BC and BA extended.
   - Practice: Ex 11.1, including Q6 (∠B = 45°, ∠A = 105°) and Q7 (a right triangle).
   - Props: `construction` with kind similar, m 5, n 3.

4. **tangents-by-construction** (11.3, Construction 11.3, Ex 11.2)
   - Learn:
     - The tangent at a point on the circle: draw the radius, then its perpendicular at the end.
     - Construction 11.3, the tangents from an outside point P: bisect PO at M, draw the circle with centre M and radius MO to get Q and R, then join PQ and PR.
     - Justification: ∠PQO is an angle in a semicircle, so it is 90°.
     - The centre is not given? Find it as the point where the perpendicular bisectors of two non-parallel chords meet.
   - Practice: Ex 11.2, including Q4 (tangents inclined at 60°: ∠AOB = 120°) and Q7 (locating the centre with a bangle).
   - Mission log ends the chapter: the poster's outline is drawn.
   - Props: `construction` with kinds tangentAtPoint, tangentsFromPoint (r 6, d 10 for Ex 11.2 Q1) and tangentsAtAngle (angle 60).

## Props (`@chalk/prop-circles`, props/circles)

| Prop | Use | Key state | Signals |
|---|---|---|---|
| `construction` | every construction, step by step | kind (divide, divideAlt, similar, tangentAtPoint, tangentsFromPoint, tangentsAtAngle), step, canStep, showTool, length, m, n, ab, bc, ca, r, d, angle | stepped, done (with the result) |
| `circlesScene` | mission pictures | scene (compassBox, posterDesk, …) | — |

The derived `result` gives what the construction makes: ac and cb; scale and the new sides; pq and pr; the angle. Use it for checks. Captions are in English and Hindi.
