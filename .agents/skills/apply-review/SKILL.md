---
name: apply-review
description: Work through a review (the comments the person made in one sitting, handed over as "apply my review") or a chapter's open comments. One plan agreed in chat, a plan line and a reply on every comment, commit after the person's yes. Use when the person says "apply my review" or asks to handle comments.
---

# Apply a review

A **review** is one sitting of the person's comments, handed over in one line: `apply my review (N comments)`. Read them with the `comments` tool (`review: "latest"`). Each has its board, its target (`piece › part`), the piece's source line, what the piece said (`snapshot`), the commit it was made on, and what the person said. Format and rules: `platform/docs/comments.md`.

You read and write comments only with the tools (`comments`, `comment_update`, `comment_add`); never edit comments.yaml.

A comment with `prop` is about that prop wherever it is used, not one board: decide whether the fix belongs in the prop (follow the build-props skill, and check every place `affected` lists) or only in how the board uses it, and say which in the plan.

## Steps

1. **Read every comment** in the review. For each, open `source` at its line and `render_board` its board. See what the person saw. Read them together first: several comments often share one cause ("he wants figures here").
2. **One plan for the whole review, in chat** (Cursor's plan mode when there): first the changes that reach beyond one board (a prop to change across lessons, a rule for the chapter), each with its reason and what `affected` says it touches; then one line per comment. Ask questions here, not on the comments. Wait for the person's go; for a few local fixes, or when the person said "just do it", go straight on.
3. **Before changing anything**, write each comment's line of the plan on it: `comment_update` with `op: "plan"`. The person sees it under the board.
4. **Apply.** Make the edits. For each comment, `render_board` its board and check the change answers it.
5. **Review it fresh.** For anything beyond a few local fixes, have an agent that didn't make the changes run `self-review` on the boards touched, and what `affected` lists. It files regressions against the comment that caused them; fix those first (a comment can't be ready while one is open).
6. **Answer every comment**: `comment_update` with `op: "ready"` and one line on what changed, or `op: "reply"` when you didn't change anything (a question, a reason not to). Never close one: only the person closes.
7. **Feedback in chat** about a board ("the slider's still too small"): record it with `comment_add` (`from: "chat"`, the board and target) so it lives on the board like any comment, then handle it the same way.
8. **Hand back, and wait.** Say it's ready and what to look at. The person checks the boards in the preview and the diff, and replies on a comment (it reopens) or closes it. **Never commit until the person says they're happy.** Then run `pnpm check` and commit with the message `review <id>: <one line>`.
9. **Patterns:** if the same kind of comment could come back elsewhere, say so and suggest the `wrap-up` step (a check, an example, or a guide line).

Without a review ("handle the comments on Light"), do the same with `comments` filtered by the chapter's board prefix and `unanswered: true`.
