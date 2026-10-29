---
name: self-review
description: Review a built lesson or chapter, or the boards a change touched, as a student of that class and as its teacher, before the person sees it, ideally by an agent that did not build it. Files findings and regressions as comments, fixes the mechanical ones, writes a run note. Use after build-lesson or apply-review, before asking for the person's review.
---

# Self-review

The person's review is the expensive part; this pass catches everything a fresh pair of eyes can. Run it as the **`reviewer` subagent** (`.claude/agents/reviewer.md`): an agent that did not write the lesson, holding only reviewer tools. Give it the lesson's name, or the review being applied, and nothing about how it was built. (Without subagents, a new chat whose chalk connection uses the reviewer's token.)

## Read first

`authoring/taste/reviewer.md` (the rubric) and `authoring/taste/constitution.md`. Not the builder's run notes.

## Steps

1. Run `pnpm check`; if it fails, that is the first finding.
2. `look` at the lesson (thumbnails and any problems), then at each board, in English and Hindi (`locales: ["en", "hi"]`): read every board in the pictures, not the source. Hold each board to what `flow.md` says it is for. Then play each board as a student with `play`: tap, drag, answer right and wrong, and check what each step did (what it changed, "board passed", the picture).
3. Go through `reviewer.md` board by board: as the student, as the teacher, on the screen. Put the source passage beside it.
4. Say each item where it belongs, with your `comment` tool (it writes as a reviewer): the principle, and what a student would get wrong.
   - **About a thread already there** (reviewing an applied review: its fix isn't right yet, or you checked it and it's good): **write on that thread** (`id`). The fixer must answer your words before it can mark that thread ready.
   - **A new problem** with the lesson: a new thread on its board and target.
   - **Something a thread's change broke elsewhere** (another board or piece: what the thread reaches is recorded on it, `reaches`, and `affected` with `diff: true` lists the pieces; check those boards): a new thread on the piece it broke, naming that thread's id in its words.

   When you have filed everything, hand your pass over: `comment` with `handover: true`. It becomes a review (`by: reviewer`); a later pass adds to it until the person has settled every thread in it.
5. Say which findings are mechanical (overflow, a give-away option, an undefined term, maths inside a sentence). The agent that asked for the review fixes those as a fixer (`status: "planned"`, fix, render again, `status: "ready"`); a reviewer can't move a thread. A taste decision is the person's: start it with `turn: "person"`, so it waits on them, not on the fixer.
6. Append `runs/<YYYY-MM-DD-HHMM>-self-review.md`: each lesson reviewed by its folder name (`two-numbers-for-a-place`), what was checked, fixed and still open, and a verdict: ready for the person, or needs another pass. Commit it: a committed note naming a lesson is what clears its **to self-review** mark in the Chalk tree (until the lesson changes again).
7. Reply with the open items and the verdict.
