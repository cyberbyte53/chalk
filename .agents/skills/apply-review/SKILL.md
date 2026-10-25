---
name: apply-review
description: Work through a review (content/reviews/<id>.md, the comments the person made in one sitting) or a chapter's open comments. Plan the changes in the review file, apply them, answer each comment, commit. Use when the person hands over a review file (content/reviews/<id>.md) or asks to handle comments.
---

# Apply a review

A **review** is one sitting of the person's comments, handed over in one line: `@content/reviews/<id>.md apply this review`. The file lists the comment files. Each comment file (in its chapter's `.comments/` folder; format in `platform/docs/comments.md`) holds:
- the board (`on`);
- the piece and its line (`source`);
- what the piece said (`snapshot`);
- the commit it was made on;
- what the person said (the body).

A comment with `prop` (filed in `library/props/<package>/.comments/`) is about that prop wherever it is used, not one board: decide whether the fix belongs in the prop (follow the build-props skill, and check every place `affected` lists) or only in how the board named in `on` uses it, and say which in the plan.

## Steps

1. **Read every comment** in the review. For each, open `source` at its line and render the board (`render_board` with `on`). See what the person saw. Read them together first: several comments often share one cause ("he wants figures here").
2. **Plan, in the review file's `## Plan` section:**
   - first, changes that reach beyond one board (a prop to drop or change across lessons, a rule for the chapter), each with its reason and the boards it touches;
   - then one line per board: `- [board](board:<on>) — what will change (comment <id>)`.

   Also put each comment's line in its file as `proposal: { summary: … }` and set it to `proposed`, so the board's thread in the preview shows it.
3. **Stop for the plan or go straight on.**
   - **Stop** and ask "Plan's in the review — go?" when there are changes beyond one board or many boards are touched.
   - **Go straight on** for a few local fixes.
   - If the person said "just do it" or "plan first", that decides it.
4. **Apply.** Make the edits. For each comment: `render_board` its board and check the change answers it. Then set `done` and add a reply: what changed, in one line.
5. **Hand back, and wait.** Say it's ready and what to look at. The person checks the boards in the preview and the edits in the editor's diff view, and keeps or undoes per file. **Never commit until the person says they're happy.** Then run `pnpm check`, commit with the message `review <id>: <one line>`, and set the review's `status: done`.
6. **Patterns:** if the same kind of comment could come back elsewhere, say so and suggest the `wrap-up` step (a check, an example, or a guide line).

Without a review file ("handle the comments on Light"), do the same with the chapter's open comments.
