# Reviews as a cascade

Each planning file is reviewed against the file it was made from, by a fresh agent that didn't write
it, before anything is built on it: `plan.md` against the book's concepts, `boards.md` against
`plan.md`, then lesson 1 built and shown before the rest. A fault goes back to the file where it was
decided and is followed down, never patched on a board.

## Why

What a chapter teaches is decided in `plan.md` and `boards.md`, yet today the only full review is
self-review, after the lessons are built. The runs of the maths chapter show what that costs: about 30
self-review passes found almost only mechanical faults (overflow, wrapping, labels), while the plan's
real faults (cross-streets dropped, as it "taught nothing the seating plan didn't"; the opening; the bus
board; the dot redesign) came from the person, on lesson 1 built. Some of those a review of `boards.md`
against the plan would have caught; how a prop feels needs the built board.

## How others do it

- **Backward design** (Understanding by Design, Wiggins and McTighe): desired results, then the
  evidence that shows them, then the learning experiences, each checked for alignment with the one
  before. Our files follow that order (objectives, question families, lessons and boards); what we lack
  is the check at each step.
- **Curriculum and editorial practice:** a structural edit before a line edit before a proofread; a
  pilot before full production. Our pilot is lesson 1.
- **Agent pipelines:** a fresh-context reviewer at each handover rather than self-review, and a warning:
  reviewers whose jobs overlap, or who share the author's model and reasons, agree too easily.

## The cascade

| Stage | Reviewed against | Machine checks | Reviewer judges | The person |
|---|---|---|---|---|
| `plan.md` | `source/en/concepts.yaml`, the book | its form (today's) | the right objectives: every concept taught, merged or skipped with why; story and props fit them; each family tests an objective; Hindi has a term for each objective's concepts | approves it |
| `boards.md` | `plan.md` | every item cited or skipped, citations real, every objective served (today's); every concept covered: one of its items cited by a board, or skipped | each board serves its lesson's goal; the order flows for a student; nothing the plan didn't ask for | never |
| lesson 1, built | `boards.md` | `pnpm check` | one reviewer, a checklist: does each board do what `boards.md` says; does it work (props, overflow, both languages); a short read as a student | reviews it before the other lessons are built |
| the other lessons | `boards.md` | `pnpm check` | the same | reviews them |

- **No new mapping.** Coverage is computed: each concept lists its items, and `boards.md` cites items.
  `plan.md` stays without ids, since he reads it.
- **The reviewer works from the source, not the author's reasons:** it gets the concepts and the book,
  never the author's run notes. It must walk the chapter as a student and name its weakest objective
  (or board), even when it passes the file. Where we can, it runs on another model.
- **Reviews are threads**, as today: the reviewer comments on the file (`must` or `consider`), the
  author fixes or answers, the reviewer closes. What only the person decides goes to him as `ask` on
  `plan.md` (two to four options, a recommendation first) before he approves.
- **Rounds:** a mechanical fix is rechecked until it holds. A disagreement over judgment gets one round;
  then it becomes an `ask` on `plan.md`, or, below the plan, the author decides and says so in its run.
- **Back up the cascade:** any review, at any stage, that finds a fault decided in `plan.md` or
  `boards.md` files it there; it is fixed there and followed down.
- **Not again when unchanged:** `reviewed.yaml` records each planning file as passed with the hash of
  it and of what it was reviewed against; neither changed, no new review (as `changes` does for boards).

## What changes

- `plan-chapter`: reads `concepts.yaml` first; writes `plan.md`, then the plan review, then the person's
  questions and approval; then `boards.md` and its review. The pipeline gains the concept coverage check.
- The `reviewer` agent: a brief for planning files (what each stage judges, the source to work from),
  beside today's brief for boards.
- `self-review`: one reviewer with the checklist above; coherence moves up to the planning reviews; a
  finding whose cause is in a planning file is filed there.
- `build-lesson`: lesson 1 shown to the person before the other lessons (it already says so); his
  findings on it go up the cascade first.

## Order

1. The `plan.md` review, and plan-chapter's new order; tried on science chapter 5: concepts → `plan.md`,
   reviewed, to the person.
2. The `boards.md` review and the coverage check.
3. Self-review's checklist and filing faults upward.
