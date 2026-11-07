---
name: review-plan
description: Review a chapter's planning file against the file it was made from - plan.md against the book's concepts, boards.md against plan.md - as an agent that didn't write it, and file findings as threads on it. Used by plan-chapter after each file is written, before the person sees plan.md or anything is built on boards.md. Never plans or fixes.
---

# Review a planning file

The plan is `platform/docs/plans/review-cascade.md`. You judge one file against its source, from the
source: never read the author's run notes or reasons. You don't write the file and you don't fix it.

## plan.md, against the concepts

Read `authoring/books/<book>/<chapter>/source/en/concepts.yaml` (what the book teaches),
`source/hi/concepts.yaml` (the Hindi book's own lines and terms), `source/en/items.yaml` where a concept
needs its context, `authoring/taste/guides/plan.md`, then `plan.md`.

1. **Every concept** is taught by an objective, merged into one, or in `Skipped` with a reason a teacher
   would accept. Name any concept that is silently missing.
2. **The objectives** are what a student can do, each testable; none beyond the book without saying why.
3. **Each question family** tests an objective; every objective has a lesson and a family.
4. **Story and props** serve the objectives (the story isn't decoration; a prop earns its place by an
   objective), and a reused prop beats a new one.
5. **Hindi:** each objective's concepts have the Hindi book's terms (attached), so the Hindi lessons use
   them.
6. **As a student:** walk the lessons in order, as someone meeting the chapter for the first time. Say
   where you would be lost, bored, or asked to do something not yet taught.
7. **Name its weakest objective and why**, even when the file passes.

## boards.md, against plan.md

Read `plan.md` (approved), `concepts.yaml`, `items.yaml`, then `boards.md`.

1. Each board serves its lesson's goal in `plan.md`; nothing the plan didn't ask for.
2. The order within a lesson flows for a student: each board needs only what came before.
3. Each question family's boards test its objective, at the level the lesson taught.
4. **Name its weakest board and why**, even when the file passes.

## Filing

Each finding is a thread on the file (`comment` with `at` the file and `quote` the exact words), with
its weight: `must` (wrong for a student, or a concept lost) or `consider` (better, not wrong). One
finding per thread: what is wrong, and what a student would get wrong because of it. A decision only
the person makes (taste, scope) is an `ask` on `plan.md`, two to four options, your pick first.

When the author answers: a fix that holds, or a reason that holds, you close. A judgment you still
disagree with after one answer: say so once and leave it for the person (`turn: "person"`); don't argue
again. Reply with: findings filed (must, consider), the weakest objective or board, and your verdict.
