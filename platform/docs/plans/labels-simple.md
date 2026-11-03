# Plan: labels, simply

Supersedes labels-from-ink.md and generic-labels.md (their roles, kinds, darkness and per-prop
weights are dropped).

## The whole system, in four sentences

A label is words that name one thing in the picture; the prop says which, with one hook.
Everything drawn is something a label keeps off, except what the prop marks **coverable** (the grid,
tints, roads, pictures). Each label goes in the spot round its thing that covers least, stays
nearer its thing than any other label's, and never sits on another label; all labels are placed
together by the solver we have. Every other text stays where the prop drew it.

## What a prop does

- One hook per label: `useLabel(ref, { of: thing })` on a `<text>` it draws.
- `data-coverable` once on each group labels may sit over.
- Nothing else: no spots, lists, selectors, weights or kinds.

## What changes in the code

- `useLabel` (`@chalk/draw`): spots are generated round its thing (8 directions, 2 distances,
  measured from the thing's edge), not listed; obstacles are everything drawn but what is
  coverable, not a selector. The solver and the weights file stay as they are.
- `data-backdrop` is renamed `data-coverable`; the coordinate plane also marks its house, stall
  and desk pictures.
- The pair and Riya's name drop their spot lists and selectors.
- **O leaves the placer**: it is ordinary text the plane draws at its corner, or at one fixed
  second spot while a plotted dot or a counter is at (0, 0) (worked out from the plane's state; the
  dot waiting to be dragged and Riya don't count). O names a crossing, not an element, so it fits
  no label's "thing"; and a hook can't be a label only some of the time.
- The audit finds labels by `data-label` (what the placer placed), not by class; fixed text is
  then never judged as a label, so O beside "1" isn't flagged.
- Removed: the frame's unused label layer, `useFrameLabels` and the old greedy `placeLabels`, with
  their export (player index.ts), tests (group-view.test.tsx), and the line in making-a-prop.md
  (which then says `useLabel`). The parked circles kit imports `placeLabels`: noted for when it
  comes back.
- **Details**: `data-coverable` goes on a place's picture (`PlacePicture`), not its group, so the
  stall's name is still kept clear of. A label's gap is an option of the hook (4 by default; the
  pair keeps 8). "Nearer its thing than any other label's" is an option too, on for the pair; for
  Riya's name it is measured before it is turned on (her name sits 30–40 px from her middle).

## One choice, measured

Whether axis lines are coverable (a label crossing an axis, with its halo, still reads). Both are
measured; the person sees the boards and picks.

## Proof

The label audit over the chapter's 920 drawings, against today (labels on labels 0, on a dot or
word 112, on a line 10, nearer another dot 0, steps where a label moved 38 of 586); `changes`
says which passed boards in lessons 1–3 draw differently, and each is looked at; and the swap,
table and town boards in English and Hindi at 360. It replaces today's only if no worse.

## Steps

0. **Diagnose the earlier try first.** Done: 12 labels landed on a line only with obstacles from
   the drawing, every one Riya's name (town-grows 9, treasure-trail 3); no pair changed. Each of
   her spots on town-grows touched a house, and a house counted three times (roof, wall, door:
   three words' worth), so crossing the axis (a tenth of a word) won. On the trail, the stall
   pictures (awning, stripes, counter) did the same. Marking the pictures coverable (step 1) takes
   the cause away. Noted: a picture's pieces each count; once pictures are coverable it doesn't
   matter here, but a thing should count once if it ever does.
1. Rename `data-backdrop` to `data-coverable` and mark the pictures: no change on screen (audit
   identical).
2. Obstacles from the drawing for the pair and Riya's name. Audit.
3. O out of the placer, drawn by the plane; the audit by `data-label`. Audit.
4. Generated spots instead of lists. Audit, and `changes` for passed boards.
5. Remove the unused layer and the old placer, with their exports, tests and doc line.

## Done (2026-11-03)

Steps 0–5 built, each measured by the label audit over the chapter (618 drawings with placed
labels, en and hi, 360 and 640, every witness step):

| | Lists (before) | Now |
|---|---|---|
| Label on label | 0 | 0 |
| On a dot or word | 14 | 10 |
| On a line | 10 | 4 |
| Nearer another dot | 0 | 0 |
| Drawings with a problem | 16 | 10 |

(Placed labels only: O is fixed text now, not judged as a label.) Placing 1.3 ms a drawing
(median).

Found on the way: house and stall pictures, the axes' ticks and the target's ring are coverable
(each was the one cause of a regression). Covering a word by share (all of it worse than its
corner) was tried and made lines worse (4 → 14): not taken. Still there: "(0, 5)" covers the
y-axis's 6 on swap-the-numbers, where no spot round it is clear.

What a prop writes now: `useLabel(ref, () => ({ own: thing }))` on its label's `<text>`, and
`data-coverable` on what labels may sit over. making-a-prop.md says so.

## After the recheck: a label reads as the nearest thing's (2026-11-03)

The recheck (runs/2026-11-03-1356-self-review.md) found labels that read as something else's:
"(6, 1)" against the (5, 2) dot; "(0, −1.25)" above the axis by O, read as O's; Riya's name on
the target house, inside its ring. The audit counted none of them: need 2 (unambiguous) was
built narrowly, as "its middle nearer its own dot than any other labelled dot", and measured the
same way.

**The rule, from need 2**: a reader takes a label to name the thing nearest it, measured from
the label's edge. So for a label at a spot: the nearest thing to its box must be its own.

- **A thing** is anything drawn a label could name: a dot, a shape, a picture that isn't coverable,
  a word (O, an axis's name). Not a line (an axis, a dashed guide: a label beside a line doesn't
  read as naming it), not coverable things, not other placed labels (they are labels).
- **Nearest** is by the gap between boxes (words by their ink), not middle to middle: "(6, 1)"
  has its middle nearer its own dot but its edge against the (5, 2) dot.
- **Cost**: a spot where another thing is as near as its own, or nearer, costs `nearerAnother`
  (as now, 2: worse than covering a word). It replaces today's middle-to-middle check, and
  `isNearOwn` (on for every label: a label always names its thing).

**Undoing a patch**: the target's ring was made coverable to clear one trail regression; but a
label may cover only what the student needn't see, and the target is what she looks for. It is a
thing again. Her name then needs a spot outside the ring: **a third distance** (28 px from her
figure's edge) is added to the spots round a thing.

**The audit measures the same need**: "reads as another's" (the nearest thing to the label's
edge, among dots, shapes, words and pictures not coverable, isn't its own) replaces "nearer
another dot". It is checked by the audit's own code, not the placer's.

**Proof**: the full audit, before and after (reads as another's, on a dot or word, on a line,
drawings with a problem); the recheck's four boards looked at in English and Hindi at 360
(swap-the-numbers end, plot-from-a-table at 2 units, street-and-house at Aman's house, the trail
at a target); then the reviewer rechecks lessons 2 and 4.

**Steps**: 1. the audit's new measure, run on today (a baseline that counts what the reviewer
saw); 2. the placer's rule and the ring; 3. the third distance; each audited.

(The narration on plot-a-point#notR, "written beside her", is fixed apart: words, not labels.)

### Reviewed: the rule, corrected

**A label may cover only ground. It must sit clearly nearer its own thing than any other thing
it could be naming.**

- **Things** a label could name: what the prop marks `data-thing` (a place's picture with its
  ring, one box for the group; the crossing point), and every label's own thing (dots, swap
  circles, Riya). **Not words**: a dot on an axis has its own number 2 px away, so words would rule
  out every spot near an axis; they stay obstacles. Not lines.
- **Clearly nearer**: no other thing's gap to the label's box is less than its own thing's gap
  plus 4 px. Gaps between boxes; words by their ink. One definition, used by the placer and the
  audit.
- **Coverable is ground only**: grid, tints, scene, roads, tap areas, ticks. Pictures stop being
  coverable; a `data-thing` group counts once as an obstacle (one box), not once per roof, wall
  and door: that triple count, not the house, was what pushed Riya's name onto the axis.
- **Riya's own box** leaves out her name (it is drawn inside her group), in the placer and the
  audit.
- **No third distance**: her upper spots clear the ring already; measure first.

### Built (2026-11-03)

One refinement after measuring: **a label is read as naming the nearest thing of the kind labels
name** (another label's dot or figure, a marked point such as the crossing), not a picture or a
word: with pictures as things, "Riya" in a town read as every house's (80 cases). Pictures are
`data-picture`: one obstacle each, not coverable, not named.

The audit, 618 drawings with placed labels (the new measure; before = the rule as first written):
reads as another's 80 → 0; on a dot, word or picture 76 → 57; on a line 18; drawings with a
problem 114 → 64. The recheck's cases: "(6, 1)" and "(−1, 7)" clear. Still on something, with no
clear spot round them: "(0, 5)" (on the y-axis's 5), "(0, −1.25)" (on −4), and Riya's name at
Aman's house (top row; under her, over the target house). Most of the rest: Riya's name crossing
an axis in the walk questions and the town.

### A third ring of spots, and pruning (2026-11-03)

A third distance (28 px) for labels with nothing clear nearby: drawings with a problem 64 → 28
(36 better, none worse); the slowest solve 43 → 81 ms (swap-the-numbers' 11 labels, 24 spots each).

Is that time expected? No: the solver searched spots that can never win. **Pruning** drops a spot
whose own cost is at least its label's cheapest spot's plus the most that one could pay in
clashes (moving to the cheapest never costs more: exact), and the clash table is built for the
kept spots only. Measured on the audit's 866 real problems: p99 7.2 → 0.8 ms, the same answers to
within the side preference (no clash gained or lost). In the browser the slowest solve 81 → 26 ms.

**Exact search for every group was tried and not taken**: with pruning, ordering and a greedy
bound it was optimal and under 1 ms on our boards, but on made-up crowded boards (20 labels) it
took up to 4 minutes, and it only improved the side preference (by under 0.02). The solver stays:
exact for small groups within a step budget, annealing otherwise, both over the kept spots.
