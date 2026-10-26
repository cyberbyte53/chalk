---
name: build-lesson
description: Build one lesson (a concept folder with its overview pages, art and question families) from an approved chapter plan. Use lesson by lesson; the first lesson of a chapter is built alone and shown for review before the rest.
---

# Build one lesson

Arguments: the chapter (`content/<book>/<chapter>`) and the lesson's slug from `plan.md`.

## Read first

`authoring/taste/constitution.md`; `authoring/taste/guides/pages.md` and `guides/questions.md`; the lesson exemplars in `authoring/taste/exemplars.md` (open the files); `platform/docs/writing-content.md`; the plan's entry for this lesson and the source passage it covers.

## Pre-conditions

- `plan.md` is `approved`, and every prop it places exists (otherwise run `build-props`).
- The chapter's first lesson is built alone, reviewed (`self-review`), and shown to the person before any other.

## Steps

1. Make `content/<book>/<chapter>/<slug>/` with `build.yaml` and add the slug to the chapter's `concepts:`. Run `pnpm build-content` once so `concepts.gen.ts` knows it.
2. Write `overview.ts` in the order the plan names for this lesson. Every learner-facing string is `t(en, hi)`.
3. Add `art.tsx` if the plan gives the lesson a picture (`platform/docs/making-art.md`).
4. Write the question families in the chapter's `questions/`: `family.ts` + `params.yaml`, `tests: [Concept.<This>]`, each with a witness.
5. **Look at every board.** `render_board` with the lesson's name (`<book>/<chapter>/<slug>`, `questions: true`) shows each one as the phone draws it, with each piece's source line and any overflow. Fix what you see, then render again. Do it in Hindi once (`locale: "hi"`). Then open the lesson's preview URL with `&play` in your browser and play it through as a student: answer right and wrong, use every prop. What doesn't work is not done.
6. `pnpm build-content` must pass, then `pnpm check`.
7. Append `runs/<YYYY-MM-DD-HHMM>-lesson-<slug>.md`: pages, props, question counts, what you fixed after looking, what is left for the person.

Don't invent a prop inside a lesson, set prop state directly, reuse an `id`, or start the next lesson in the same run.
