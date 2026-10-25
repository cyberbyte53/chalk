# Agent notes

Three layers, importing one way (`pnpm boundaries` checks):

```text
content/    the books: book → chapter → lesson (overview pages + question bank). Changes daily.
library/    props and board patterns, shared across books.
platform/   the fixed code: packages (the core), apps, studio tooling, deploy, engineering docs.
```

## Content work

- **The taste is `content/taste/`.** Read `constitution.md` always. Then read only the guide for your step (`guides/plan.md`, `pages.md`, `questions.md` or `props.md`) and the exemplars. `checks.md` is enforced by the build, and `reviewer.md` is for reviewers.
- **The steps are skills** in `.agents/skills/` (`.claude/skills` points there). In order:
  1. `plan-chapter`, then the person approves `plan.md`.
  2. `build-props`.
  3. `build-lesson`: the first lesson alone, then the rest.
  4. `self-review`, run by a fresh agent.
  5. The person's review.
  6. `apply-review`.

  When a chat with the person ends, run `wrap-up`: corrections that could recur become checks, examples or guide lines, with the person's yes.

  Each step writes a note to the chapter's `runs/`.
- **Look at what you make.** The chalk MCP server (`.cursor/mcp.json`, `.vscode/mcp.json`, `.mcp.json`) gives you:
  - `render_board`: boards drawn by the real player at phone width, with each piece's source line and parts, and layout problems found by measuring; with `steps`, it taps and drags the real board as a student would and reports what the app did after each (events, passed, a picture);
  - `affected`: what a change to a prop, pattern or platform file reaches, as a tree (chapters → lessons → boards; `open` one to expand), from what each chapter's build actually read;
  - `comments`, `comment_add`, `comment_update`: the only way to read and write comments.

  For people and agents alike, the same boards are at `?dev&board=<book>/<chapter>/<lesson>` in the learner app's dev server; add `&play` and use them in a browser as a student would (Cursor's browser, or a browser MCP). Every piece carries `data-source="content/…:line"`, and Alt-click opens the line.
- **In the editor**, the Chalk extension (`platform/editor`, install `chalk-editor.vsix`) previews whatever file or folder is open as the student sees it (book screen, chapter path, lesson boards), follows the cursor, and lets the person pick a piece to send to you.
- **Reviews:** when the person says "apply my review", use `apply-review`: one plan agreed in chat, a plan line and a reply on every comment, commit after their yes.
- **Comments** live in `content/<book>/<chapter>/comments.yaml`, or `library/props/<package>/comments.yaml` for a comment on a prop, written only by the dev server ([platform/docs/comments.md](platform/docs/comments.md)). Never edit them by hand. Only the person closes a comment.
- `plan.md` approval is the person's gate. Never set `status: approved` yourself.
- **Commit only what the person has seen and is happy with.** Finish, show it, wait for their yes, then commit.

## Code work

Read [platform/docs/glossary.md](platform/docs/glossary.md) (use its names), [board-model.md](platform/docs/board-model.md), [architecture.md](platform/docs/architecture.md) and [code-conventions.md](platform/docs/code-conventions.md).

- Every change to a prop is one of its actions, through `BoardRuntime.call`.
- New prop: in `library/props/<name>`, following [making-a-prop.md](platform/docs/making-a-prop.md), with one line in `library/registry/src/index.ts`.
- A board shape used twice goes to `library/patterns/`.
- Drawing: `@chalk/draw` only ([drawing.md](platform/docs/drawing.md)). Art: [making-art.md](platform/docs/making-art.md).
- New content: [writing-content.md](platform/docs/writing-content.md). `pnpm build-content` must pass. Never edit or reuse an `id`.
- **One renderer.** Studio tooling never draws a board itself. Preview, screenshots and checks all go through the app's player.
- `tmp/` is old code: don't import from it or edit it.
- Done means `pnpm check` passes. It only redoes what a change could affect (type checks, tests and chapters are skipped when nothing they read changed); `pnpm check --force` redoes everything.
