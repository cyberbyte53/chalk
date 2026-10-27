# Comments and reviews

Everything said about content goes in one place: the person's comments, a reviewer agent's findings, what a change broke, feedback given in an agent's chat. Each is a **thread**; a **review** is one participant's sitting, handed to another.

```text
content/<book>/<chapter>/comments.yaml     threads on a chapter's boards (and its plan)
library/props/<package>/comments.yaml      threads on a prop, wherever it is used
reviews/<id>.yaml                          one review: the threads it hands over
```

They are versioned with the content they are about. **One writer** (`platform/studio/src/comments.ts`) makes every change, and checks it against what the writer's role may do. The preview, the editor extension and the chalk MCP tools all reach it through the dev server (`/dev-review`). Never edit the files by hand: if one is broken, the reader names the entry and every write is refused until it is fixed.

The dev server is one per repo, on port 5173 (`CHALK_DEV_PORT` to change it), and runs the content rebuild on save too. The editor and the MCP start it if it isn't running.

## A thread

```yaml
- id: cmvpi4adan2w
  label: comment
  status: ready
  by: you
  role: person
  createdAt: 2026-10-26T16:59:10.078Z
  board: class10-maths/real-numbers/division-lemma/story
  target: last
  source: content/class10-maths/real-numbers/division-lemma/overview.ts:33
  snapshot: "Two rounds are given and 8 sweets are left. How many more rounds can Riya give? 2 1 0"
  commit: ec00c1a…
  text: questions can be framed better
  changed: [content/class10-maths/real-numbers/division-lemma/overview.ts]
  messages:
    - by: fixer
      role: fixer
      at: …
      text: ask about the box, not the rounds
      status: planned
    - by: fixer
      role: fixer
      at: …
      text: "reworded: 8 sweets in the box, 6 friends, how many more times can everyone get one"
      status: ready
```

- **`label`**: `comment` (the person's, or a teacher's), `finding` (a reviewer's, about something it saw), `regression` (something a change broke).
- **`by`, `role`**: who started it.
- **`board`**: the board, by its build path. Open it at `?dev&board=<board>`, or with `render_board`. Absent for a thread on a plan (then `source` points at `plan.md` and `quote` has the exact words).
- **`target`**: what was picked on the board, by address: the piece's name, then the groups and the part, joined by `/` (`which/option`). Absent for the whole board. If the board changes and the address no longer finds anything, the preview shows the thread as detached.
- **`prop`**: the prop's type, for a thread on a prop (see below).
- **`source`**: the file and line the piece was written at, from `build/sources.json`.
- **`snapshot`**: what the piece showed when the thread was started. **`commit`**: the commit it was started on.
- **`about`**: another thread this one is about. A regression names the thread whose change broke it.
- **`from`**: `chat` for feedback the person gave in an agent's chat, filed in their name.
- **`changed`**: the files changed for it, recorded from git when it became ready.
- **`messages`**: everything written on it since, oldest first. A message may move the thread's **`status`**; the last message that moved it to `planned` is its plan.

## Status

1. **open**: waiting for a fixer. The person's words on a planned, ready or closed thread send it back here.
2. **planned**: a fixer wrote its plan, after the person agreed to the plan in chat.
3. **ready**: done, rendered and checked; the message says what changed. Waiting for the person.
4. **closed**: the person is happy.
5. **withdrawn**: the person took it back; its messages are kept as history.

## Who may do what

Everyone who writes is a participant with a role: the **person** (you), a **teacher** (later), a **fixer** (the agent applying a review), a **reviewer** (an agent reviewing). The writer checks every write against two tables (`MOVES` and `ACTS` in comments.ts), so a rule holds whatever an agent's prompt says.

Status moves:

| Move | person | teacher | fixer | reviewer |
|---|---|---|---|---|
| no move (just a message) | ✅ | ✅ | ✅ | ✅ |
| → open (reopen) | ✅ | ✅ own | | |
| open or planned → planned | | | ✅ | |
| planned → ready | | | ✅ | |
| → closed | ✅ | ✅ own | | |
| → withdrawn | ✅ | ✅ own | | |

Other acts:

| | person | teacher | fixer | reviewer |
|---|---|---|---|---|
| Start a thread | comment | comment | comment (from chat), regression | finding, regression |
| Delete a thread | own, untouched, never handed over | the same | | |
| Hand over a review | ✅ | ✅ | ✅ | ✅ |

Also: a thread can't become ready while a regression about it is open or planned, or while a reviewer's message is the last word on it (the fixer answers first). What's wrong with a thread's own fix is said **on that thread**; a regression is something its change broke **elsewhere**, so the writer refuses a regression on the thread's own piece. A thread that has been handed over can't be deleted, only withdrawn, so a review never points at nothing.

**Each agent holds one role, and is shown only what it may do.** This is the standard shape for MCP: one server, every caller identified by its token, the server deciding what that caller sees and may do.

- The person writes through the preview and the editor.
- Agents use **one endpoint**, `http://127.0.0.1:5174/mcp`: the chalk MCP service (`platform/studio/src/mcp/main.ts`, `http.ts`). Each connection sends a bearer token, and the token gives its role. Nobody picks a role per call.
- Where it listens and who may connect are settings: `CHALK_MCP_HOST` (default `127.0.0.1`, unreachable from the network), `CHALK_MCP_PORT` (5174), `CHALK_MCP_ALLOW` (addresses, or `*`; default this machine), `CHALK_TOKENS`. The same service can run on a server by changing them.
- Development tokens are one per role (`chalk-dev-fixer`, `chalk-dev-reviewer`, in `http.ts`; `CHALK_TOKENS` to set others). The shared configs (`.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`) connect as a **fixer**. The **`reviewer` subagent** (`.claude/agents/reviewer.md`) connects with the reviewer's token and has none of the fixer's tools. Without subagents, a reviewer is a chat whose config uses the reviewer's token. `x-chalk-name` names an agent in threads.
- Each connection gets its own session, showing only the tools its role uses; its `comment` tool offers only the status moves and labels its role may use (from the same `MOVES` and `ACTS` tables). An agent can't pick what it never sees; the writer still checks every call.
- Start it with `pnpm mcp` (or `pnpm dev`, which runs it with the app and the API, or the editor). It starts the dev server itself when a tool needs it.

What this doesn't stop: on a laptop the tokens sit in config files, so anything on the machine can read them and call the dev server, and an agent with a shell can edit the files (the reader catches a broken file the next time it reads it). Closing that means the same endpoint on the Chalk server, with tokens from sign-in.

## Reviews: one sitting, handed over in one line

A **sitting** is every thread a participant started or wrote on since their last handover, in the order they did: new comments, and old threads they replied to (reopened). Closing or withdrawing alone doesn't count.

In the editor's preview, pick a piece (`c`), type, press Enter: a thread is started. Reply on any thread under its board. When you're done, **Copy for agent (n)** hands the sitting over: the writer writes `reviews/<id>.yaml` and copies `apply review <id> (n threads)`. Paste it into the agent's chat; the agent reads it with `comments` (`review: "<id>"`) and follows the `apply-review` skill.

```yaml
id: 20261026-1734
by: you
role: person
at: 2026-10-26T17:34:00.000Z
threads:
  - file: content/class10-maths/real-numbers/comments.yaml
    id: cmvpi4adan2w
```

Reviews point to threads; threads don't point back. A thread can be in several reviews (handed over, reopened, handed over again); each review keeps it as history. How a review stands is worked out from its threads, never stored: done when every thread is ready, closed or withdrawn. A reviewer agent's pass is a review too: it hands over when it finishes (`comment` with `handover: true`).

## Watching

- **Chalk Reviews**, in the editor's sidebar: every review and its threads in one place, with Reply, Close, Withdraw and Copy for agent (platform/editor/README.md).
- **Preview a review:** select a file in `reviews/` (or open `?dev&review=<id>`): the boards its threads are on, with only its threads beside them. The `reviews` folder (`?dev&reviews`) lists every review.
- Under each board in the preview: its threads, live, each a card until tapped (what was said, the latest answer); open, the whole thread, with the plan, the messages and the files changed; closed ones fold away as the board's history.
- **`?dev&activity`** (or `f` in the preview): everything written, newest first, across every board: who started what, every message and move, every review handed over. `&review=<id>` keeps to one review. A line opens its board.

## The tools (chalk MCP)

- **`comments`** reads. `review` (an id, or `"latest"`): exactly the threads it handed over, in order, with how it stands. `board` (a path prefix), `prop`, `unanswered` (open or planned) filter.
- **`comment`** writes, one or many at once. With `id`: write on that thread, maybe with a `status` move. With `board` (and `target`, `prop`, `label`, `about`, `from`): start a thread. `handover: true` hands the connection's sitting over. Agents never see file paths; the writer finds the file from the id or the board.

## Threads on a prop

In the preview's pick mode (`c`) a click takes the finest thing under the pointer: a part of a prop, else the piece, else the whole board, and the label says which. A pick on a prop or one of its parts (any prop but the basics: words, choices and buttons are the lesson's own) is about the prop, wherever it is used, and is filed in the prop package's comments.yaml with `prop`, and still `board`, `target` and `source` for the board it was seen on. The preview shows it under every board that places the prop. Whoever handles it decides where the fix goes: the prop's code (then `affected` lists every place to check), or just how that one board uses it.

## Where a piece's line comes from

The build records where each prop was placed: the first stack frame inside `content/` when `b.prop(...)` runs (`platform/packages/author/src/site.ts`). It writes them to `build/sources.json`, which is never published. The preview puts them on the page as `data-source="content/…:42"` on every piece, so an editor's browser, Cursor's design mode or an agent pointing at a piece knows the line. Alt-click a piece in the preview to open that line.

## Moving files over

Files from before threads and reviews (`kind`, `causedBy`, `plan`, `thread`, a `review` stamp on each comment) are moved once with `cd platform/studio && npx tsx --tsconfig ../../tsconfig.base.json src/comments-migrate.ts` (`--dry` to only report). It turns stamps into `reviews/<id>.yaml` files and leaves entries already in today's shape alone.
