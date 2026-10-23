---
name: plan-chapter
description: Plan a chapter from its source before anything is built. Use when a chapter folder has a source/ (or a source path) and no plan, or when the person asks to plan or re-plan a chapter. Writes content/<book>/<chapter>/plan.md as a draft for approval; builds nothing.
---

# Plan a chapter

The plan is the one artefact the person approves before any code exists, so it carries every decision that matters: the story, the split into lessons, which props, which questions. Nothing is built until `status: approved`.

## Inputs

- The chapter folder: `content/<book>/<chapter>/` (make it, and the book's folder and `build.yaml`, if they don't exist; add the chapter to the book's `chapters:` list in the right place).
- The source: everything in the chapter's `source/`, or the path the person gives (`content/sources/text/<file>` for the older textbooks). A PDF is read whole, including activities, examples, boxes and exercises.
- The person's instructions (class, language, what to keep or cut, tone). Write them into `## Open questions` if any is unclear.

## Steps

1. Read, in this order, and keep them open:
   - `content/principles.md` (the taste; the plan is judged against it);
   - the other `plan.md` files in the same book (the story's family, places and timeline continue across chapters; never two lessons on the same "Thursday morning");
   - `library/catalogue.md` (which props exist and what each shows; prefer reuse and extension over a new prop);
   - the whole source.
2. Split the source into lessons: as many as it has concepts, each fully teachable on its own (one idea, found then stated), in the source's order. A direct application of a concept is pages inside that lesson, not a lesson of its own. Name each with the slug its folder will have.
3. Write the mission: one goal for the whole chapter a student of that class cares about, stated up front, with the lessons as numbered stops; the source's own activities and examples become the story's events.
4. For each lesson: the hook, what is learnt (define before use), the "see it in life" payoff, the practice (which examples and exercises), and the props it places. For each prop: reused as is, extended (say what field or action), or new (say why none in the catalogue serves, in one line).
5. Write `plan.md` in the format in `platform/docs/writing-content.md` ("A chapter's own files"), `status: draft`. Keep it under two pages; it is read in one sitting.
6. Append `runs/<YYYY-MM-DD-HHMM>-plan.md`: the source used, the instructions, how many lessons, how many new props, the open questions.
7. Reply with the open questions only. Do not start building; do not write props or overviews.

## What a good plan has

- Every lesson can be checked against the source: section numbers, example numbers, exercise numbers.
- The story is concrete (who, where, what goes wrong) and consistent with the book's other plans.
- Props are few and reused: a chapter needs the props that show its mechanisms, not one per page.
- Nothing from the source is dropped, including sections a later syllabus removed.
- Hindi is assumed for every string; the plan says so once, not per line.
