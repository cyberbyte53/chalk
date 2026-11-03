# Plan: placing a plane's labels together, measured against today

## Before: what runs today

"Before" is the working tree's greedy code (the swap-line avoidance and nearer-another-dot cost
in `DotLabel`, O's narrowed `onIt`), committed first, so the baseline is the best greedy we have,
not `HEAD`.

Three labels on a coordinate plane are each placed on their own, by `placeClear`
(`library/props/coordinates/src/place-clear.ts`), from a `useLayoutEffect` in its own component:

| Label | Where | Spots tried |
|---|---|---|
| A plotted dot's pair, "(5, 2)" | `DotLabel`, `plotting-view.tsx` | 12 around the dot |
| O at the crossing | `OriginName`, `plane-view.tsx` | its own spot, else 8 |
| Riya's name | `walker-view.tsx` | 13 around her |

Each label takes the **first spot that touches nothing**, else the least bad one. It measures
in the DOM for every spot it tries: it writes x and y, then reads `getBoundingClientRect`, which
forces a layout each time. Labels are placed in whatever order React runs the effects, and a
label placed early can take the only spot a later one needed. Nothing is ever reconsidered. This
is a greedy algorithm with no fixed order.

On swap-the-numbers at 360 (nine dots, six dashed swap lines), and on the table board at 2 units,
labels end up on dashed lines, on an axis number, a square from their dot, or nearer another dot.
These are threads cmvzg5kxlof1 and cmvzg68ept2b. A draft `placeInOrder` (greedy, with memory) is
in `place-clear.ts`, unwired. This plan replaces it.

## After: what changes

**One pass per plane, for every label on it** (dots' pairs, O, Riya's name), in three steps:

1. **Measure once.** Each label's size, and the fixed marks it must keep clear of (dots, axis
   lines, dashed swap lines, the axes' numbers, the counters). Boxes are in the plane's SVG
   coordinates (`getBBox` and `getCTM`), not the screen's, because `upright()` can turn the plane
   and Riya's name sits in a moved group. **Each label keeps its own obstacles and gap**, as today:
   O only what stands on it (gap 0), Riya's name the words, axes and drop lines, a pair everything
   (gap 8). One shared rule would move O and Riya on passed boards in lessons 1–3. This is about 20–60 reads of
   `getBoundingClientRect`, then the label spots are worked out from the sizes with no further
   reads.
2. **Solve, as a pure function.** `placeLabels(problem) → layout`, with no DOM, no `Math.random`
   and no memory: the same input always gives the same output.
3. **Write once.** Each label's x, y and anchor, or `display: none` with `data-dropped`.

**The solver** is the method measured in the benchmarks below:

- **The cost** of a layout counts:
  - each overlap: label on label, label on a mark, or a label within the gap of either;
  - a label nearer another dot than its own;
  - a label off the plane;
  - a hidden label;
  - the spot's preference, weighted 1/(n·K) per rank step, so the preferences of all labels
    together stay under one clash and untangling a clash is always worth it. (The benchmarks gave
    each label k/8, which could add up to more than a clash; they are re-run with this weight.) The order is the cartographers': upper-right, upper-left, lower-left,
    lower-right, above, right, below, left, then farther out. O and Riya keep their spots'
    order.
- **Groups.** Labels whose spots can never touch don't affect each other, so the board splits
  into independent groups:
  - a lone label takes its best spot;
  - a group of up to 9 is solved **exactly** (branch and bound: the proven best);
  - a bigger group uses **simulated annealing exactly as Christensen, Marks & Shieber (1995)
    specify**: random start, Metropolis acceptance, T set so a cost rise of 1 is accepted with
    probability ⅔, 20n moves per stage, ×0.9 per stage, the next stage after 5n accepted moves,
    at most 50 stages, a stop at a stage with nothing accepted;
  - with **5 runs from fixed seeds** (mulberry32), keeping the best, and ties going to the lower
    seed;
  - stopping early when a layout reaches the floor (every label on its own best spot, nothing
    clashing).
- **Neighbour lists** precompute, for each label and spot, the spots of other labels it clashes
  with.

**Moving parts aren't obstacles.** The dot being dragged and Riya while walking don't count, and
their labels are placed when they stop. So nothing re-solves while a finger moves.

**When it runs:** the player draws a plane's layers as separate components, and only the
changed ones redraw, so there is no single effect on "the plane". Instead:
- each label **registers** with a per-plane placer (by the plane's SVG) in its own
  `useLayoutEffect`, and unregisters when it goes;
- the placer solves all registered labels **once per frame**, before paint;
- again when fonts finish loading (`document.fonts.ready`), because Hindi changes the sizes;
- and only then is the board settled for the drawing tool.

**Stability.** When a dot is plotted, the old labels may move if a better layout needs it. This
plan doesn't add a cost for moving. The comparison below counts how many labels move per new dot,
before and after, and a movement cost is added only if that number is bad.

**Main thread or workers.** The solver is a pure function, so it runs on the main thread or in a
Web Worker with the same code.

- **A. Main thread**, wired into the player: placed before the first paint, so nothing jumps.
- **B. A pool of 5 workers** (the 5 runs in parallel), measured **on the real problems**, not
  wired into the player yet. The audit saves each drawing's placement problem (the measured boxes)
  as JSON; a Chrome page times `placeLabels` on all of them on the main thread and through a warm
  pool of workers, same answers checked. B goes into the player only if the person chooses it from
  those numbers. Wiring it needs a busy hook so the drawing tool waits for the reply
  (`runtime.busyWith`), and the labels hidden until it comes; there is no CSP, and Vite bundles a
  `new Worker(new URL(…))` file.

## The comparison: before against after

Everything is measured by **one audit that knows nothing about either algorithm**. It reads the
drawn page, so the before and the after are judged the same way.

### 1. The audit (new, in the drawing tool)

On each drawing, for every label on a plane (`text` in `.cp-dot`, `.cp-origin`, the walker's
name), from the boxes as drawn:

- **overlaps:** label on label, label on a dot or mark that isn't its own, label on a line;
- **far:** nearer another dot than its own;
- **off:** outside the plane;
- **hidden:** `data-dropped`, a label that couldn't fit;
- **distance:** from the label's middle to its own dot's, and which side it is on (above, below,
  left, right). Spot numbers can't be compared, as before and after have different lists.

Hidden labels are found from the page (computed `display: none`, or an empty box), not from
`data-dropped`, which only the new code writes. They are counted apart from overlaps, never
summed: a missing pair is worse for a student than a touch.

**Time, the same way for both:** a script added to the page before it loads (`addInitScript`)
counts `getBoundingClientRect` and `getBBox` calls, and a Chrome trace times the layout effects of
each drawing, wherever they run. The audit waits for fonts on every read, picture or not.

### 2. The boards

Every board that draws a plane in lessons 1–4 of coordinate-geometry:
- **every version** (each piece), **en and hi**, at **360 and 640**;
- and the **witness end states**, which hold the most dots.

And at each plotting step of the swap board and the table board (plotted dot by dot), to count
**how many labels moved** when one dot arrived.

### 3. Before, and after

- **Before:** the committed code (`HEAD` today), drawn from a git worktree.
- **After:** the new code, run twice: A (main thread) and B (workers).
- The same audit runs on all three.

### 4. The numbers that come back

One table per board group, and totals:

| | Before | After A | After B |
|---|---|---|---|
| Overlaps, far, off (sum over all drawings) | | | |
| Hidden labels | | | |
| Drawings with any problem | | | |
| Distance to own dot (median, worst) | | | |
| Labels moved per new dot (median, worst) | | | |
| Placement time per drawing (median, worst) | | | |
| Forced layouts per drawing | | | |

And **pictures side by side** (before | after) at 360, en and hi: the swap board with nine dots,
the table at 2 units with both tables, and every drawing where the counts differ.

### 5. Against the best possible

The synthetic benchmark (20 labels, phone-sized and crowded, 20 boards each) is a rough model (one
box size, 8 spots, no lines); the real check is section 4, on our boards. It also gets a
box-model copy of today's algorithm, so the three are compared with the proven optimum:

Each row says how many boards the exact search could prove (a board it couldn't is left out, and
said).

| | Optimum found | Worst miss | Time |
|---|---|---|---|
| Today's (greedy, effect order) | | | |
| Greedy, cartographers' order | | | |
| New solver | | | |

The benchmark lives in `library/props/coordinates/bench/` and is kept as a test: the solver must
reach the proven optimum on ≥ 90% of the phone-sized boards, and never miss by a clash.

### 6. Timing on a real phone

Chrome's CPU slowdown doesn't slow workers, so it can't compare A and B. The real numbers for both
come from an Android phone over USB (Chrome remote debugging). If none is at hand, the Mac's
numbers are given, saying so.

## Steps

1. Commit the working tree's greedy fixes (the baseline). The audit in the drawing tool, and its
   `before` run. Commit the audit.
2. `placeLabels` as a pure function, with tests: determinism, the paper's schedule, the bench
   against the optimum.
3. The per-plane placer (A), wired in. Remove `placeClear`'s three calls and the draft
   `placeInOrder`.
4. The worker timing (B) on the saved problems.
5. Run the comparison: tables and pictures to the person.
6. The person chooses A or B; the other is removed. Commit.
7. Fix threads cmvzg5kxlof1, cmvzg68ept2b, cmvzmrhbjhcb with the new placement; recheck lesson 4.

## Risks

- **Same picture every time.** The input is the measured boxes. If a font hasn't loaded, the
  sizes differ. The drawing tool waits for fonts, and so does the placement.
- **Passed boards change** (lessons 1–3 have O and Riya's name). `changes` will show which ones
  differ; each is looked at.
- **Workers in the player:** a Blob URL worker needs the page's CSP to allow it (`worker-src
  blob:`), and the studio's and learner's builds must bundle the worker file.
- **Hidden labels:** a label hidden for good has no tap to show it yet. The audit reports each.
- **Cost on a phone:** see 6.

## Results (2026-11-03)

Built as above, with two changes found while measuring:
- **Each label keeps today's spots and today's weights** (a word or dot 10, a line 1, nearer
  another dot 20, off the plane 1000; another label counts as a word). Only the algorithm differs,
  so the comparison measures the algorithm. The cartographers' order is not used yet.
- **Near is not on.** At first the solver counted "within the gap" the same as "on top", and came out
  worse than today (8 labels on labels, 149 on words): when every spot was near something, it chose
  by rank and took a real overlap. Now overlapping letters (their ink) cost in full and only near
  costs a twentieth (NEAR = 0.05). A quarter was tried first: then near a word (0.25) cost more
  than across a line (0.1), and Riya's name in Hindi crossed the axis at 3 trail steps. Near must
  cost less than any overlap.

The audit, every plane board of coordinate-geometry (lessons 1–4 and the questions; each board's
start in en and hi at 360 and 640, each witness step in en and hi at 360): 920 drawings, 1632
labels.

| | Before (greedy) | After (together, NEAR 0.05) |
|---|---|---|
| Label on label | 4 | **0** |
| Label on a dot or word | 134 | **112** |
| Label on a line | 54 | **10** |
| Nearer another dot | 4 | **0** |
| Off the plane, hidden | 0, 0 | 0, 0 |
| Drawings with any problem | 104 | **100** |
| Riya's name with a problem | 2 | **0** |
| Distance to own dot, px (median / worst) | 13 / 42 | 13 / 43 |
| Steps where a label moved | 42 of 586 | 38 of 586 |
| Placing per drawing, ms (median / worst) | 2.4 / 157 | 1.4 / 96 |
| … of which solving (median / worst) | – | 0.0 / 30 |

Most drawings still with a problem are O beside an axis's number at its own corner (O's home
spot keeps clear only of what stands on it, as before), the same before and after; and "(0, 5)"
on the y-axis's "6" on swap-the-numbers, where none of its 12 spots is clear.

**Time is the page's, not the solver's.** Placing time is mostly the browser laying the page out
when the first box is read; the solving itself is a tenth of a millisecond for most drawings.

**Workers (B)**, timed (with NEAR 0.25) in Chrome on this Mac on the 938 problems the drawings solved, one thread
against a warm pool of 5 workers sharing the 5 seeds, put together by `bestOf`:

| Labels | Problems | One thread (median / p95 / worst) | 5 workers (median / p95 / worst) |
|---|---|---|---|
| 1–2 | 777 | 0.0 / 0.1 / 0.2 ms | 0.1 / 0.2 / 6.7 ms |
| 3–8 | 149 | 0.1 / 0.2 / 2.0 ms | 0.3 / 0.7 / 2.6 ms |
| 9–12 | 12 | 5.8 / 17.8 / 17.8 ms | 5.3 / 10.3 / 10.3 ms |

The same answer on 938 of 938. Workers help only on the 12 problems with 9–12 labels, and only
their worst case.
