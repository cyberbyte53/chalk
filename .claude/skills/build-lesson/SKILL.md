---
name: build-lesson
description: Build one lesson (a concept folder with its overview pages, art and question families) from an approved chapter plan. Use lesson by lesson; the first lesson of a chapter is built alone and shown for review before the rest.
---

# Build one lesson

Arguments: the chapter (`content/<book>/<chapter>`) and the lesson's slug from `plan.md`.

## Pre-conditions

- `plan.md` is `approved`, and every prop the lesson places exists in `library/catalogue.md` (otherwise run `build-props` first).
- If this is the chapter's first lesson to be built: build it, run `self-review` on it, and stop for the person's review before any other lesson. It calibrates the rest.

## Steps

1. Read `content/principles.md`, `platform/docs/writing-content.md`, the plan's entry for this lesson, the source passage it covers, and one finished lesson of the same book as the exemplar (the plan's neighbour, or the chapter the principles name as the golden one).
2. Create `content/<book>/<chapter>/<slug>/` with `build.yaml` (title in both languages; `props:` only for explainers no board places) and add the slug to the chapter's `concepts:` in order. Run `pnpm build-content` once so `concepts.gen.ts` has the new concept.
3. Write `overview.ts` in the lesson's four parts: hook → learn → see it in life → practice, each page opening from where the last one ended. Every learner-facing string is `t(en, hi)`. Sentence, then maths on its own line. Props only where the student does the step themselves.
4. Write `art.tsx` for the lesson if the plan gives it a picture (see `platform/docs/making-art.md`).
5. Write the question families in `questions/`: `family.ts` + `params.yaml`, `tests: [Concept.<This>]`, every question with a witness, wrong options as real misconceptions with feedback, no give-aways.
6. `pnpm build-content` must say every check passed; then `pnpm check`.
7. Walk the lesson as a student of that class (the `self-review` skill's roleplay); fix what you find.
8. Append `runs/<YYYY-MM-DD-HHMM>-lesson-<slug>.md`: pages, props placed, families and question counts, what the roleplay caught, what is left for the person.

## Don'ts

- Don't invent a prop inside the lesson; don't set prop state directly; don't reuse an `id`.
- Don't put theorem numbers, "from the textbook" or asides in the lesson; the source is a source, not a citation.
- Don't start the next lesson in the same run.
