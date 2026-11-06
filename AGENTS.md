# Agent notes

Three layers, importing one way (`pnpm boundaries` checks):

```text
content/    the books: book → chapter → lesson (overview pages + question bank). Changes daily.
library/    props and board patterns, shared across books.
platform/   the fixed code: packages (the core), apps, studio tooling, deploy, engineering docs.
```

## Content work

- **How we make lessons is `authoring/guide.md`.** Read it always (its principles, how the person judges, lessons to copy; examples in `authoring/guide/`). Then read only the guide for your step in `authoring/taste/guides/` (`plan.md`, `pages.md`, `questions.md` or `props.md`). `authoring/taste/checks.md` is enforced by the build, and `authoring/taste/reviewer.md` is for reviewers.
- **The steps are skills** in `.agents/skills/` (`.claude/skills` points there). In order:
  1. `plan-chapter`: `plan.md` (the intent, the one file the person approves, in the editor's Chalk tree) and `boards.md` (each board and question family in detail, never approved) ([platform/docs/authoring-pipeline.md](platform/docs/authoring-pipeline.md)).
  2. `build-props`: the props `plan.md` names, each new or changed prop's definition first, then its build.
  3. `build-lesson`: the first lesson alone, then the rest.
  4. `self-review`, run by a fresh agent.
  5. The person's review.
  6. `apply-comments`.

  When a chat with the person ends, run `wrap-up`: corrections that could recur become checks, examples or guide lines, with the person's yes.

  Each step writes a note to the chapter's `runs/`. A chapter's plan, run notes and source are in `authoring/books/<book>/<chapter>/`, apart from its built content.
- **Look at what you make.** The chalk MCP (one service, `127.0.0.1:5174/mcp`; the configs in `.cursor/mcp.json`, `.vscode/mcp.json`, `.mcp.json` start a relay that starts the service if it isn't running and reconnects when it restarts, so there's nothing to start by hand) gives you:
  - `show`: a board drawn by the real learner app in Chrome, from its start, after the steps if any. Without steps, it plays on its own to its end and is checked in English and Hindi on the three check screens: a picture of each version (readable as it arrives), ok or its problems, and what you pointed at: a piece (`<board>#game`) and everything about it (where it's written, its setup as the app has it, its state, what can be done now, where each part is drawn); a board, each piece named, one line per piece and its script; a lesson, thumbnails; a chapter or book, a check of every board. With steps (taps and drags by name, each once the board has come to its end or `during` a line), on one version: what each step set off and changed, and whether the board was passed, with a picture before | after. Every call starts afresh: to go on, send the steps again with more ([platform/docs/seeing-boards.md](platform/docs/seeing-boards.md));
  - `affected`: every piece a change can reach (`content/<book>/<chapter>/<lesson>/<board>#piece`, rolled up to any depth), from what the build recorded and who uses what in the code ([platform/docs/reach.md](platform/docs/reach.md)); ask it before changing shared code, and with `diff: true` after. A fixer's tool; the reviewer asks `changes` (what changed since each board was reviewed), and only the reviewer passes a board;
  - `comments` (read), `comment` (write) and `ask` (a question to the person, with two to four options, your pick first): the only way to read and write threads. Your connection's token makes you a fixer; the `reviewer` subagent (`.claude/agents/reviewer.md`) connects with the reviewer's token. Each connection is shown only what its role may do (platform/docs/comments.md).

  For people and agents alike, the same boards are at `?dev&at=content/<book>/<chapter>/<lesson>` in the learner app's dev server; add `&play` and use them in a browser as a student would (Cursor's browser, or a browser MCP). Every piece carries `data-source="content/…:line"`, and Alt-click opens the line.
- **In the editor**, the Chalk extension (`platform/editor`, install `chalk-editor.vsix`) previews whatever file or folder is open as the student sees it (book screen, chapter path, lesson boards), follows the cursor, and lets the person pick a piece to send to you.
- **The person's comments:** nothing is handed over; his open comments are the hand-over. When he asks you to apply or handle them, use `apply-comments`: the threads on your turn, one plan agreed in chat, a plan line and an answer on every thread, commit after his yes.
- **Asking the person:** when you're stuck or at a real decision, use `ask` on the thing it is about, never a question in prose.
- **Threads** are about the work, not part of it, so they live under `authoring/`: `authoring/books/<book>/<chapter>/comments.yaml`, or `authoring/props/<package>/comments.yaml` for one on a prop, written only through the one writer ([platform/docs/comments.md](platform/docs/comments.md)). Never edit them by hand. Whoever opened a thread closes it (a fixer or a reviewer only its own, once back on its turn); the person may close any. A reviewer's finding has a weight: must, or consider (you decide, and say what you did).
- Approving a chapter's `plan.md` is the person's gate (the editor's Chalk tree, through the dev server, writes `approved: <commit>`). Never approve it yourself.
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
