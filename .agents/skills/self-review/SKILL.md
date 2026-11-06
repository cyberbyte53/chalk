---
name: self-review
description: Review a built lesson or chapter, or the boards a change touched, as a student of that class and as its teacher, before the person sees it, ideally by an agent that did not build it. Files findings and regressions as comments, fixes the mechanical ones, writes a run note. Use after build-lesson or apply-comments, before asking for the person's review.
---

# Self-review

The person's review is the expensive part; this pass catches everything a fresh pair of eyes can. Run it as the **`reviewer` subagent** (`.claude/agents/reviewer.md`): an agent that did not write the lesson, holding only reviewer tools. Give it the lesson's name, or the threads being applied, and nothing about how it was built. (Without subagents, a new chat whose chalk connection uses the reviewer's token.)

## Read first

`authoring/taste/reviewer.md` (the rubric) and `authoring/guide.md`. Not the builder's run notes.

## Steps

1. Don't run `pnpm check`: the fixer runs it before asking for a review (types, tests, the build), and it is a minute of nothing a student sees. A content build that fails is said by `changes` and `show`, which build first: if one does, that is the first finding.
2. Ask `changes` (at the lesson, or the chapter) what changed since it was last passed. A board **unchanged since passed** is not looked at again. For a **changed** board, the list says exactly what changed (each piece's setup, words and rules, and each function of the code it runs that changed, as `file#name`). Each changed board, and each new board a reviewer has already seen (a board in its first rounds, before any pass), is also drawn now in every version against what a reviewer last saw of it: **the same in every version**, or each version that differs (which pieces, how much), with its pictures as seen and now, what differs in red; and the review's plays (every `show` with steps a review made on it) done again, each step that answers differently said as then and now, and a step that can't be done now said as **couldn't redo**: start with those. A changed board that `changes` draws **the same in every version**, whose plays all answer the same, needs no `show`: what changed doesn't reach what a student sees or does, so pass it with the rest. A **new** board no reviewer has seen gets a full review.
3. `show` each new or changed board (every version comes back, English and Hindi on each check screen): read every board in the pictures, not the source. Hold each board to what `flow.md` says it is for. Then play each board as a student with `show` and `steps`: tap, drag, answer right and wrong, act before the board hands over (`during` a line), and check what each step did (what it changed, "board passed", the picture). Each call starts from the board's start: a right path and a wrong path are two calls.
4. Go through `reviewer.md` for each of those boards: as the student, as the teacher, on the screen. Put the source passage beside it.
5. Say each item where it belongs, with your `comment` tool (it writes as a reviewer): the principle, and what a student would get wrong.
   - **A new problem** with the lesson: a new finding on its board and target, with its **weight** (required): `must` (wrong for a student, or against a principle: the fixer fixes it) or `consider` (better, not wrong: the fixer decides, and says what it did).
   - **Your own finding, back on your turn** (the fixer made it ready, or replied on a consider): check it. Fixed, or its reason holds: **close it** (`status: "closed"`): whoever opened a thread closes it. Not yet: write on it what's still wrong; it goes back to the fixer, who must answer before it can be ready again.
   - **Someone else's thread** (the person's comment, being applied: its fix isn't right yet, or you checked it and it's good): **write on that thread** (`id`). Still wrong: the fixer must answer your words first. Confirmed fixed: write with `turn: "person"`, so it stays the person's to close. Never close it: it isn't yours.
   - **Something a thread's change broke elsewhere** (another board or piece: what the thread reaches is recorded on it, `reaches`, and every board it reached is changed in `changes`; check those boards): a new finding on the piece it broke, naming that thread's id in its words.
   - **A taste decision only the person makes:** `ask` him on the thing it is about, with two to four options, your pick first, each with why. Not a finding.
6. Say which findings are mechanical (overflow, a give-away option, an undefined term, maths inside a sentence). The agent that asked for the review fixes those as a fixer (`status: "planned"`, fix, `show` it again, `status: "ready"`; a fix sent back is planned again the same way); a reviewer moves a thread only to close or withdraw its own.
7. When nothing is left open on a lesson (every finding closed, its fixes rechecked), pass it: `changes` with `pass: true` at the lesson. That records each board as reviewed, as built now, and clears the lesson's **to self-review** mark until one of its boards changes again. A lesson with findings still open is not passed.
8. Append `runs/<YYYY-MM-DD-HHMM>-self-review.md`: what was checked, fixed and still open, and a verdict: ready for the person, or needs another pass. Commit it together with `reviewed.yaml`, so what was passed is in the history with the pass that passed it.
9. Reply with the open items and the verdict.
