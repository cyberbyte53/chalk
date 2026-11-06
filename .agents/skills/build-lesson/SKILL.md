---
name: build-lesson
description: Build one lesson (a concept folder with its overview pages, art and question families) from a chapter's approved planning files. Use lesson by lesson; the first lesson of a chapter is built alone and shown for review before the rest.
---

# Build one lesson

Arguments: the chapter (`content/<book>/<chapter>`) and the lesson's slug from its `flow.md` (`authoring/books/<book>/<chapter>/`).

## Read first

`authoring/guide.md` (and the lessons to copy it names: open them); `authoring/taste/guides/pages.md` and `guides/questions.md`; `platform/docs/writing-content.md`; the lesson's boards in `flow.md` (each board's id, what it serves and what it needs), `props.md` (the prop each need was matched to), the brief, and the source passages its boards cite.

## Pre-conditions

- Every planning file is approved and holds (the Chalk tree, or `pnpm check`'s pipeline step), and every prop `props.md` names exists (otherwise run `build-props`).
- The chapter's first lesson is built alone, reviewed (`self-review`), and shown to the person before any other.

## Steps

1. Make `content/<book>/<chapter>/<slug>/` with `build.yaml` and add the slug to the chapter's `concepts:`. Run `pnpm build-content` once so `concepts.gen.ts` knows it.
2. Write `overview.ts`: one board per `###` in `flow.md`, with the board id it names, in its order, each doing what its `Purpose:` says with the prop `props.md` matched to its need. Every learner-facing string is `t(en, hi)`. A board the flow doesn't have, or a prop the match didn't name, is a change to `flow.md` or `props.md` first: say so, don't improvise it.
3. Add `art.tsx` if the flow gives the lesson a picture (`platform/docs/making-art.md`).
4. Write the question families in the chapter's `questions/`: `family.ts` + `params.yaml`, `tests: [Concept.<This>]`, each with a witness.
4b. **Read each board as a student, as you write it**, before starting the next. The lesson is for a student, so its flow must make sense to one, step by step. Play the board with `show` and `steps` from its start, right and wrong, then read the result top to bottom as the student meets it: each line said, each thing that appears, in order. At every step ask:
   - Can they **see what this line is about**? It is on screen now, not on a piece still hidden, and "below"/"above" is where it really is.
   - Do they **know what to do next, and how**? Which button, which drag, which stall.
   - Is the **problem felt before it is asked or answered**? Try, then told; never the answer before the question.
   - Does the **order** make sense? A question before what it refers to, or a control taken away by an answer, is wrong.
   - Do the **words match the screen**? One name for one thing, nothing named that isn't drawn (B, a stall), and no textbook labels ("Example 4", "Exercise 3.3").
   - **Tap where a finger would**: on the thing itself, its picture, not its label. A tap that works only on a label is a bug.

   Fix what doesn't make sense, then read it again. Steps that pass prove only the mechanics.
5. **Look at every board.** `show` the lesson (`content/<book>/<chapter>/<slug>`) for its boards and any problems, then each board (each piece's source line and state; every version, English and Hindi on each check screen). Fix what you see, then look again. Then open the lesson's preview URL with `&play` in your browser and play it through as a student: answer right and wrong, use every prop. What doesn't work is not done.
6. `pnpm build-content` must pass, then `pnpm check`.
7. Append `runs/<YYYY-MM-DD-HHMM>-lesson-<slug>.md`: pages, props, question counts, what you fixed after looking, what is left for the person.
8. **Self-review, always, before the person sees it.** Run `self-review` on the lesson (the `reviewer` subagent, which didn't build it). Fix its mechanical findings as a fixer and have them checked again; leave the taste calls open. Only then hand the lesson to the person, and your reply gives the reviewer's verdict and what is still open. The Chalk tree shows a lesson changed since its last review as **to self-review**: don't hand one over while it says that. This holds for every change to a built lesson, not just the first build.

Don't invent a prop inside a lesson, set prop state directly, reuse an `id`, or start the next lesson in the same run.
