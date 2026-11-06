# Authoring: how a chapter is made

Status: plan, reviewed once (its changes folded in). Nothing built. Replaces
`platform/docs/authoring-pipeline.md` once agreed.

## What we learned (others, and chapter 1)

- **Duolingo, Khan Academy:** people own *what* is taught; AI drafts and checks the volume. Khan: a
  person shapes the first question of a kind, the AI makes more (we already do this: question families).
  Duolingo: quality drops where checks are weak.
- **Brilliant:** the interactive is the expensive part; it goes sketch → prototype → finished.
- **Coding agents** (Spec Kit, Kiro, Claude Code, Beads): a constitution, a plan a person approves, then
  tracked work on disk ("agents only know what's on disk").
- **Frame.io, Gamma:** feedback pinned to the exact spot is what makes review fast.
- **Chapter 1** (167 threads, 18 run notes, 4 planning files each approved): the brief and outline helped;
  the other planning files weren't read; re-approving downstream files was a burden; a prop built and then
  thrown away (the stall) was the costliest mistake; the reviewer was genuinely useful (layout 24, an
  undefined term or name 17, regressions from fixes 14, taste 15, flow 12, Hindi 9, give-aways 8); pinned
  comments were the best part; 132 threads opened by the reviewer were closed by the person, unread:
  ceremony; Hindi came from memory.

## First principles

**Scarce:** the person's attention and taste; props (expensive, costly when wrong); being right against
the NCERT book in both languages. **Cheap:** an agent's writing, rewriting, reviewing, re-checking.
**Ours alone:** boards are code that plays the same every time, so a machine can check a board works, in
every language, before anyone looks.

## Five rules

1. **The person owns the what and why; agents own the how.** One gate: the chapter plan, one page.
2. **Props are designed, then built.** A new prop is sketched in the plan, then shown working on its own
   before any lesson uses it. Reuse is the default; a new prop gives its reason.
3. **Seed, then scale.** The agent writes a question family and its rows; the machine checks every row;
   the person sees the family's idea in the plan and one example in review.
4. **Machines check everything checkable before anyone looks.** A mechanical finding the reviewer makes
   twice becomes a check; every bug found becomes a saved play (`pnpm snapshot`), so it can't come back.
5. **Everything is on disk, and kept in the files that already work.**

## Settings, in layers: nearest wins

```
Chalk     authoring/settings.yaml   (with the constitution: its principles hold everywhere)
 └ book      authoring/books/<book>/settings.yaml
     └ chapter   its plan.md says where it deviates, and why        (a file only when one is needed)
```

A layer holds: **cast** (each character: name, how they speak, how they're drawn, their voice per
language), **tone**, **look**, **teaching style**, **languages**, **pacing**. The constitution's
principles can't be switched off; the rest are preferences a lower layer may change, saying why.
`authoring/voices.json` becomes the cast's voices (moving it changes every board's voice fingerprint once).
Seeded from what exists (`authoring/taste/`, chapter 1's cast, lines and look, its taste threads); grown by
wrap-up, one line at the right layer, with the person's yes.

**Terms** (en ↔ hi, as each NCERT book writes them) are a chapter's source, made from both books; a book's
list grows from its chapters'.

## A chapter, from ask to done

| # | Step | Makes | Who looks |
|---|---|---|---|
| 0 | **Book** (once) | its settings; its cover (drawn as art, shown) | the person, once |
| 1 | **Ask** | the person: "let's make this chapter" | — |
| 2 | **Sources** | both NCERT chapters (given, or fetched), `outline.yaml` (every item the book teaches), the term map | agent |
| 3 | **Plan** | `plan.md`, one page: what the book asks; the lessons, each one's idea, what the student does; the props (reuse / extend / new, sketched); the question families; any new character and its voice; deviations from the book's settings | **the person: comments, then yes** |
| 4 | **Build** | as a checklist in `plan.md`: new props first, each shown working alone; the first lesson shown, then the rest; a board list with one purpose line per board (what the reviewer holds each board to); question families and their rows; Jugnu's cases from each family's named wrong answers; art; Hindi by the term map (`languages.md`'s translate, run here, before review); every board self-checked (`show`) | agent (showings to the person, not gates) |
| 5 | **Review** | an independent reviewer plays every board, per language; findings are threads weighted **must** (the builder fixes it), **consider**, **taste** (a question, the person's turn) | reviewer |
| 6 | **Person's review** | plays the chapter; pins comments; answers taste questions; hands the sitting over ("my open comments") | the person |
| 7 | **Done** | the person's yes on the chapter, stamped like the plan's; each board's pass follows what students get (`kept-by-what-students-get.md`) | the person |
| 8 | **Wrap-up** | each correction that could recur: one settings line, at its layer | the person: yes / no |

- **The plan's yes** is a button in the editor's tree that stamps `approved:` on `plan.md`, as planning
  files are stamped today. A change the build needs after the yes is a comment on the plan carrying the
  person's yes, not a re-approval of everything.
- Rework after a comment goes back to step 4 for what it touches; the reviewer sees what changed.
- `outline.yaml`'s check stays: every item the book teaches is in the plan (constitution 11).

## Threads: the tracker we already have, three edits

Threads (`comments.yaml`, written only by the comment writer, `platform/studio/src/comments.ts`) already
pin a comment to its spot, keep what it looked like, the commit, whose turn it is, and what a fix changed
and reached. They stay, with:

1. a `weight` on a reviewer's finding: must, consider, taste;
2. **whoever opened a thread closes it** (the `MOVES` table, `comments.ts:66-80`); the doer marks it done;
3. a taste question is a thread on the person's turn (exists).

Comments on a prop stay with the prop's package (`authoring/props/<package>/`). The hand-over of a sitting
is the person's open comments, read from the threads: `authoring/reviews/` goes. Run notes and retros go:
the reviewer's hand-over is its threads. An agent's to-do list is the checklist in `plan.md`.

## Tools: what stays, what goes

| Today | After |
|---|---|
| brief, objectives, flow, props.md, each approved; the tree's gates | `plan.md` (one yes) + `outline.yaml` + the board list |
| threads | threads, with weight and opener-closes |
| reviews, run notes, retros | the threads themselves |
| `reviewed.yaml` (the reviewer's pass per board) | stays, gaining what students get |
| `show`, the editor's preview, prop panel, pinned comments, comments on a file's words | stay |
| `changes` (reviewer), `affected` (fixer) | stay |
| `pipeline` and the tree (planning-file states) | the chapter's state: plan yes? checklist left? whose turn on open threads? done? |
| 6 skills | 5: plan-chapter (2-3), build-chapter (4: props, lessons, families, Hindi), review (5), apply-comments (6), wrap-up (8) |
| `authoring/taste/` | the Chalk settings layer; each guide stays with its step's skill |

## Chapter 1 moves over

Its planning files become `plan.md` (with the board list from `flow.md`'s purposes); its outline stays; no
open threads to move (163 closed, 4 withdrawn). Its taste seeds the Chalk and book settings. The Hindi NCERT
chapter is fetched and the term map made from both. The constitution is checked once against chapter 1's
threads: which should a principle have prevented? Those principles get sharper.

## Order

1. Approval by what students get (`kept-by-what-students-get.md`, reviewed).
2. Languages (`languages.md`): Hindi is made by it.
3. Thread edits: weight, opener closes, hand-over from open comments.
4. `plan.md` (with outline and board list), the five skills, `pipeline` and the tree cut down.
5. Chalk and book settings, seeded from `taste/` and `voices.json`.
6. Chapter 1 moved over and re-reviewed; then the next chapter made this way.

Later, when a second book needs it: props stop naming characters (with `languages.md` step 3, which
rewrites the walker's words anyway).
