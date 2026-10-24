---
name: self-review
description: Review a built lesson or chapter as a student of that class and as its teacher, before the person sees it, ideally by an agent that did not build it. Files findings as comments, fixes the mechanical ones, writes a run note. Use after build-lesson, before asking for the person's review.
---

# Self-review

The person's review is the expensive part; this pass catches everything a fresh pair of eyes can. Best run as a separate agent (a subagent or a new chat) that did not write the lesson. Give it the lesson's name and nothing about how it was built.

## Read first

`content/taste/reviewer.md` (the rubric) and `content/taste/constitution.md`. Not the builder's run notes.

## Steps

1. Run the `check` tool; if it fails, that is the first finding.
2. `render_board` on the lesson with `questions: true` and once in Hindi: read every board in the screenshots, not the source. Then open the preview URL with `&play` in your browser and play the lesson as a student: tap, drag, answer right and wrong.
3. Go through `reviewer.md` board by board: as the student, as the teacher, on the screen. Put the source passage beside it.
4. File each finding with `comment_add` (`by: "reviewer"`): the board, the piece, the principle, and what a student would get wrong. One finding per item.
5. Fix the mechanical findings yourself (overflow, a give-away option, an undefined term, maths inside a sentence), render again, and mark them `done` with a reply saying what changed. Leave taste decisions open for the person.
6. Append `runs/<YYYY-MM-DD-HHMM>-self-review.md`: what was checked, fixed and still open, and a verdict: ready for the person, or needs another pass.
7. Reply with the open findings and the verdict.
