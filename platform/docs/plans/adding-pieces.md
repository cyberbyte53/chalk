# Adding a piece leaves every old board as it was

Status: plan, reviewed once (changes from the review folded in). Nothing built.

## The goal

The library grows by adding: a new piece on the coordinate plane, a new prop. Two things must hold:

1. **Adding is easy:** new code plus one entry, no old line edited.
2. **Adding can't change an approved board, and the system knows it for certain:** an approved board that doesn't use the new piece stays approved, without anyone looking and without a replay.

A real change to shared code (bigger numbers, a label moved) is meant to reach old boards. For those, the approval follows **what the student gets**: replay what was approved; only boards that come out different go to the person, grouped.

Example: Aman's house (lesson 1) uses places, clues, walker, reading. Adding parabola must leave it approved with nothing to check. Making the plane's numbers bigger comes to the person as one question.

## Where we are

- `coordinate-plane.ts` names every piece by hand: `children`, `show`, `isAlone`, `layout.children`, and six layout orders (`above`, `back`, `on`, `front`, `below`, `controls`, lines 92-104), plus the `describe` sentence.
- Also per piece, elsewhere: the drawing map in `view.tsx` (`CoordinatePlaneView`), sound cues (`sound.ts:10-17`), re-exports in `index.ts`, configs in `seen.test.ts`, the README and the catalogue.
- `styles.css` and `words.ts` hold every piece's styles and words.
- Approval (`platform/studio/src/reviewed.ts:170`, check at 184-186) keeps a board approved only when content **and code digest** are the same. The digest (`reach/board-code.ts`) roots on every export of every prop package placed, plus the package stylesheet, the player and shared stylesheets. A graph node is a top-level declaration, fingerprinted with everything it uses (`reach/graph.ts:6-8, 88-97`); a stylesheet is its whole text (`graph.ts:343-355`). So any edit in `library/props/coordinates` marks every coordinate board changed.
- Already sound: each piece is off at its start (`isParabolaOn`: `zeroes !== null`, …). The parabola addition did leave old boards the same; the system couldn't tell.
- Already built: `changes` at any address, chapter included (`mcp/tools.ts:520-540`), replays what a reviewer last saw (`.chalk-seen/`) and compares text first, then pictures (`reach/shown.ts:252-301`).

## The plan

### 1. Pieces as entries, each its own declaration

- Each piece has one entry, its **own top-level declaration** (so the graph fingerprints it alone): its prop, its `isOn`, whether it takes taps, its rank in each layout place it draws in, its drawing, its sound cues, its describe sentence.
- The host's `children`, `show`, `layout.children`, the six orders, the drawing map, the sound cues and `describe` are all made from the list of entries. Order within a place is by each entry's rank there (no single order fits all six today), so a new piece picks its ranks and no old line moves.
- Where a piece draws is not repeated in the entry: `groupView` already reads it from the piece's drawing (`group-view.tsx:125-129`).
- The host still decides how pieces meet (its `hear` rules, the facts it passes down); pieces still know nothing of each other. Not the old layers (4cbe4b6b).

### 2. Rules say "for each piece that's on and used"

- `isAlone`: no used piece that is on takes taps. The places' exception (places no one can choose leave taps to the plane) lives in the places entry.
- Host facts about one particular piece (the places' target, the plotting's scale) stay as they are.

### 3. Each piece's words and styles on their own

- Words: each piece's words block its own declaration (same file is fine).
- Styles: each piece's stylesheet its own file. A check: every rule's subject (its last class) and every `@keyframes` name carries the piece's prefix. Today's crowd styles (`.cp-person`, `.cp-firefly-*`, `@keyframes cp-glow`) get renamed to pass.

### 4. Which pieces a board uses: a plain fact from its setup

"Used" = the keys of the plane's `with` in the board's placement: the setup, already recorded in `reviewed.yaml`, and `town()`, `classroom()`, `notebook()` already name their pieces.

- Every piece is still made at its start (no optional types, no fallbacks).
- A piece not used on a board is never shown, the generic rules skip it, and its actions are refused (one check where actions are routed).
- A test: every piece's start is off.
- A board that acts on a piece without giving it a setup adds `piece: {}`; the build finds those.

Why it's certain for an addition: the old board's own code can't name a piece that didn't exist when it was written; the learner can't press a piece that isn't drawn; the host can't act on it. Being a plain fact in content, not a proof about reachable states, it avoids what sank the layer cut (d88cf437 built it, cbd66988 dropped it because the proof kept growing). Said openly because it is the same question asked once before: this time "used" is read, never worked out.

### 5. The digest counts only what a board uses

In `board-code.ts`, a named root filter: for a package whose prop has entries, the roots are the host's own declarations **minus the entry list and the maps made from it**, plus the entries of the pieces the board uses (each reaching its piece's code, drawing, words and stylesheet). The package stylesheet stops being a root; each used piece's stylesheet is.

Adding parabola then changes only: new declarations and a new stylesheet (not reached by Aman), and the entry list (cut from the roots). Aman's digest is unchanged, so `changesUnder` says "unchanged". Certain and instant.

### 6. Real changes: kept by replay only when nothing could differ

When a board's content is the same but its digest changed, `changes` replays what the reviewer saw. The approval moves to the new digest on its own only if **all** of these are identical:
- the text record, with no leniency for new state fields (`shown.ts:270-279` lets them through today);
- every picture, byte for byte (today's pixelmatch at threshold 0.1, `shown.ts:328`, lets small colour shifts through);
- a picture at each play step (today plays keep text only, `shown.ts:91-104`).

Anything else goes to the person. Known blind spots, said in the answer: motion and timing on the jumping clock, sound cues, versions and screens nobody showed. Recorded in `reviewed.yaml` as kept by replay (commit, what was compared). A board with nothing in `.chalk-seen/` counts as changed.

### 7. One look over everything, grouped by what changed

`changes` at a book or chapter address after a library change: how many boards stayed approved (by addition, by replay), and the rest **grouped by the set of changed functions** (already worked out at `reviewed.ts:189-192`), one before/after per group; one yes passes a group.

## Order

1. Steps 1–3 on the coordinate plane. Every board must come out identical: `changes` on the whole chapter before and after, by hand.
2. Steps 4–5.
3. Steps 6–7.
4. Other prop packages only when one next needs a piece added.

## Not in this plan

- The learner side: `versionBoard` (`content/build.ts:468`) also changes on any package edit. Same idea fits, later.
- Freezing what real students see. For when there are real learners.
- Paths nobody played. Every bug the person finds becomes one more saved play.
- The promo branch's crowd and parabola stay on `promo`.
