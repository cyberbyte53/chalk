---
name: plan-chapter
description: Plan a chapter from its source before anything is built, one planning file and one gate at a time - brief, source outline, objectives, flow. Use when a chapter has a source and no brief, when the Chalk tree shows a planning file not written, failing or to check again, or when the person asks to plan or re-plan a chapter. Writes in authoring/books/<book>/<chapter>/; builds nothing.
---

# Plan a chapter

A chapter is planned in files that each answer one question and end at a gate (`platform/docs/authoring-pipeline.md` has their formats; `platform/studio/src/pipeline.ts` reads them). The machine's gate is `pnpm check`'s pipeline step; the person's is approving the file in the editor (the Chalk tree). You never approve: you write, check, and stop for the person. Nothing is built until the props match (`build-props`) is approved too.

| # | File | Question | Its gate |
|---|---|---|---|
| 1 | `brief.md` | Who is it for, on what screens, what is in or out? | the person |
| 2 | `source/outline.yaml` | What exactly does the source contain? | the machine: the outline has every figure, example, activity and exercise the text numbers |
| 3 | `objectives.md` | What can a student do at the end? | every objective cites outline ids that exist; then the person |
| 4 | `flow.md` | In what order, and which board drives each objective home? | every board serves an objective, cites what exists and says what it needs; every objective has a board; then the person |

## Read first

1. `authoring/taste/constitution.md`, then `authoring/taste/guides/plan.md`.
2. The other chapters of the same book in `authoring/books/<book>/`: characters, places and timeline continue across chapters.
3. The whole source: the chapter's `source/`, every page. Read activities, examples, boxes and exercises too.
4. Where the chapter stands: the Chalk tree in the editor, or `cd platform/studio && npx tsx --tsconfig ../../tsconfig.base.json src/pipeline-cli.ts`. Start at the first file that is missing, failing its checks, or to be checked again.

## Steps

Work on **one file at a time**, the first not done:

1. **Missing:** write it, from the person's words and the files before it.
   - `brief.md`: `## Scope` (who, languages, story or none, questions or none, what must be kept) and `## Screens` (each `W×H, device, input`, the screens the chapter is taught on). Written from the conversation; if the person hasn't said, ask in chat before writing.
   - `source/outline.yaml`: every section, figure, example, activity, definition, remark, note and exercise, each `{ id, kind, … }` with the ids the checks expect (`fig3.10`, `example2`, `activity1`, `ex3.2`, and your own for the rest: `s3.2`, `def-abscissa`). A line saying what a figure shows, a definition's words.
   - `objectives.md`: `- **o5** what a student can do. (ids it cites)`. Something a student does, each citing the outline. Leaving a source item out is a decision: say it on a thread.
   - `flow.md`: `## <lesson>`, then per board `### <board-id>  (o5, o9; fig3.15)` with `Purpose:` and `Needs:` (what the student sees or does, in words, never a prop name). Board ids are the ids the boards will have in `content/`.
2. **Its checks fail, or it is to be checked again:** fix it, or (to be checked again) say on a thread on the file why it still holds.
3. **Run the checks** (the pipeline step) until this file holds.
4. **Questions only the person can answer** go on the file as threads (`comment` with `at: "authoring/books/<book>/<chapter>/<file>"` and `quote`: the exact words they are about), each with your recommendation. Never a section of open questions.
5. **Commit the file** (the person approves what is committed), append `runs/<YYYY-MM-DD-HHMM>-plan.md` (the file, what it decided, its threads), and **stop**: reply with the threads' questions and ask the person to approve it in the editor (the Chalk tree). The next file starts after they do.

The outline is the machine's alone: once it holds, go on to the objectives without waiting.
