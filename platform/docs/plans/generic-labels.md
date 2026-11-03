# Plan: one way to label anything in a picture

Every prop that draws will need labels: a dot's pair, a point's name, an axis's name, a length on
a side, a graph's equation. Today there are two half-systems; this plan makes one, so a prop says
what a label names and nothing else.

## What exists

**1. The frame's label layer** (`platform/packages/player/src/frame.tsx`, with `placeLabels` in
`platform/packages/draw/src/labels.ts`). Built for exactly this: every part drawn in one frame
hands in its labels (`useFrameLabels`), and the frame places them all in one pass, "so labels from
different children never collide". `making-a-prop.md` tells prop authors to use it. A label names a
point (`at`), with a preferred direction and a priority; spots are generated, a ring of 16
directions at 3 distances, and the cost grows with the turn from the preferred direction and the
distance out. **No live prop uses it.** Its limits:
- **Greedy**, in priority order: the first label takes the spot a later one needed.
- **Text sizes are guessed** (0.6 em a letter), wrong for Hindi and for proportional fonts.
- **Obstacles are only what parts hand in by hand** (segments, circles, boxes), not what is
  drawn: a part that forgets an axis, its labels land on it.
- Only points can be labelled.

**2. The coordinate plane's placer** (`library/props/coordinates/src/place-labels.ts`,
`label-solver.ts`; platform/docs/plans/label-placement.md). Measures real sizes once, solves all
of a plane's labels together (exact on small groups, Christensen–Marks–Shieber annealing, seeded),
writes once, and is measured by the label audit: against greedy over 920 drawings, labels on labels
4 → 0, on lines 54 → 10, nearer another dot 4 → 0. Its limits:
- **Spots are written by hand** in each label (12 for a pair, 9 for O, 13 for Riya's name).
- **Obstacles are CSS selectors** per label ("text, line.cp-axis, circle").
- **Only the coordinate plane** can use it.

Each has what the other lacks: the frame has the right place and the generated spots; the plane's
placer has real sizes, the solver and obstacles read from what is drawn.

## The design: the frame's layer, with the plane's engine

**One door: `useFrameLabels`.** A part on a frame hands in its labels as now. A label says:
- **what it names**, in model units: a point (`at`), a segment (`along`), or an area (`in`);
- its words, and optionally: a preferred direction, a priority (only to break ties now), its class
  and its part name (what is read, as now);
- **what it may touch**: its own thing always; a part that draws the named thing tags it
  (`data-label-of="<label id>"`) so it isn't an obstacle to its own label.

**Spots come from what it names** (no lists by hand):
- a point: the ring the frame already makes, 16 directions × 3 distances; cost from the turn and
  the distance (squared), so nearer and in the preferred direction is better;
- a segment: beside it on either side, at its middle first, then towards its ends;
- an area: inside at its middle, then towards its corners.
The cost of the spot itself is under the cost of the least clash (as now), so the solver always
trades a less preferred spot for one clash fewer.

**Obstacles are found, not listed.** After the frame's parts have drawn, the layer reads the
frame's SVG once: every word, line, shape and stroke is an obstacle, except
- what is tagged background (`data-backdrop`: the grid, a tint),
- what is moving (`data-moving`, set while dragged or walking),
- the label's own thing (`data-label-of`).
Lines and paths are read as segments (a path sampled along its length), shapes and words as boxes,
words by their ink (as the audit). A part may still hand in obstacles it doesn't draw.

**Measured, solved, written.** The layer draws each label's text, measures each once (`getBBox`),
works out every spot's box from that, solves (`label-solver.ts`, moved to `@chalk/draw`, pure and
tested), and writes the places, before the frame is painted; again when fonts load. A label that
can't go anywhere clean takes its least bad spot; none is hidden (as now).

**Fixed labels stay plain text** drawn by their part (axis numbers, a stall's name): they are
obstacles like any other word.

**Exceptions as costs, not code.** O's rule ("stay at the crossing unless something stays on it")
is a label whose first spot ignores words (`home: { ignores: "words" }`) and costs nothing, and
whose other spots cost a step each. Open: whether more such rules appear; if each prop needs its
own, the design is wrong.

## What moves

| | Today | After |
|---|---|---|
| `@chalk/draw` `placeLabels` (greedy, guessed sizes) | used by the frame | replaced by `label-solver.ts` and spot generators |
| frame `LabelLayer` | draws at guessed places | measures, reads obstacles, solves, writes |
| `FrameLabel` | a point | a point, segment or area; `home`; own-thing tag |
| coordinates `place-labels.ts` | the plane's own placer | removed; the pair, O and Riya's name use `useFrameLabels` |
| the label audit | reads `.cp-dot > text`, `.cp-origin`, `.cp-walker-name` | reads `[data-label]`: any prop's placed labels |

## Proof

- **The chapter's audit doesn't get worse**: coordinate-geometry, every drawing, against today's
  run (labels on labels 0, on lines 10, nearer another dot 0, drawings with a problem 100).
- **Spot generators and the solver tested in `@chalk/draw`**: a point, a segment, an area, each
  alone and crowded; the solver against the exact optimum on small boards; the same input twice,
  the same answer.
- **A second prop**: one parked prop with labels (`library/props-later/props/number-line` and
  `circles` place their own today, with `placeLabels` or a kit of their own) moved to
  `useFrameLabels`, drawn and audited, to show a prop gets labels by writing only that.
- Pictures before and after of the swap board and the table board at 360, en and hi.

## Risks

- **The frame draws the labels, not the part.** Today a pair's text sits in its dot's group; after,
  in the frame's label layer (on top). Its part name and `shows` move with it; the witness driver
  and the audit find labels by tag, not by where they are in the SVG.
- **Reading obstacles from the page** depends on parts tagging background and moving things: a
  grid not tagged becomes an obstacle everywhere. The audit catches labels pushed far out; a check
  that every frame's grid is tagged could too.
- **Paths sampled** cost time on a frame with long curves; measured, capped.
- **Passed boards change** (lessons 1–3: O, Riya's name). `changes` shows each; each is looked at.
- **Moving parts:** placing runs on each drawing of a walk; 1–3 ms now, measured again.

## Steps

1. The solver and spot generators in `@chalk/draw`, with tests (point, segment, area).
2. The frame's layer: measure, read obstacles, solve, write; `FrameLabel` grows `along`, `in`,
   `home`; background and moving tags on the coordinate plane's grid, drag dot and walker.
3. The coordinate plane's three labels move to `useFrameLabels`; its own placer is removed.
4. The audit reads `[data-label]`; the chapter's audit run against today's; pictures.
5. A parked prop's labels drawn and audited.
6. `making-a-prop.md`: labels, in a paragraph.

## After an independent review (2026-11-03)

Build, with these changes. The frame is the right place; its plumbing, turned planes, the three
labels' differences, and what a page read would catch were underrated.

**The frame's plumbing first.**
- One labeller per slot today: `labels()` replaces the slot's labels (frame.tsx:126), so with a
  `DotLabel` each, the last dot wins. Labels are stored **per hook**, removed in its cleanup; a
  label whose part goes (Riya hidden while her slot stays) goes with it.
- Placing runs during render (frame.tsx:215). It moves to a layout effect that measures, solves
  and writes, with the problem cache and the font reload, as `place-labels.ts` does now.
- **Turned and moved planes:** O sits in a translated, rotated group and is kept upright. A label's
  position comes from the named element as drawn (its screen matrix), not from `px.toPx`.
- The engine also works in a bare `Stage` (circles draws there, not in a `FrameStage`).

**Where the label is drawn stays with its part, for now.** Moving every label into the frame's
layer changes z-order (pairs over the dot being dragged), part boxes (Riya's name leaves the
walker's), part order in `describeView`, and the styles keyed on `.cp-dot text`. So a part keeps
drawing its own `<text>` and hands its element to the frame, which places it. The frame's own
`<text>` drawing is kept for parts that don't draw one.

**Today's spots and rules, as presets, before anything generated.** Generated rings don't
reproduce today's order (diagonals first, then above), anchors (start/middle/end on the
baseline, not a centred box) or Riya's spots round her figure; and 48 spots instead of 12 push
groups past the exact search into annealing. So step 3 moves the three labels as they are: their
spot lists, gaps (pairs 8, Riya 4, O 0 then 4), obstacles, and **nearest its own thing** (generic:
nearer its own labelled thing than any other). It must give the same audit (0 on labels, 10 on
lines, 0 nearer another dot, 100 drawings with a problem) and move no passed board. Generators
come after, each measured.

**O's rule is not "home ignores words".** O's first spot ignores everything but what stays on the
crossing (counters, plotted dots), with a gap of 0; and the dot waiting at O isn't "moving". So O
keeps its own obstacles per spot, as now (`avoid(spot)`), not a generic `home` flag. If a second
prop needs the like, it becomes generic then.

**Obstacles from the page: opt in, not out.** Taking everything drawn would catch the plane's
full tap rectangle, invisible hit shapes, quadrant tints, the town's streets, the route, stall
pictures and the layer's own texts. So: only ink (a fill or stroke that shows, opacity above 0),
never `[data-does]` hit areas or labels. Fixed obstacles are read once and cached; only what moves
is read again (a walk redraws every step; the worst placing is 96 ms today).

**The audit generalises too:** labels by `data-label`, their own thing by `data-label-of`,
lines and marks by kind, not by the plane's classes.

**Segments and areas wait** for the first prop that needs them (circles' side lengths).

**Steps, in this order:**
1. The frame's plumbing: per-hook labels with cleanup, several labellers in one slot, placing in a
   layout effect, the screen-matrix position; tests for each.
2. The solver to `@chalk/draw`, with its tests (the bench against the exact optimum; same input,
   same answer; the cache).
3. The pair, O and Riya's name to the frame with today's presets; the audit the same, no passed
   board moved; `place-labels.ts` removed.
4. Obstacles read from the page (ink only, cached), replacing the per-label selectors; the audit
   no worse.
5. Spot generators for a point, then "beside a box" (Riya), each measured against the presets.
6. Circles, with labels on a segment, in a bare `Stage`.
7. `making-a-prop.md`, and the audit by `data-label`.
