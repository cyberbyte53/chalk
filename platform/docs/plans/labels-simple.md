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
