---
name: build-lesson
description: Build one lesson (a concept folder with its overview pages, art and question families) from a chapter's approved planning files. Use lesson by lesson; the first lesson of a chapter is built alone and shown for review before the rest.
---

# Build one lesson

Arguments: the chapter (`content/<book>/<chapter>`) and the lesson's slug from its `flow.md` (`authoring/books/<book>/<chapter>/`).

## Read first

`authoring/taste/constitution.md`; `authoring/taste/guides/pages.md` and `guides/questions.md`; the lesson exemplars in `authoring/taste/exemplars.md` (open the files); `platform/docs/writing-content.md`; the lesson's boards in `flow.md` (each board's id, what it serves and what it needs), `props.md` (the prop each need was matched to), the brief, and the source passages its boards cite.

## Pre-conditions

- Every planning file is approved and holds (Studio, or `pnpm check`'s pipeline step), and every prop `props.md` names exists (otherwise run `build-props`).
- The chapter's first lesson is built alone, reviewed (`self-review`), and shown to the person before any other.

## Steps

1. Make `content/<book>/<chapter>/<slug>/` with `build.yaml` and add the slug to the chapter's `concepts:`. Run `pnpm build-content` once so `concepts.gen.ts` knows it.
2. Write `overview.ts`: one board per `###` in `flow.md`, with the board id it names, in its order, each doing what its `Purpose:` says with the prop `props.md` matched to its need. Every learner-facing string is `t(en, hi)`. A board the flow doesn't have, or a prop the match didn't name, is a change to `flow.md` or `props.md` first: say so, don't improvise it.
3. Add `art.tsx` if the flow gives the lesson a picture (`platform/docs/making-art.md`).
4. Write the question families in the chapter's `questions/`: `family.ts` + `params.yaml`, `tests: [Concept.<This>]`, each with a witness.
5. **Look at every board.** `look` at the lesson (`content/<book>/<chapter>/<slug>`) for its boards and any problems, then at each board (each piece's source line and state) in English and Hindi (`locales: ["en", "hi"]`) and on the brief's screens (`screens`). Fix what you see, then look again. Then open the lesson's preview URL with `&play` in your browser and play it through as a student: answer right and wrong, use every prop. What doesn't work is not done.
6. `pnpm build-content` must pass, then `pnpm check`.
7. Append `runs/<YYYY-MM-DD-HHMM>-lesson-<slug>.md`: pages, props, question counts, what you fixed after looking, what is left for the person.

Don't invent a prop inside a lesson, set prop state directly, reuse an `id`, or start the next lesson in the same run.
