---
name: plan-chapter
description: Plan a chapter from its source before anything is built - the source outline, then plan.md (the intent, which the person approves) and boards.md (each board and question family in detail). Use when a chapter has a source and no plan, when the Chalk tree shows a planning file not written, failing or to check again, or when the person asks to plan or re-plan a chapter. Writes in authoring/books/<book>/<chapter>/; builds nothing.
---

# Plan a chapter

A chapter is planned in three files (`platform/docs/authoring-pipeline.md` has their formats; `platform/studio/src/pipeline.ts` reads and checks them). The machine's gate is `pnpm check`'s pipeline step; the person's is approving `plan.md` in the editor (the Chalk tree). You never approve: you write, check, and stop for the person. Nothing is built until `plan.md` is approved.

| File | Question | Its gate |
|---|---|---|
| `source/en/outline.yaml` | What exactly does the source contain? | the machine: every figure, example, activity and exercise the text numbers |
| `plan.md` | What will a student be able to do, and how will the chapter get them there? | the machine (below); then the person |
| `boards.md` | Which board, or question family, drives each objective home, and what does it need? | the machine only: never approved |

## Read first

1. `authoring/guide.md`, then `authoring/taste/guides/plan.md`.
2. The other chapters of the same book in `authoring/books/<book>/`: characters, places and timeline continue across chapters.
3. The whole source: the chapter's `source/en/`, every page. Read activities, examples, boxes and exercises too.
4. Where the chapter stands: the Chalk tree in the editor, or `cd platform/studio && npx tsx --tsconfig ../../tsconfig.base.json src/pipeline-cli.ts`.

## Steps

1. **The outline**, if missing: `source/en/outline.yaml`, every section, figure, example, activity, definition, remark, note and exercise, each `{ id, kind, … }` with the ids the checks expect (`fig3.10`, `example2`, `activity1`, `ex3.2`, and your own for the rest: `s3.2`, `def-abscissa`). A line saying what a figure shows, a definition's words. It is the machine's: once it holds, go on.
2. **`plan.md`**, about one to two pages, English, with these `## ` sections:
   - `Goal`: one sentence, what a student can do after the chapter.
   - `Objectives`: `- **o5** what a student can do. (outline ids it covers)`.
   - `Skipped` (when anything is): `- **activity2** why it is left out.` Every outline item is covered by an objective or skipped here, with a reason: anything else fails.
   - `Story`: the arc, and the characters it uses.
   - `Lessons`: per lesson `### <slug>  (o1, o2)` (the slug its folder and `build.yaml` will have), then `Goal:`, `Does:` (what the student does) and `Card:` (its card's art).
   - `Chapter art`: the tile's idea.
   - `Props`: `- **reuse|extend|new** <prop>: a short sketch. Why: …`. `show` `library/props/` first; extending beats a new prop.
   - `Question families`: `- **<family>** what it tests. (o3, o4)`, by the folder it will have under `questions/`.
3. **`boards.md`**: per lesson `## <slug>`, then per board `### <board-id>  (o5, o9; fig3.15)`, and per question family `### questions/<family>  (o3; ex3.2-q1)` under the lesson it tests, each with `Purpose:`, `Beat:` (its moment in the story, or none), `Needs:` (what the student sees or does, in words, never a prop name) and `Props:`. Board ids are the ids the boards will have in `content/`. Every objective is served by a board or a family. Never write a status: built and reviewed are worked out from the build. Then walk each lesson's boards in order as the student would: is the problem met before it is asked, and does the student have what it needs from the boards before? Reorder or rewrite until it reads right.
4. **Run the checks** (the pipeline step) until all three hold. A draft `plan.md` whose checks fail doesn't fail `pnpm check`, but it can't be approved.
5. **Questions only the person can answer** go on the file with `ask` (`at: "authoring/books/<book>/<chapter>/plan.md"` and `quote`: the exact words they are about, or no quote for the whole file), two to four options, your recommendation first, each with why. Never a section of open questions. When he answers, put the answer in the file and answer the thread (`planned`, then `ready` with the old words and the new; it comes back to you, and you close it); a question settled in chat instead you withdraw, saying so. `plan.md` can't be approved while a thread on it is open.
6. **Commit** `plan.md` and `boards.md` (the person approves what is committed), append `runs/<YYYY-MM-DD-HHMM>-plan.md` (what the plan decided, its threads), and **stop**: reply with the threads' questions and ask the person to approve `plan.md` in the editor (the Chalk tree).

**Changing an approved plan:** say first that it will need approving again. Update `plan.md` and follow its ids into `boards.md`; the person re-stamps it. `boards.md` changes freely: it is never approved.
