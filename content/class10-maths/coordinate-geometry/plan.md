---
status: built
source: content/sources/text/ma10-ch07-coordinate-geometry.txt
approved: 2026-10-20
---

# Class 10 Maths — Ch 7 Coordinate Geometry

Source: NCERT Class 10 Mathematics, old full edition, Ch 7. We keep all of it: the distance formula, the section formula, the area of a triangle (7.4, Ex 7.3) and the optional Exercise 7.4.

## Mission: The colony treasure hunt

On Sunday the colony's little kids get a treasure hunt in the park, and Riya and Kabir are setting it. Grandpa has the park's graph-paper map, drawn when the colony was built: the gate in the middle of the south wall is the origin, the wall runs along the x-axis (east is +) and the central path runs up the y-axis. One square is 1 m. Mom's herb patch is in the corner. Every clue card gives a place as two numbers.

What the mission asks:
1. **Where is it?** Every place is two numbers from the gate. The bench (4, 0) and the tap (0, 3) are 5 m apart (Pythagoras).
2. **How far as the crow flies?** The banyan is 36 m east and 15 m north of the gate. Kabir walks 51 m along the wall and up; the straight line is 39 m (NCERT's towns A and B).
3. **Is it a straight trail? Which spot is fair?** Three clue stones at (3, 1), (6, 4), (8, 6) lie in a line (Example 3's desks). The treasure goes on the central path, the same distance from the swing (6, 5) and the slide (−4, 3), so at (0, 9) (Example 5).
4. **Where on the path?** A clue on the straight path from the gate to the banyan, twice as far from the banyan as from the gate: (12, 5) (NCERT's relay tower).
5. **The fourth corner.** The flower bed is a parallelogram with three corners known, so the last clue is at the fourth (Example 10).
6. **How much mulch?** Mom's triangular herb patch (2, 1), (8, 3), (4, 7) is 16 m². Kabir's "triangle" of clue stones has area 0, because they are collinear.
7. **Hunt day.** The treasure is at the centroid (Ex 7.4 Q7).

Every lesson runs **hook → learn → see it in life → practice**, plus a mission-log line. Derivations are one step per line.

## Lessons (in NCERT order)

1. **points-on-the-plane** (7.1, start of 7.2)
   - Recap: axes, origin, x-coordinate (abscissa) and y-coordinate (ordinate), quadrants, (x, 0) and (0, y).
   - NCERT's plotting play.
   - Distances on an axis: AB = 6 − 4, CD = 8 − 3. Then AC = 5 and BD = 10 by Pythagoras.
   - Props: `coordinatePlane` (place a point; axis distances); scene `parkMap`.
2. **distance-formula** (7.2)
   - P(4, 6), Q(6, 8) gives 2√2. P(6, 4), Q(−5, −3) gives √170.
   - The general derivation is stepped: PR, QS ⟂ x-axis, then PT ⟂ QS, then Pythagoras. The origin case.
   - In life: the banyan is 39 m away (Ex 7.1 Q2). Practice: Ex 7.1 Q1–2.
   - Props: `coordinatePlane` with the right triangle (drag Q until PQ = 5) and the stepped proof; scene `crowFlies`.
3. **using-distances** (Examples 1–5, Ex 7.1 Q3–10)
   - Shapes: right triangle, square, isosceles, Champa and Chameli, Q6.
   - Collinear by distances.
   - Equidistant points: the relation x − y = 2, a point on an axis, Q7–10.
   - Props: `coordinatePlane` with polygon and lengths; scene `clueStones`.
4. **section-formula** (7.3)
   - The relay tower gives P(12, 5).
   - The general derivation via ∆PAQ ~ ∆BPC (AA), one step per line.
   - The k : 1 form; the midpoint. Example 6. Ex 7.2 Q1.
   - Props: `sectionDivider` (drag m : n, similar triangles, working); scene `halfwayClue`.
5. **using-section-formula** (Examples 7–10, Ex 7.2 Q2–10)
   - Find the ratio, trisection, an axis divides, the parallelogram's fourth vertex.
   - Q3 flags, Q7 diameter, Q8 AP = 3/7 AB, Q9 four equal parts, Q10 rhombus.
   - Props: `sectionDivider` with parts marks; scene `flowerBed`.
6. **area-of-a-triangle** (7.4, Examples 11–15, Ex 7.3)
   - The trapezium derivation.
   - Area = ½|x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂)|. Take the numerical value.
   - Collinear gives 0 (Examples 13–14). A quadrilateral splits into two triangles (Example 15). Q5 median.
   - Props: `triangleArea` (drag a vertex, trapezia, working, collinear signal); scene `herbPatch`.
7. **challenge-and-finale** (Ex 7.4, optional)
   - Q1 line divides, Q2 relation, Q3 circumcentre, Q4 square, Q5 Krishinagar lawn, Q6 the 1/16 area, Q7 centroid, Q8 rhombus.
   - Finale: scene `huntDay` and the mission log.

## Props (`@chalk/prop-coordinates`, library/props/coordinates)

Built on the geometry kit (`@chalk/prop-circles/kit`).

| Prop | Use | Key state | Signals |
|---|---|---|---|
| `coordinatePlane` | plotting, distance, shapes, collinear | points (≤ 4), movable, snap, window, join, showCoords, showLengths, showTriangle, proofStep | changed |
| `sectionDivider` | section formula, midpoint, trisection | a, b, m, n, canRatio, canMove, showSimilar, showParts, showWorking | changed, midpoint |
| `triangleArea` | area from coordinates | points (3), movable, snap, window, showTrapezia, showWorking | changed, collinear |
| `coordinatesScene` | mission pictures | scene (parkMap, crowFlies, clueStones, halfwayClue, flowerBed, herbPatch, huntDay) | — |

All words appear in English and Hindi. Working is written in TeX that needs no translation.
