---
status: built
source: content/sources/text/ma10-ch10-circles.txt
approved: 2026-10-20
---

# Class 10 Maths — Ch 10 Circles

Source: NCERT Class 10 Mathematics, old full edition, Ch 10. We keep all of it, including both theorem proofs and Exercises 10.1 and 10.2.

## Mission: Kabir's cycle poster (Ch 10 → 11 → 12)

The school science fair asks for a poster on "How a cycle works". Kabir brings the cycle he saved up for in the AP finale, and Riya draws the poster. The same mission runs through three chapters:
- **Ch 10 asks why a wheel rolls smoothly.** It touches the road at one point, and the spoke there stands straight up (tangent ⟂ radius). The chain leaves the sprockets along tangents. Grandpa's village well pulley is NCERT Fig 10.2.
- **Ch 11 draws it to scale.** Riya draws the poster with compass and ruler.
- **Ch 12 measures it.** It covers distance per turn, the sector-shaped mudguard and the poster's shaded designs.

Every lesson runs **hook → learn → see it in life → practice**, plus a mission-log line. Proofs are written one step per line, each step revealed on Next.

## Lessons (in NCERT order)

1. **lines-and-circles** (10.1, Fig 10.1)
   - Hook: the `fairNotice` scene.
   - Learn: a line and a circle can have no common point (non-intersecting), two (a secant, which cuts a chord) or one (a tangent). Slide the line across.
   - See it in life: the `wellPulley` scene (the rope just touches the pulley).
   - Props: `lineCircle` in slide mode with showChord on.

2. **tangent-at-a-point** (10.2, Activities 1 and 2)
   - Learn: Activity 1 turns a line about P until the second point Q runs into P, so the tangent is the limit of a secant and there is exactly one tangent at P. Activity 2 slides a line: at most two tangents are parallel to a given line. Point of contact.
   - Practice: Ex 10.1 Q1, Q2 and Q4.
   - Props: `lineCircle` in rotate mode, then slide mode (watch for the Touched signal).

3. **tangent-perpendicular-radius** (Theorem 10.1)
   - Hook: the `wheelRoad` scene.
   - Learn: the proof, one line per step. Take any Q ≠ P on the tangent XY. Q lies outside the circle, so OQ > OB = OP. OP is the shortest distance from O to XY, so OP ⟂ XY. Remarks: at most one tangent at a point; the tangent's perpendicular through the point passes through the centre (the normal).
   - Practice: Ex 10.1 Q3 (√119 cm).
   - Props: `lineCircle` in shortest mode.

4. **tangents-from-a-point** (10.3, Activity 3, Theorem 10.2)
   - Learn: from a point inside the circle there is no tangent, from a point on it one, from a point outside two. Length of a tangent.
   - Theorem 10.2 is proved one line per step: OQ = OR, OP is common, and ∠OQP = ∠ORP = 90°, so ∆OQP ≅ ∆ORP (RHS) and PQ = PR. Alternative proof by Pythagoras: PQ² = OP² − OQ² = OP² − OR² = PR². Remark: OP bisects ∠QPR.
   - See it in life: the `chainSprockets` scene.
   - Props: `tangentsFromPoint` with showRadii and showLengths, then showBisector and showAngles.

5. **using-tangent-theorems** (Examples 1–3, Ex 10.2 Q1–13)
   - Learn:
     - Example 1: concentric circles, where the chord of the larger circle that touches the smaller one is bisected at the point of contact.
     - Example 2: ∠PTQ = 2∠OPQ.
     - Example 3: TP = 20/3 cm.
   - Practice: Ex 10.2, including Q10 (∠P + ∠QOR = 180°), Q11 (a parallelogram circumscribing a circle is a rhombus), Q12 (the triangle's sides from tangent lengths) and Q13 (opposite sides subtend supplementary angles).
   - Mission log ends the chapter: Riya now knows how the wheel, chain and pulley touch, and has to draw them.
   - Props: `tangentsFromPoint` with showAngles for Q10.

## Props (`@chalk/prop-circles`, props/circles)

| Prop | Use | Key state | Signals |
|---|---|---|---|
| `lineCircle` | 10.1–10.2, Theorem 10.1 | mode (slide, rotate, shortest), r, offset, turn, along, step, turnStep, names, canMove, showKind, showRadius, showChord | changed, touched |
| `tangentsFromPoint` | 10.3, Theorem 10.2, Ex 10.2 Q10 | r, d, step, names, canMove, showRadii, showLengths, showBisector, showAngles, showCount | changed, outside |
| `circlesScene` | mission pictures | scene (fairNotice, wheelRoad, wellPulley, chainSprockets, …) | — |

All words appear in English and Hindi. Proof steps are written in TeX that needs no translation.
