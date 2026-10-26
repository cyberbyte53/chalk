---
name: plan-chapter
description: Plan a chapter from its source before anything is built. Use when a chapter folder has a source/ (or a source path) and no plan, or when the person asks to plan or re-plan a chapter. Writes content/<book>/<chapter>/plan.md as a draft for approval; builds nothing.
---

# Plan a chapter

The plan is the one thing the person approves before anything is built, so it carries every decision that matters: the mission and characters, the split into lessons, each lesson's order, the props, the questions. Nothing is built until the person sets `status: approved`.

## Read first

1. `authoring/taste/constitution.md`, then `authoring/taste/guides/plan.md`.
2. The other `plan.md` files in the same book: characters, places and timeline continue across chapters.
3. Props: read `library/catalogue.md` (every prop, what it shows, what a student can do on it, where it is used).
4. The whole source: the chapter's `source/`, or the path the person gives. Read activities, examples, boxes and exercises too.

## Steps

1. Make the chapter folder (and the book's folder and `build.yaml`) if missing. Don't list the chapter in the book's `chapters:` yet; `build-lesson` does that with its first lesson.
2. Write `plan.md` in the format in `platform/docs/writing-content.md` ("A chapter's own files"), `status: draft`, under two pages. Each lesson cites the source's section, example and exercise numbers, and names its order (discover → state, or state → see it hold).
3. Put anything unclear in the person's instructions, and every decision only they can make, in `## Open questions`, each with your recommendation.
4. Append `runs/<YYYY-MM-DD-HHMM>-plan.md`: the source, the instructions, the lesson count, any new props, the open questions.
5. Reply with the open questions only. Build nothing.
