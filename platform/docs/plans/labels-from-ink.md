# Plan: a label is words and what they name; the rest is the picture's

Supersedes the per-prop parts of generic-labels.md (roles, spot lists, obstacle selectors,
weights per prop). Builds on what label-placement.md measured.

## What we need

1. **Readable**: a label isn't on other words or labels, and isn't cut off by the picture's edge.
2. **Unambiguous**: it reads as its own thing's: close to it, nearer it than anything else labelled.
3. **Doesn't hide what's read**: as little as possible of the dots, numbers and lines under it.
4. **Any language, any size**: placed by its real measured size (Hindi too).
5. **Deterministic**: the same board gives the same picture, every time, however it was reached.
6. **Steady**: labels don't jump about as the student adds things.
7. **Fast**: a few milliseconds a drawing on a phone.
8. **No layout work per prop**: a prop says what the words are and what they name, nothing else.
9. **One system**: every prop, and several props in one picture.
10. **Checkable**: the drawing tool flags any label still bad, by the same measure the placer uses.

## Where we are (2026-11-03)

- **Four placers.** `@chalk/draw` `placeLabels` (greedy, sizes guessed at 0.6 em a letter; used
  by the frame's `LabelLayer`, which no live prop uses); `@chalk/draw` `useLabel` (measured,
  solved together; the coordinate plane's pair, O and Riya's name); circles' own kit and the number
  line's own stacker (parked props).
- **Per-label hand work** in the coordinate plane: spot lists (12, 9, 13), obstacle selectors
  ("text, line.cp-axis, line.cp-swap-line, circle"), gaps (8, 0 then 4, 4), O's rule for its home
  spot.
- **Two definitions of bad.** The placer counts things within a gap of a box, by kind (a word 1, a
  line 0.1, near a twentieth). The audit (label-audit.ts) counts inked letters touching. The placer
  optimises one thing and is graded on another.
- **Reading obstacles from the drawing** is built (`useLabel` without `avoid`), and off: every
  inked thing counted as much as a word, so on town-grows Riya's name kept off the house pictures
  and went across the y-axis between −1 and 1.
- **The solver** (label-solver.ts) is sound and fast: groups, exact search on small ones,
  Christensen–Marks–Shieber annealing from fixed seeds; tested against the exact optimum.

## The model

**Given**, for one picture:
- the frame (its rectangle);
- the **ink**: everything drawn, read from the picture once, each piece with its geometry and how
  dark it is;
- the **labels**: each its words (measured size) and its **anchor**, the thing it names (an
  element; a point, or later a segment or an area), and optionally a side it prefers.

**Decided**: each label's place, from **candidates generated round its anchor**: a ring of
directions at a few distances, nearest first. No lists.

**Minimised**: the sum, over labels, of five terms, and nothing else:

| Term | What it is |
|---|---|
| Ink under it | the ink its box covers, by area, each piece weighted by how dark it is; other labels are ink too, and its own anchor is not |
| Ink round it | the same in a thin band round its box, at a fraction: crowding, a word that runs into others |
| Distance | from its anchor (squared), and off its preferred side |
| Wrong owner | its middle nearer another label's anchor than its own |
| Off the picture | any part of it outside |

Five weights, one file (`label-weights.ts`), with the orders between them held by a test.

Two terms are pairwise (one label's ink under or round another's); the rest are a label's own.
That is the shape `solveLabels` already solves.

**Faint counts less**: ink is weighted by its darkness (colour and opacity), so a grid or a tint,
faint by design, costs little without anyone tagging it. `data-backdrop` stays as an override for a
background that isn't faint.

**The audit is the same cost**: it scores the drawn result with the model's terms, so a label it
flags is one the model rates bad, and every term it reports says why.

## What a prop writes

`<Label of={element or point}>(5, 2)</Label>`, or a hook doing the same on a `<text>` it draws.
Nothing about places, obstacles or weights. A new kind of anchor (a segment, an area) is one
candidate generator in the model, written once for every prop.

## What goes

Spot lists, obstacle selectors, per-label gaps, kinds and roles, O's home rule (its home is the
nearest candidate, distance 0), priorities, `placeLabels` and the frame's greedy layer (the frame
uses the one placer), and the two definitions of bad.

## Open, to be measured, not argued

- **Town-grows**: does "ink round it" keep Riya's name out of the row of axis numbers, without a
  rule for numbers?
- **Faint counts less**: does darkness rank every board's background right (the grid, quadrant
  tints, the town's roads, a stall's picture)?
- **Cost**: ink by area (and by darkness) for every candidate; a phone's budget is a few ms.
- **Steady**: labels moved per step; if too many, one more term (distance from where it was).
- **O**: at the crossing, with Riya or the dot to drag on it, does distance 0 at home keep it
  there as today?

## Proof

A prototype next to today's placer, behind a switch, run through the label audit on the chapter's
920 drawings (en and hi; 360 and 640; every witness step), against today's numbers: labels on
labels 0, on a dot or word 112, on a line 10, nearer another dot 0, drawings with a problem 100.
And the town, swap and table boards looked at, en and hi, at 360. It replaces today's only if it
is no worse on each.

## Steps

1. The model in `@chalk/draw`, pure: the ink and label types, candidates round a point, the five
   terms, the solver; tests (each term alone; the orders of the weights; the same answer twice).
2. The reader: a drawn SVG to the model's ink and labels (geometry, darkness, measured sizes),
   cached for what doesn't move.
3. The prototype on the coordinate plane's three labels, behind a switch; the audit scoring with
   the model's terms; the comparison.
4. If it holds: the plane's labels on it alone; the four placers become one; the frame's layer
   uses it.
5. One parked prop's labels on it, to show a prop writes only `<Label of>`.

## After a first-principles review (2026-11-03)

**Direction kept**: one placer, measured sizes, obstacles read from the drawing, candidates
generated round the anchor. **One part dropped: "faint counts less".** Worked from styles.css, it
brings back the town failure: across the y-axis ≈ 1.6 × 12 px at ~0.9 darkness ≈ 17; part of a
house roof ≈ 100 px² at ~0.4 ≈ 40; a road 6–16 px wide at ~0.17 also outweighs the axis. Riya
always stands among houses, so her name crosses the axis again. And area ranks words wrongly: a
number's thin glyphs cost less than a roof. The real difference is **read or decoration**, not
dark or faint: a label with its halo over a picture is harmless; over a number or an axis it isn't.

**So, instead:**
- **Costs by kind, as now**: words and dots in full, a line a little (label-weights.ts), by
  overlap, not area.
- **Decoration tagged `data-backdrop`, once per prop**, on its picture groups (houses, stalls,
  desks; the grid, tints, scene and town roads are tagged already). Not per label.
- **Needs added**: fixed words (axis numbers and names) are ink, never labels; a label stays
  upright on a turned plane; every label is placed, none dropped, the bad ones flagged; ink is
  told by the drawing, not by its colour (light and dark themes).
- **Distance** is the gap from the anchor's box edge (not centre to centre, which favours above
  and below for wide Hindi words and tall figures), and stays a **tie-breaker** under the least
  clash, as rank is now; it never trades against a clash.
- **Wrong owner** stays: two close dots can each have a clear, close spot nearer the other.
- **The audit keeps its own checks** (letters touching, nearer another dot) beside the model's
  cost: a placer graded only by its own cost can't show its blind spots.
- **O's home** ignores the words beside it today, and that is most of the 100 drawings with a
  problem: changing it is a decision for the person, not a side effect.
- **The frame's `LabelLayer` and `useFrameLabels`** have no live user: deleted, not ported, and
  `making-a-prop.md` says `useLabel`.

**What a prop still does, honestly**: draws its own `<text>` and says what it names (one hook);
tags its decoration groups once; says upright on a turned frame. Nothing about places, lists,
selectors or weights.

**Steps, cheapest first:**
1. Tag the house, stall and desk pictures `data-backdrop`. Run today's `useLabel` without `avoid`
   on the pair and Riya's name (built, off); audit. If 0 / 112 / 10 / 0 / 100 or better, the
   selectors go, with no new model.
2. Generated candidates round the anchor (8 directions, 2–3 distances, near edge at d from the
   anchor's box) instead of the spot lists; audit again. Watch "steps where a label moved".
3. Delete the frame's layer and the old `placeLabels`; circles (parked) on `useLabel`, to show a
   prop writes only the hook.
