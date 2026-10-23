---
status: built
source: content/sources/text/ma10-ch06-triangles.txt
approved: 2026-10-20
---

# Class 10 Maths — Ch 6 Triangles

Source: NCERT Class 10 Mathematics, old full edition, Ch 6. We keep all of it: areas of similar triangles (6.5), the Pythagoras theorem with its converse and proofs (6.6), and the optional Exercise 6.6.

## Mission: Lights on the water tank

It is Republic Day week. The colony is stringing lights from the top of the water tank down to the top of the gate pillar, and printing a banner photo for the notice board. Riya and Kabir run the maths; Grandpa holds the ladder; Mom handles the print shop.

What the mission asks:
1. **Is the poster right?** The shop's "enlarged" photo has to be similar to the original, not just bigger. Riya catches a stretched print.
2. **How tall is the tank?** Kabir's 1.5 m stick throws a 1 m shadow while the tank throws 10 m, so the tank is 15 m tall.
3. **What does a bigger banner cost?** Ink goes by area, so a print 3× as wide costs 9× as much.
4. **How long a wire?** The tank top is 15 m up, the pillar top is 3 m, and they stand 16 m apart. The drop is 12 m, so the wire is √(12² + 16²) = 20 m.
5. **Will the ladder reach?** Grandpa's ladder at the pillar is NCERT Example 11, and Kabir's shadow under the street lamp is Example 7.

The finale is the lit string on Republic Day night.

Every lesson runs **hook → learn → see it in life → practice**, plus a mission-log line. Proofs are written one step per line, each step revealed on Next.

## Lessons (in NCERT order)

1. **similar-figures** (6.1–6.2, Ex 6.1)
   - Hook: the shop's stretched photo.
   - Learn: congruent vs similar. Similar polygons need both conditions: corresponding angles equal **and** sides in the same ratio. Square vs rectangle (Fig 6.6) and square vs rhombus (Fig 6.7) each meet one condition only.
   - Activity 1: a card's shadow under a bulb.
   - Props: `similarFigures` in all four pairs; scenes `noticeBoard` and `photoShop`.

2. **basic-proportionality** (6.3, Ex 6.2)
   - Hook: lines ruled parallel on the banner.
   - Learn: Activities 2–3. Theorem 6.1 (BPT), proved via areas, one step per line. Converse 6.2 by Activity 3. Examples 1–3.
   - Props: `proportionLine` (parallel mode for BPT, free mode for the converse with its Parallel signal).

3. **aa-and-sss** (6.4, first half)
   - Learn: the ~ notation and why vertex order matters. Activity 4 leads to AAA and AA (Theorem 6.3). Activity 5 (3, 6, 8 vs 4.5, 9, 12) leads to SSS (Theorem 6.4). Example 5.
   - Props: `triangleMatch` in angles mode, then sides mode.

4. **sas-and-using-similarity** (Theorem 6.5, Activity 6, Examples 4, 6, 7, 8, Ex 6.3)
   - See it in life: the tank's height from the stick's shadow; Kabir under the street lamp (Example 7); Q15's tower is 42 m.
   - Props: `triangleMatch` in SAS mode; `shadowHeight` in sun and lamp modes; scenes `waterTank`, `stickShadow` and `streetLamp`.

5. **areas-of-similar-triangles** (6.5, Theorem 6.6 with proof, Example 9, Ex 6.4)
   - See it in life: banner cost (3× → 9×).
   - Props: `areaTiles` in three modes:
     - tiles: n² unit triangles;
     - half: XY ∥ AC halves the area at XB/AB = 1/√2 (Example 9);
     - midpoints: the midpoint triangle is ¼ (Q5).

6. **pythagoras-theorem** (6.6, Ex 6.5)
   - Learn: Theorem 6.7, the altitude to the hypotenuse makes similar triangles. Theorem 6.8, Pythagoras proved via 6.7. Baudhayan's note. Theorem 6.9, the converse. Examples 10–14.
   - See it in life: Grandpa's ladder (Example 11) and the wire (20 m).
   - Props: `pythagoras` in three modes:
     - squares: unit grids;
     - altitude: a 3-step proof;
     - converse: the RightAngle signal.
   - Scenes: `ladderPillar` and `wireToTank`.

7. **challenge-and-finale** (Ex 6.6, optional)
   - Covers the angle-bisector theorem, the obtuse and acute extensions of Pythagoras, medians, intersecting chords, and Nazima's fly-fishing (Q10).
   - Finale: the `republicNight` scene with the mission log.

## Props (`@chalk/prop-triangles`, props/triangles)

| Prop | Use | Key state | Signals |
|---|---|---|---|
| `similarFigures` | similar vs merely alike | pair (enlarged, squareRectangle, squareRhombus, shadow), shape, scale, angle, can*/show* | changed |
| `proportionLine` | BPT and its converse | mode (parallel/free), ab, ac, angleA, d, e, parts, names | changed, parallel |
| `triangleMatch` | AAA/AA, SSS, SAS | first, second (sides), edit (none, scale, sides, sas, angles), step | changed, similar |
| `areaTiles` | area ratio = (side ratio)² | mode (tiles, half, midpoints), small, big, t | changed, halved |
| `pythagoras` | squares, altitude proof, converse | mode, ab, bc, ca, step (0–3) | changed, stepped, rightAngle |
| `shadowHeight` | heights by similar triangles | mode (sun/lamp), object, stick/lamp/person sizes, step (0–3) | changed, stepped, solved |
| `trianglesScene` | mission pictures | scene (noticeBoard, waterTank, photoShop, stickShadow, streetLamp, ladderPillar, wireToTank, republicNight) | — |

All words appear in English and Hindi. Proof and working steps are written in TeX that needs no translation.
