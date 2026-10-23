---
status: built
source: content/sources/text/sc10-ch05-periodic-classification.txt
approved: 2026-10-20
---

# Class 10 Science, Ch5: Periodic Classification of Elements (plan)

Source: NCERT jesc105 (2020-21, the full edition). Keep everything: triads, octaves (with the sa-re-ga-ma box), Mendeléev's table, its achievements and limitations, the modern table, positions and trends.

Structure: theory-first, like Light L1. Each lesson runs Hook → Learn (NCERT order, define before use, props) → See it in life → Practice (examples, NCERT in-text and exercises, your turn, mission log). Hindi with every string.

## Mission: The Card Wall
The school is holding an Element Quiz Night, and every class must bring a display. Kabir has a shoebox of 118 element cards from a science magazine, each with a symbol, a mass and a few facts, all in a jumbled heap. Riya says a heap is useless in a quiz: "We need an order where knowing one card tells you about its neighbours."

Grandpa points out that this is exactly what chemists did, with cards too: Mendeléev wrote 63 elements on cards and pinned them on a wall. So each lesson, they try the next historical idea with the cards and see where it works and where it breaks:
- piles of three;
- Riya's music class;
- a wall with gaps;
- the hydrogen card that won't sit still;
- the modern table;
- the trends that let you answer questions about cards you've never studied.

Finale: Quiz Night. Their card wall answers a surprise question about an element nobody memorised.

## Lessons (NCERT order)
1. **why-classify** (intro, 5.1, 5.1.1)
   - Recap from Class IX: element, atom, atomic mass (u). 118 elements known, 94 natural. Why sort at all: NCERT's shop analogy (soaps here, biscuits there) and the treasure-map figure. The first sorting was into metals and non-metals.
   - Döbereiner's triads (1817): three similar elements in order of mass, with the middle mass ≈ the average of the other two. Li, Na, K; Table 5.1 groups A/B/C (B and C are triads, A is not); Table 5.2. Limitation: only three triads were found.
   - Prop: triadChecker.
2. **newlands-octaves** (5.1.2)
   - 1866: elements in order of increasing mass, H to Th (56 elements); every eighth element resembles the first. Musical notes sa-re-ga-ma-pa-da-ni ("Do You Know?" box), Table 5.3, Li/Na and Be/Mg.
   - Limitations: it works only up to calcium; Newlands assumed only 56 elements; two elements share a slot (Co and Ni under the halogens); Fe is far from Co/Ni; noble gases made the law irrelevant.
   - In-text Q1–Q3. Prop: octaveTable.
3. **mendeleev-table** (5.2, 5.2.1)
   - Mendeléev's 63 cards; oxides and hydrides as the basis (R₂O, RO, …; RH, RH₂, …; the R notation); the periodic law based on atomic mass; groups and periods.
   - Achievements: the Co (58.9) before Ni (58.7) inversion; gaps and the eka- prefix (Sanskrit "one"); Table 5.5, eka-aluminium vs gallium; Sc and Ge; noble gases added as a new group without disturbing the order.
   - In-text Q1 (oxides of K, C, Al, Si, Ba), Q2–Q4. Prop: mendeleevTable.
4. **mendeleev-limits** (5.2.2)
   - Hydrogen: like alkali metals (HCl/NaCl, H₂O/Na₂O, H₂S/Na₂S) and like halogens (diatomic, covalent) (Activity 5.1).
   - Isotopes: Cl-35 / Cl-37 (Activity 5.2).
   - Masses don't rise in regular steps, so you can't tell how many elements are missing.
   - Prop: mendeleevTable (anomalies mode).
5. **modern-periodic-table** (5.3, 5.3.1)
   - Moseley (1913): atomic number Z (protons) is more fundamental. The modern periodic law; Activity 5.3 (Co/Ni resolved, isotopes share a place, no Z = 1.5, hydrogen).
   - 18 groups, 7 periods. A group has the same number of valence electrons (Activity 5.4), with shells increasing down the group. A period has the same number of shells (Activity 5.5), with valence electrons +1 across. Each period marks a new shell. 2n² gives 2 and 8; period lengths are 2, 8, 8, 18, 18, 32, 32.
   - Why Mendeléev's formula-based choice was a good one. Prop: periodicTable (first 20, with shells).
6. **trends-and-finale** (5.3.2)
   - Valency from configuration (Activity 5.6: Mg 2, S 2; the first 20).
   - Atomic size (radius in pm; H 37 pm): decreases across a period (Activity 5.7, the period-2 radii) and increases down a group (Activity 5.8, the group-1 radii), with the reasons (nuclear charge, new shells).
   - Metallic vs non-metallic: metals on the left, non-metals on the right; the zig-zag line; metalloids (B, Si, Ge, As, Sb, Te, Po). Losing electrons is electropositive; metallic character decreases across a period and increases down a group (Activity 5.10). Electronegativity is the opposite (Activity 5.11). Oxides: metal oxides are basic, non-metal oxides acidic.
   - In-text Q1–Q6; Exercises 1–10.
   - Finale: Quiz Night.
   - Prop: periodicTable (trends heat-maps, full table).

## Props (new package @chalk/prop-periodic)
- **triadChecker**: three element cards in order of mass. Step to compute the average of the outer two, compare it with the middle one, and get a verdict (a triad or not, within a few per cent). Choices: Li/Na/K, Ca/Sr/Ba, Cl/Br/I, N/P/As.
- **octaveTable**: Newlands' Table 5.3 under the notes sa…ni. Tap a note to light its column. "Show where it breaks" marks the double slots (Co and Ni, Ce and La), Fe placed far away, and every row after calcium.
- **mendeleevTable**: a simplified 1872 table (groups I–VIII with oxide and hydride formulae, periods 1–5), with gaps for eka-boron, eka-aluminium and eka-silicon.
  - Modes: table (tap a card: its group and its oxide formula), predict (eka-aluminium vs gallium, Table 5.5, reveal), anomalies (Co/Ni, hydrogen with nowhere to sit, Cl-35 and Cl-37).
- **periodicTable**: the modern table.
  - Layouts: the first 20 elements in 8 short columns (groups 1, 2, 13–18) for phones, or all 118 in 18 columns as small tiles.
  - Tap an element to see Z, its name, group, period, its shells drawn as rings (Z ≤ 20), valence electrons, valency, and metal/metalloid/non-metal.
  - Trend views: valency, atomic size (with NCERT's radii), metallic character, electronegativity (gradients with arrows), metals / metalloids / non-metals with the zig-zag line.
  - Highlight a group or a period.
- **periodicScene**: story pictures: CardHeap, ShopShelves, CardTriads, MusicClass, CardWall, HydrogenCard, MoseleyNumbers, QuizNight.
