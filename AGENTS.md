# Agent notes

Three layers, importing one way (`pnpm boundaries` checks):

```text
content/    the books: book → chapter → lesson (overview pages + question bank). Changes daily.
library/    props and board patterns, shared across books.
platform/   the fixed code: packages (the core), apps, studio tooling, deploy, engineering docs.
```

## Content work

- **The taste is `authoring/taste/`.** Read `constitution.md` always. Then read only the guide for your step (`guides/plan.md`, `pages.md`, `questions.md` or `props.md`) and the exemplars. `checks.md` is enforced by the build, and `reviewer.md` is for reviewers.
- **The steps are skills** in `.agents/skills/` (`.claude/skills` points there). In order:
  1. `plan-chapter`, then the person approves `plan.md`.
  2. `build-props`.
  3. `build-lesson`: the first lesson alone, then the rest.
  4. `self-review`, run by a fresh agent.
  5. The person's review.
  6. `apply-review`.

  When a chat with the person ends, run `wrap-up`: corrections that could recur become checks, examples or guide lines, with the person's yes.

  Each step writes a note to the chapter's `runs/`.
- **Look at what you make.** The chalk MCP (one service, `127.0.0.1:5174/mcp`: `pnpm mcp`, `pnpm dev` or the editor starts it; configured in `.cursor/mcp.json`, `.vscode/mcp.json`, `.mcp.json`) gives you:
  - `render_board`: boards drawn by the real player at phone width, with the board model (each piece's source line, setup and live values, every element with its typed value, words, action and file:line, what the student can do, and gaps between what's drawn and what's described) and layout problems found by measuring; with `steps`, it taps and drags the real board as a student would and reports what changed after each (live values, events, passed, a picture);
  - `affected`: every piece a change can reach (`book/chapter/lesson/page#piece`, rolled up to any depth), from what the build recorded and who uses what in the code ([platform/docs/reach.md](platform/docs/reach.md)); ask it before changing shared code, and with `diff: true` after;
  - `comments` (read) and `comment` (write): the only way to read and write threads. Your connection's token makes you a fixer; the `reviewer` subagent (`.claude/agents/reviewer.md`) connects with the reviewer's token. Each connection is shown only what its role may do (platform/docs/comments.md).

  For people and agents alike, the same boards are at `?dev&board=<book>/<chapter>/<lesson>` in the learner app's dev server; add `&play` and use them in a browser as a student would (Cursor's browser, or a browser MCP). Every piece carries `data-source="content/…:line"`, and Alt-click opens the line.
- **In the editor**, the Chalk extension (`platform/editor`, install `chalk-editor.vsix`) previews whatever file or folder is open as the student sees it (book screen, chapter path, lesson boards), follows the cursor, and lets the person pick a piece to send to you.
- **Reviews:** when the person says "apply review <id>", use `apply-review`: one plan agreed in chat, a plan line and an answer on every thread, commit after their yes.
- **Threads** live in `content/<book>/<chapter>/comments.yaml`, or `library/props/<package>/comments.yaml` for one on a prop; **reviews** in `reviews/<id>.yaml`. Both are written only through the one writer ([platform/docs/comments.md](platform/docs/comments.md)). Never edit them by hand. Only the person closes a thread.
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
