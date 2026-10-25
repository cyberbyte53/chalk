# Comments

Every comment on content, from the person, a teacher or a reviewer agent, is one Markdown file in its chapter's folder:

```text
content/<book>/<chapter>/.comments/<id>.md
```

It is versioned with the content it is about. A chapter's history shows what was said and what changed. Code: `platform/studio/src/comments.ts`. It is read and written by the review page (`?dev&review`), Studio (`?dev&studio`), the chalk MCP tools (`comments`, `comment_update`, `comment_add`) and by hand.

```markdown
---
id: cmvlxj45gj33
status: open
on: class10-maths/polynomials/what-is-a-polynomial/overview/names
piece: which
source: content/class10-maths/polynomials/what-is-a-polynomial/overview.ts:205
createdAt: 2026-10-24T05:21:44.000Z
snapshot: "Which of these are quadratic? …"
thread:
  - by: agent
    at: …
    text: …
proposal:
  summary: …
  changes:
    - before: …
      after: …
---
equations are not getting contained in the button
```

- **Body**: what was said.
- **`on`**: the board, by its build path without `.json`. Open it at `?dev&board=<on>`, or with `render_board`.
- **`piece`**: the piece's name on that board. Absent when the comment is on the whole board.
- **`source`**: the file and line the piece was written at, from `build/sources.json`. A plan comment points at `plan.md` and has `quote` (the exact words) and `part` (its line range).
- **`snapshot`**: what the piece said when the comment was made, so it can be found even if lines move.
- **`part`**: the part of a prop picked (a slider, a stepper, one bar: the prop's `data-part`), when a part was.
- Other fields (`lessonId`, `boardIndex`, `locale`, `by`, …) are kept as written. The format can grow; unknown fields are carried through.

## Comments on a prop

In the preview's pick mode (`c`) a click takes the finest thing under the pointer: a part of a prop, else the piece, else the whole board, and the label says which. A pick on a prop or one of its parts (any prop but the basics: words, choices and buttons are the lesson's own) is about the prop, wherever it is used. It is filed with the prop:

```text
library/props/<package>/.comments/<id>.md
```

It has `prop` (the type) and `part` when a part was picked, and still `on`, `piece` and `source` for the board it was seen on. The preview shows it under every board that places the prop. Whoever handles it decides where the fix goes: the prop's code (then `affected` lists every place to check), or just how that one board uses it.

## Status

1. **open**: someone commented.
2. **proposed**: an agent wrote `proposal`, or asked in `thread` and is waiting.
3. **approved**: the person agreed. Only the person moves an item here.
4. **done**: the change is applied, rebuilt and looked at; `thread` says what changed.

**declined** closes an item without a change.

## Where a piece's line comes from

The build records where each prop was placed: the first stack frame inside `content/` when `b.prop(...)` runs (`platform/packages/author/src/site.ts`). It writes them to `build/sources.json`, which is never published. The preview puts them on the page as `data-source="content/…:42"` on every piece, so an editor's browser, Cursor's design mode or an agent pointing at a piece knows the line. Alt-click a piece in the preview to open that line.

## Reviews: one sitting, handed over in one line

In the editor's preview, pick a piece, type, press Enter: a comment is saved, with `review`, the `commit` it was made on, and `uncommitted: true` if content had uncommitted changes. When you're done, **Copy for agent (N)** writes `content/reviews/<id>.md` listing that sitting's comments, with a `## Plan` section for the agent, and copies one line: `@content/reviews/<id>.md apply this review (N comments)`. Paste it into any agent's chat. Each board in the preview shows its comments under it, with the agent's plan line and last reply. Finished ones fold away as the board's history.
