# What could have changed: `changes` for the reviewer, `affected` for the fixer

Built (2026-11-01), steps 1–5. What follows is the plan as built, with what was measured.

**Changed since, on the person's word: what a reviewer saw is kept as it sees it, not at a pass.** Every `show` a reviewer makes (a board without steps: its drawing in every version; a lesson or a question family: each of its boards' drawings, drawn whole for the purpose though the answer is thumbnails; with steps: its play) is kept as what it saw, at once, whether or not the lesson is passed then; a fixer's never is, so it can't hide a change. `changes` holds a changed board to what a reviewer last saw: a review that found problems still keeps what it saw, and the next one is told what changed since. Passing only records that the boards are approved (`reviewed.yaml`): it draws and plays nothing. (Measured before this: lesson 1's pass took 56 s, drawing four boards the review hadn't shown on their own. And before a family's show was kept, every review drew lesson 1's six question families again by hand, 2.5 to 4 minutes a review: `changes` had no drawing of them to compare.)

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
- **Changed, said short:** which pieces, and what about them in the student's terms (its words, its setup, a rule), and which functions changed (`file#name`, and whether each is new since the review). Which lines ran in the review isn't recorded: it cost more than drawing, and the comparison of pictures, state and plays shows what a change did. Never the internal model's paths. The full detail is one call away (`at` the board).
- **Old and new.** The old side is what a reviewer last saw of each board: its last `show` without steps (every version) and its plays, kept as the reviewer drew them, whether or not it passed. A review can't change a board, so what it saw is the board at the review's end. The new side is the board as built now, asked of the drawing engine when `changes` runs; its cache (`draw-cache.ts`) answers when nothing the drawing is made from changed, so a board drawn since costs nothing. Nothing else is kept.
- **Drawn only where the make-up changed:** each board changed since passed, or never passed yet (a board in its first fixer↔reviewer rounds), that a reviewer has seen, drawn with `show`'s engine (the clock jumps, every version) against what the reviewer last saw: each version's text (pieces' state, problems, script) and pictures. "Its code changed; it shows the same in every version" is said so. A version drawn on one side only is a difference ("couldn't draw it now: why", "not seen in the review"), never "the same". Nothing changed: nothing drawn, an answer in well under a second.
- **Honest replays.** Each of the reviewer's plays is done again, as the reviewer asked it; its lines then and now are both written from what each drew, by today's words, so a change in wording is never a change in what it does. A step that ran then and can't now is said so: "couldn't redo this play: …: step 2: ✗ no part …". A play that can't be done at all says why; the rest go on.
- **`pass: true` is instant.** What it showed when reviewed is what the review drew: the last `show` without steps of each board in the review (the service keeps them). A board passed but never shown in the review is drawn then.

## `affected` (the fixer)

- **An edit, planned or done:** files, lines or declarations, props by address; or `diff` (since a commit) after the edit. Its pieces and boards, rolled up by `depth`, as today, on the complete base.
- Short: a line per board, the count when there are many.

## Decided

- **The review's steps are played again** on a board whose make-up changed: every `show` with steps on the jumping clock is kept beside the board's drawing, and a pass keeps this review's plays and the last review's it didn't play again, each as built now. `changes` says each play that answers differently: the first step that does, and only what differs in it, then and now.
- **Room:** what a reviewer saw (a board's drawing in every version, one file, and its plays, one file) is kept on this machine only, in `.chalk-seen/` (ignored by git, outside node_modules: a reinstall keeps it). Each file is written whole, then moved into place. The old `node_modules/.cache/chalk-shown/seen` store is read once and moved over.

## Measured (lesson 1, `two-numbers-for-a-place`)

- `changes` at the lesson, nothing kept from earlier reviews (nothing drawn): 5.6 s, about 4,800 characters (was 150 s, and up to 120,000 characters). Most of the time is reading the code graph, not drawing.
- `pass` at a board the review had shown: 2–3 s, nothing drawn.
- `changes` at a board whose reply's words changed: 14–19 s: its six versions drawn and compared (the three English ones differ, each with its pictures as passed and now, cut to the reply), and the review's walk played again ("4. tap town/walker/step:right" then and now: the reply said in other words).
- A player edit and a prop's view edit: covered by tests (every board placing it changes); on the real chapter, today's player changes show as changed on every board.

## Steps (all done)

1. **The base, right.** The views were missed because every package now registers a prop as `propModule(def, View, sound)`, which `affected` didn't read; a board's code lacked the player and the stylesheets every board is drawn with. Both in, with tests.
2. **`changes` draws with the jumping clock, only where the make-up changed,** every version, against what the review drew. `pass` keeps the review's drawings. The old one-picture comparison is gone.
3. **Answers that fit:** a changed board's content said per piece in plain words (a prop's definition copied into the record is said with the code), at most eight functions among many boards, pictures cut to what differs. `affected` already answers a line per board.
4. **Roles:** the reviewer sees `changes`, the fixer `affected`; only the reviewer passes. The self-review skill's `affected` step is gone; apply-review keeps it.
5. The review's steps kept and played again.

## Not here

- `comments` taking 16 s and answering too long for one reply: its own plan.
- Whether the reviewer runs `pnpm check`: the service knows if the build passes.
