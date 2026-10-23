---
status: built
source: content/sources/text/sc10-ch10-light.txt
approved: 2026-10-18
---

# Class 10 Science Ch 10: Light – Reflection and Refraction — lesson plan

Approved and built 2026-10-18. NCERT full edition (2020-21, jesc110; text extract in `content/sources/text/sc10-ch10-light.txt`). Built against `content/principles.md`. Replaces the four draft light lessons (reflection, spherical-mirrors, concave-mirror-images, convex-mirror-images: left on disk, unused).

**Concept folders (book order):** reflection-and-images, mirror-parts, mirror-ray-rules, concave-mirror-cases, convex-mirror-cases, mirror-formula, refraction, refractive-index, lenses, convex-lens-cases, concave-lens-cases, lens-formula, power-of-a-lens. Question bank: 20 families, every concept covered, firstTry picks in each.

**Thread (one idea, reused):** we see a thing when its light reaches our eye, and the eye always traces light back **in a straight line**. So an **image** is the point where rays from one point of the object **meet**, or **seem to come from**. Every ray rule is just the law of reflection or refraction at the point where the ray hits.

**Rules applied:** a word is defined before it is used; results (laws, R = 2f, the six cases, both formulas, Snell's law) are found on a prop, then stated; worked numbers before the general statement; sentence, then maths on its own line; motivate by understanding; Hindi with every string; questions under PassOn.Rules.

## Props (`@chalk/prop-light`)

| Prop | What it does | Used in |
|---|---|---|
| **planeMirror** | torch, floor mirror, star; drag the strike point; i, r | L1 |
| **mirrorImage** (new) | vertical plane mirror, arrow object, eye; rays into the eye, dashed extensions meet at the image; drag object / eye; distance ruler | L1 |
| **sphericalMirror** (extended) | + `beam` (sunlight), `showDistances` (u, v, f, h, h′ with signs), `showSigns` (New Cartesian axes), `showRuler`, `canSetFocal`, `canSetKind`, `span` (fixed scale), derived `inverseSum`; rays clipped to the stage | L2–L6 |
| **refraction** (new) | boundary / slab / coin modes; Table 10.3 media; i, r, sines, speeds; `showIndex` hides n until it's taught | L7, L8 |
| **lens** (new) | convex / concave thin lens, three rays, beam, object drag, readout, `cover` (half lens), `canSetFocal`, `span`, power | L9–L13 |

## Lessons

| # | Lesson | Pages | What she must understand |
|---|---|---|---|
| 1 | Reflection and images | seeing · ray meets a mirror (names) · light the star (i = r found) · laws · object and image (eye traces back) · real vs virtual · plane-mirror image (5 properties, lateral inversion) · examples · your turn | angles from the normal; what an image is; real vs virtual |
| 2 | Spherical mirrors | kinds (spoon) · parts (P, C, R, axis = normal at P, aperture) · principal focus (Activity 10.2, beam) · R = 2f found on a ruler · example · your turn | each part, where it is for each kind; F from parallel light |
| 3 | Ray diagrams for mirrors | why two rays · rays 1–4 each with its reason · all four together | why each rule holds |
| 4 | Images in a concave mirror | candle (F is the switch) · six case pages · table as one story · uses · example · your turn | cases from rays; real ⇔ inverted |
| 5 | Images in a convex mirror | pencil (always virtual, erect, diminished) · two cases · wide view and uses · your turn | one kind of image; rear-view mirrors |
| 6 | The mirror formula | signs · u, v and the formula found from readings · magnification (h′/h = −v/u) · Examples 10.1, 10.2 · your turn | signs; substituting; nature from signs |
| 7 | Refraction | medium/interface + coin · refraction (towards the normal) · glass slab · why: speed · laws (sin i / sin r found) · your turn | towards/away by speed; slab parallel |
| 8 | The refractive index | n₂₁ = v₁/v₂ · n = c/v with Table 10.3 · optical density ≠ mass density · example | n as a speed ratio |
| 9 | Lenses | kinds (Ex 1) · parts (O: straight through) · focus (Activity 10.11, F₁, F₂, 2F) | lens vocabulary |
| 10 | Images in a convex lens | three rays · candle (F₁ is the switch) · six case pages · table + Ex 3, 6 | same story as the concave mirror |
| 11 | Images in a concave lens | candle · comparison of all four | only spreads |
| 12 | The lens formula | signs · formula found (minus) · m = v/u · Examples 10.3, 10.4 · half-covered lens (Ex 9) · Ex 10 | the two formulas side by side |
| 13 | Power of a lens | power (shorter f bends more) · prescriptions · lenses in contact · needle | P = 1/f in metres |
