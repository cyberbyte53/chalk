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
  1. `plan-chapter`: `brief.md`, `source/outline.yaml`, `objectives.md`, `flow.md`, one at a time, each approved by the person in the editor (the Chalk tree) ([platform/docs/authoring-pipeline.md](platform/docs/authoring-pipeline.md)).
  2. `build-props`: the props match (`props.md`, approved by the person), each new or changed prop's definition first, then its build.
  3. `build-lesson`: the first lesson alone, then the rest.
  4. `self-review`, run by a fresh agent.
  5. The person's review.
  6. `apply-review`.

  When a chat with the person ends, run `wrap-up`: corrections that could recur become checks, examples or guide lines, with the person's yes.

  Each step writes a note to the chapter's `runs/`. A chapter's plan, run notes and source are in `authoring/books/<book>/<chapter>/`, apart from its built content.
- **Look at what you make.** The chalk MCP (one service, `127.0.0.1:5174/mcp`; the configs in `.cursor/mcp.json`, `.vscode/mcp.json`, `.mcp.json` start a relay that starts the service if it isn't running and reconnects when it restarts, so there's nothing to start by hand) gives you:
  - `show`: a board drawn by the real learner app in Chrome, from its start, after the steps if any. Without steps, it plays on its own to its end and is checked in English and Hindi on the three check screens: a picture of each version (readable as it arrives), ok or its problems, and what you pointed at: a piece (`<board>#game`) and everything about it (where it's written, its setup as the app has it, its state, what can be done now, where each part is drawn); a board, each piece named, one line per piece and its script; a lesson, thumbnails; a chapter or book, a check of every board. With steps (taps and drags by name, each once the board has come to its end or `during` a line), on one version: what each step set off and changed, and whether the board was passed, with a picture before | after. Every call starts afresh: to go on, send the steps again with more ([platform/docs/seeing-boards.md](platform/docs/seeing-boards.md));
  - `affected`: every piece a change can reach (`content/<book>/<chapter>/<lesson>/<board>#piece`, rolled up to any depth), from what the build recorded and who uses what in the code ([platform/docs/reach.md](platform/docs/reach.md)); ask it before changing shared code, and with `diff: true` after. A fixer's tool; the reviewer asks `changes` (what changed since each board was reviewed), and only the reviewer passes a board;
  - `comments` (read) and `comment` (write): the only way to read and write threads. Your connection's token makes you a fixer; the `reviewer` subagent (`.claude/agents/reviewer.md`) connects with the reviewer's token. Each connection is shown only what its role may do (platform/docs/comments.md).

  For people and agents alike, the same boards are at `?dev&at=content/<book>/<chapter>/<lesson>` in the learner app's dev server; add `&play` and use them in a browser as a student would (Cursor's browser, or a browser MCP). Every piece carries `data-source="content/…:line"`, and Alt-click opens the line.
- **In the editor**, the Chalk extension (`platform/editor`, install `chalk-editor.vsix`) previews whatever file or folder is open as the student sees it (book screen, chapter path, lesson boards), follows the cursor, and lets the person pick a piece to send to you.
- **Reviews:** when the person says "apply review <id>", use `apply-review`: one plan agreed in chat, a plan line and an answer on every thread, commit after their yes.
- **Threads** are about the work, not part of it, so they live under `authoring/`: `authoring/books/<book>/<chapter>/comments.yaml`, or `authoring/props/<package>/comments.yaml` for one on a prop; **reviews** in `authoring/reviews/<id>.yaml`. Both are written only through the one writer ([platform/docs/comments.md](platform/docs/comments.md)). Never edit them by hand. Only the person closes a thread.
- Approving a planning file is the person's gate (the editor's Chalk tree, through the dev server, writes `approved: <commit>`). Never approve one yourself.
- **Commit only what the person has seen and is happy with.** Finish, show it, wait for their yes, then commit.

## Code work

Read [platform/docs/glossary.md](platform/docs/glossary.md) (use its names), [board-model.md](platform/docs/board-model.md), [architecture.md](platform/docs/architecture.md) and [code-conventions.md](platform/docs/code-conventions.md).

- A prop's variables change only by its own rules, on its actions; time is the board's queue ([board-model.md](platform/docs/board-model.md)).
- New prop: in `library/props/<name>`, following [making-a-prop.md](platform/docs/making-a-prop.md), with one line in `library/registry/src/index.ts`.
- A board shape used twice goes to `library/patterns/`.
- Drawing: `@chalk/draw` only ([drawing.md](platform/docs/drawing.md)). Art: [making-art.md](platform/docs/making-art.md).
- New content: [writing-content.md](platform/docs/writing-content.md). `pnpm build-content` must pass. Never edit or reuse an `id`.
- **One renderer.** Studio tooling never draws a board itself. Preview, screenshots and checks all go through the app's player.
- `tmp/` is old code: don't import from it or edit it.
- Done means `pnpm check` passes. It only redoes what a change could affect (type checks, tests and chapters are skipped when nothing they read changed); `pnpm check --force` redoes everything.
