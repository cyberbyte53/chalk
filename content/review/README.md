# Review comments

`comments.json` holds the comments made on the review page (`?dev&review` in the learner app's
dev server). The page writes it through `/dev-review`; Claude reads it and writes back.

How a comment moves:

1. **open**: you commented on a piece (or a whole board) on the review page.
2. **proposed**: Claude wrote `proposal` (a summary and each change as `before` / `after`), or
   **question**: Claude asked something in `thread`.
3. You **approve** (status `approved`) or reply (back to `open`, with your note in `thread`).
4. **done**: Claude applied the approved change, rebuilt, and added a line to `thread`.

Each comment records the lesson, board, piece and part, and `snapshot`: what the piece said in
English when you commented, so it can be found in the source even if names change.
