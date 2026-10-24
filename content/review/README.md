# Review comments

`comments.json` holds the comments made on the review page (`?dev&review` in the learner app's
dev server) and on a chapter's plan in Studio (`?dev&studio`). The pages write it through
`/dev-review`; Claude reads it and writes back (the `apply-review` skill).

A plan comment has `lessonId` = the chapter's path (`class9-science/motion`), `board` = `plan`,
`piece` = the section heading it was made under (or null for the whole plan), `quote` = the
words selected, `part` = their line range in `plan.md` ("12" or "12-14", null when the words
weren't found) and `snapshot` = `content/<book>/<chapter>/plan.md:<lines>`. Open the file at
those lines; the quote is the exact text. A piece comment has the lesson's built id, the board and the piece, as before.

How a comment moves:

1. **open**: you commented on a piece (or a whole board) on the review page.
2. **proposed**: Claude wrote `proposal` (a summary and each change as `before` / `after`), or
   **question**: Claude asked something in `thread`.
3. You **approve** (status `approved`) or reply (back to `open`, with your note in `thread`).
4. **done**: Claude applied the approved change, rebuilt, and added a line to `thread`.

Each comment records the lesson, board, piece and part, and `snapshot`: what the piece said in
English when you commented, so it can be found in the source even if names change. The dev
server adds `source`: the file the board comes from, read from `build/` — a page's
`overview.ts` (with its place in the overview array) or a question's `family.ts` (with its
`params.yaml` row) — and `sourcePath`, the folder. Open `source` first; `snapshot` then finds
the piece inside it.
