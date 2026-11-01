# What could have changed: `changes` for the reviewer, `affected` for the fixer

Plan (2026-11-01). Steps 1–4 built; 5 (replaying the review's steps) next.

**Goal:** each role asks the one question it has about what changed, gets a right answer that fits in one reply, in seconds; nothing is drawn unless something could have changed.

## How they are used (every saved session: 33 `changes` calls, 25 `affected`)

**`changes`, by the reviewer:**
- At the start of each review, "what do I look at?" (17 calls); the boards it named were looked at next. 6 answers were too long to arrive (87,000–120,000 characters, mostly fine detail: `model › given › desk › places › canChooseTarget: removed (was false)`) and were read back from a file. 1–6 s when it drew nothing, 38–158 s when it drew.
- At the end, `pass` (16 calls), mostly a board at a time, 40–177 s each: every board drawn again at real time (it never got the jumping clock), each pass waiting on the last. Today a lesson of five boards takes ~150 s to ask about.
- A fixer passed boards too (2 calls): passing is the reviewer's.

**`affected`:**
- By the builder or fixer, before changing shared code: "what will this touch?" (a prop's view, `dice.ts#throwOf`); and after, whether it reached more than planned.
- By the reviewer, `diff: HEAD~1` after a fix, because the self-review skill says to: what `changes` since the review already shows.
- Browsing which boards use a prop (one reviewer, 9 calls): what `show` at the prop's address answers.
- Fast (1–4 s), answers that fit. **But wrong:** "reaches nothing built" for `view.tsx#WalkerDraw`, `#StillDraw`, `#longestWalkWords`, which draw on every coordinate board. A prop's view and the player are found by a prop's type, not by an import, so the code graph doesn't reach them; the picture comparison in `changes` was added to make up for it.

## The needs, by role

| Who | When | Question | Must be |
|---|---|---|---|
| Reviewer | start of a review | what changed since I reviewed, board by board? | short, in the student's terms; never wrongly "unchanged" |
| Reviewer | end of a review | these are reviewed | instant |
| Fixer / builder | before an edit | what will this touch? | never wrongly "nothing" |
| Fixer | after an edit | did it reach more than I planned? | the same question, from the diff |

So two tools, one per role, on one base. The reviewer sees `changes`, the fixer `affected`; only the reviewer passes.

## The base: what a board is made of, complete

A board is its content (the board record) and the code it runs. The code graph's roots today are the lesson code and the props it places, through their imports. It must also reach what is found by a prop's type (its view, its styles) and what every board runs (the player, the app's stylesheets). A change there then reaches every board using it, as it can: never "nothing". (Step 1 finds exactly why the views are missed.)

## `changes` (the reviewer)

- **At an address, since each board's review.** Each board: unchanged, new, gone, or changed.
- **Changed, said short:** which pieces, and what about them in the student's terms (its words, its setup, a rule), and which functions changed (`file#name`, whether they ran in the review). Never the internal model's paths. The full detail is one call away (`at` the board).
- **Drawn only where the make-up changed:** each such board drawn with `show`'s engine (the clock jumps, every version) against what it showed when reviewed: each version's text (pieces' state, problems, script) and pictures. "Its code changed; it shows the same in every version" is said so. Nothing changed: nothing drawn, an answer in well under a second.
- **`pass: true` is instant.** What it showed when reviewed is what the review drew: the last `show` without steps of each board in the review (the service sees them, as it sees what ran). A board passed but never shown in the review is drawn then.

## `affected` (the fixer)

- **An edit, planned or done:** files, lines or declarations, props by address; or `diff` (since a commit) after the edit. Its pieces and boards, rolled up by `depth`, as today, on the complete base.
- Short: a line per board, the count when there are many.

## To decide

- **Replay the review's steps.** If the service keeps each `show` call with steps made in a review, `changes` can call them again on a board whose make-up changed and say which step now answers differently ("step 3: readout was (4, 7), now (7, 4)"): behaviour, on the paths someone reviewed. Recommended; a few seconds per changed board.
- **Room.** What a board showed when reviewed, every version, comes to a few MB per board, on this machine (`node_modules/.cache`), made again by the next review.

## Steps

1. **The base, right.** Why the views and the player aren't reached; make them roots. Tests: an edit to a prop's view reaches every board placing it; a player edit, every board; a lesson edit, only its boards.
2. **`changes` draws with the jumping clock, only where the make-up changed,** every version, against what the review drew. `pass` instant. The old one-picture comparison goes.
3. **Answers that fit:** changed boards in the student's terms; `affected` a line per board.
4. **Roles:** the reviewer sees `changes`, the fixer `affected`; only the reviewer passes. The self-review skill drops its `affected` step; apply-review keeps it.
5. If agreed: the review's steps kept and replayed.
6. Measure, on lesson 1: nothing changed; one board's words changed; a prop's view changed; a player change.

## Not here

- `comments` taking 16 s and answering too long for one reply: its own plan.
- Whether the reviewer runs `pnpm check`: the service knows if the build passes.
