---
name: self-review
description: Review a built lesson or chapter, or the boards a change touched, as a student of that class and as its teacher, before the person sees it, ideally by an agent that did not build it. Files findings and regressions as comments, fixes the mechanical ones, writes a run note. Use after build-lesson or apply-review, before asking for the person's review.
---

# Self-review

The person's review is the expensive part; this pass catches everything a fresh pair of eyes can. Best run as a separate agent (a subagent or a new chat) that did not write the lesson. Give it the lesson's name, or the review being applied, and nothing about how it was built.

## Read first

`authoring/taste/reviewer.md` (the rubric) and `authoring/taste/constitution.md`. Not the builder's run notes.

## Steps

1. Run `pnpm check`; if it fails, that is the first finding.
2. `render_board` on the lesson with `questions: true` and once in Hindi: read every board in the pictures, not the source. Then play each board as a student with `render_board` `steps`: tap, drag, answer right and wrong, and check what each step did (the events, "board passed", the picture).
3. Go through `reviewer.md` board by board: as the student, as the teacher, on the screen. Put the source passage beside it.
4. File each item as a reviewer, with the `comment` tool of the **`chalk-reviewer`** server (it writes as a reviewer), one thread per item, with the board and target, the principle, and what a student would get wrong:
   - `label: "finding"` for something wrong with the lesson;
   - `label: "regression"` with `about: <thread id>` when a change made for that thread broke something (when reviewing an applied review: the boards it touched, and the places `affected` lists). That thread can't be marked ready until it is fixed.

   When you have filed everything, hand your pass over: `comment` with `handover: true` on `chalk-reviewer`. It becomes a review of its own (`by: reviewer`) the person can open in the activity feed (`?dev&activity`).
5. Fix the mechanical findings yourself (overflow, a give-away option, an undefined term, maths inside a sentence) with the **`chalk`** server's `comment` (a fixer): `status: "planned"` with the plan line, fix, render again, `status: "ready"` with what changed. A reviewer can't move a thread; a fixer can. Leave taste decisions open for the person.
6. Append `runs/<YYYY-MM-DD-HHMM>-self-review.md`: what was checked, fixed and still open, and a verdict: ready for the person, or needs another pass.
7. Reply with the open items and the verdict.
