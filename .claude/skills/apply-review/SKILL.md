---
name: apply-review
description: Work through the person's screen-review comments on a chapter (content/review/comments.json and plan comments) — propose a change for each, apply the approved ones, capture patterns into content/principles.md. Use when there are open review comments.
---

# Apply review comments

Comments come from Studio: on a plan (`plan.md` sections) or on pieces of a built board (`content/review/comments.json`; the format and the status flow are in `content/review/README.md`).

## Steps

1. Read every comment with status `open`. For each, find the source it points at (the `snapshot` text, the lesson, board and piece).
2. For each: write a `proposal` (a one-line summary and each change as before/after) and set the status to `proposed`; or, if the comment is a question or ambiguous, ask in `thread` and set `question`. Never apply before approval.
3. For comments the person has set to `approved`: apply the change in the source, rebuild (`pnpm build-content`), set `done`, and add a line to `thread` saying what changed.
4. **Patterns.** When a comment reveals a rule rather than a slip (the same mistake can recur in other lessons), add the rule to `content/principles.md` in the right section, then sweep the chapter for other instances and fix them under the same comment.
5. `pnpm check` green. Append `runs/<YYYY-MM-DD-HHMM>-review.md`: comments handled, rules added, sweeps done.
