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
2. Ask `changes` (at the lesson, or the chapter) what changed since it was last passed. A board **unchanged since passed** is not looked at again. For a **changed** board, the list says exactly what changed (each piece's setup, words and rules, and each function of the code it runs that changed, as `file#name`). A changed function may say whether its changed lines **ran in the last review** (look there closely) or **didn't run** (nothing looked at used it: check whether some state you didn't play does). That is a hint about what was played, never a reason to skip a board: look there first, with the board around it. A **new** board gets a full review.
3. `look` at each new or changed board, in English and Hindi (`locales: ["en", "hi"]`): read every board in the pictures, not the source. Hold each board to what `flow.md` says it is for. Then play each board as a student with `play`: tap, drag, answer right and wrong, and check what each step did (what it changed, "board passed", the picture).
4. Go through `reviewer.md` for each of those boards: as the student, as the teacher, on the screen. Put the source passage beside it.
5. Say each item where it belongs, with your `comment` tool (it writes as a reviewer): the principle, and what a student would get wrong.
   - **About a thread already there** (reviewing an applied review: its fix isn't right yet, or you checked it and it's good): **write on that thread** (`id`). Still wrong: the fixer must answer your words before it can mark that thread ready. Confirmed fixed: write with `turn: "person"`, so it goes back to the person to close, not to the fixer.
   - **A new problem** with the lesson: a new thread on its board and target.
   - **Something a thread's change broke elsewhere** (another board or piece: what the thread reaches is recorded on it, `reaches`, and `affected` with `diff: true` lists the pieces; check those boards): a new thread on the piece it broke, naming that thread's id in its words.

   When you have filed everything, hand your pass over: `comment` with `handover: true`. It becomes a review (`by: reviewer`); a later pass adds to it until the person has settled every thread in it.
6. Say which findings are mechanical (overflow, a give-away option, an undefined term, maths inside a sentence). The agent that asked for the review fixes those as a fixer (`status: "planned"`, fix, render again, `status: "ready"`); a reviewer can't move a thread. A taste decision is the person's: start it with `turn: "person"`, so it waits on them, not on the fixer.
7. When nothing is left open on a lesson (every finding answered, its fixes rechecked), pass it: `changes` with `pass: true` at the lesson. That records each board as reviewed, as built now, and clears the lesson's **to self-review** mark until one of its boards changes again. A lesson with findings still open is not passed.
8. Append `runs/<YYYY-MM-DD-HHMM>-self-review.md`: what was checked, fixed and still open, and a verdict: ready for the person, or needs another pass. Commit it together with `reviewed.yaml`, so what was passed is in the history with the pass that passed it.
9. Reply with the open items and the verdict.
