# Comments

Every comment on content (the person's, a reviewer agent's finding, feedback given in chat) is an entry in one file per chapter, or per prop package for a comment on a prop:

```text
content/<book>/<chapter>/comments.yaml
library/props/<package>/comments.yaml
```

They are versioned with the content they are about. **Only the dev server writes them** (`platform/apps/learner/vite.config.ts`, `/dev-review`), through one writer, `platform/studio/src/comments.ts`, which checks every change against the rules below. The preview, the editor extension and the chalk MCP tools (`comments`, `comment_add`, `comment_update`) all go through it. Never edit the files by hand: if one is broken, the reader names the entry and every write is refused until it is fixed.

The dev server is one per repo, on port 5173 (`CHALK_DEV_PORT` to change it), and runs the content rebuild on save too. The editor and the MCP start it if it isn't running.

```yaml
- id: cmvlxj45gj33
  kind: comment
  status: planned
  by: you
  createdAt: 2026-10-24T05:21:44.000Z
  board: class10-maths/polynomials/what-is-a-polynomial/overview/names
  target: which/option
  source: content/class10-maths/polynomials/what-is-a-polynomial/overview.ts:205
  snapshot: "Which of these are quadratic? …"
  commit: ff358ba…
  review: 20261024-1547
  text: equations are not getting contained in the button
  plan:
    by: agent
    at: …
    text: let the options wrap to two lines
  thread:
    - by: agent
      at: …
      text: …
```

- **`text`**: what was said.
- **`board`**: the board, by its build path without `.json`. Open it at `?dev&board=<board>`, or with `render_board`.
- **`target`**: what was picked on the board, by address: the piece's name, then the groups and the part, joined by `/` (`which/option`). Absent for the whole board. If the board changes and the path no longer finds anything, the preview shows the comment as detached.
- **`prop`**: the prop's type, for a comment on a prop (see below).
- **`source`**: the file and line the piece was written at, from `build/sources.json`. A plan comment points at `plan.md` and has `quote` (the exact words).
- **`snapshot`**: what the piece said when the comment was made. **`commit`**: the commit it was made on.
- **`review`**: the sitting it was handed over in (see Reviews).
- **`plan`**: what the agent will do, written once the plan is agreed.
- **`changed`**: the files changed for it, recorded from git when it was marked ready.
- **`thread`**: replies, oldest first.

## Kinds

- **comment**: the person's. An agent files one only with `from: chat`, to record feedback the person gave in chat, in their name (`by: you`).
- **finding**: a reviewer agent's, about something it saw.
- **regression**: a reviewer agent's, about something a change broke. It names the comment whose change broke it (`causedBy`); that comment can't be marked ready while the regression is open.

## Status

1. **open**: waiting for the agent. A reply from the person sends any comment back here.
2. **planned**: the agent wrote its `plan`, after the person agreed to the plan in chat.
3. **ready**: done, rendered and checked; the last reply says what changed. Waiting for the person.
4. **closed**: the person is happy. **Only the person closes.**

The person can also **withdraw** a comment (it keeps its thread, as history) or, while no agent has touched it, **delete** it.

## Comments on a prop

In the preview's pick mode (`c`) a click takes the finest thing under the pointer: a part of a prop, else the piece, else the whole board, and the label says which. A pick on a prop or one of its parts (any prop but the basics: words, choices and buttons are the lesson's own) is about the prop, wherever it is used, and is filed in the prop package's comments.yaml with `prop`, and still `board`, `target` and `source` for the board it was seen on. The preview shows it under every board that places the prop. Whoever handles it decides where the fix goes: the prop's code (then `affected` lists every place to check), or just how that one board uses it.

## Where a piece's line comes from

The build records where each prop was placed: the first stack frame inside `content/` when `b.prop(...)` runs (`platform/packages/author/src/site.ts`). It writes them to `build/sources.json`, which is never published. The preview puts them on the page as `data-source="content/…:42"` on every piece, so an editor's browser, Cursor's design mode or an agent pointing at a piece knows the line. Alt-click a piece in the preview to open that line.

## Reviews: one sitting, handed over in one line

In the editor's preview, pick a piece, type, press Enter: a comment is saved. When you're done, **Copy for agent (N)** tags that sitting's new comments with one review id and copies `apply my review (N comments)`. Paste it into the agent's chat; the agent reads them with `comments` (`review: "latest"`) and follows the `apply-review` skill: one plan for the whole review, agreed in chat, then a plan line and a reply on every comment. Each board in the preview shows its comments under it, live, with the plan, the thread and the files changed; closed ones fold away as the board's history.
