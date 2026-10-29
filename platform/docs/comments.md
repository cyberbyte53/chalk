# Comments and reviews

Everything said about content goes in one place: the person's comments, a reviewer agent's findings, an agent's questions, decisions and proposals, what a change broke, feedback given in an agent's chat. Each is a **thread**: someone said something about a place, and it waits on someone. Anyone starts one; what it is follows from who started it (`by`, `role`). Each thread keeps whose turn it is (`turn`). A **review** is one participant's sitting, handed to another.

```text
authoring/books/<book>/<chapter>/comments.yaml   threads on a chapter's boards (and its plan)
authoring/props/<package>/comments.yaml          threads on a prop, wherever it is used
authoring/reviews/<id>.yaml                      one review: the threads it hands over
```

They are versioned with the content they are about. **One writer** (`platform/studio/src/comments.ts`) makes every change, and checks it against what the writer's role may do. It runs in the studio service (`platform/studio/src/mcp/main.ts`): the chalk MCP tools call it in that process, and the preview and the editor extension reach it at `/dev-review` through the dev server, which passes `/dev-*` on. Never edit the files by hand: if one is broken, the reader names the entry and every write is refused until it is fixed.

**Two processes, one way to start them.** The studio service (127.0.0.1:5174: threads, approvals, plan state, the content rebuild on save, the chalk MCP) is started only through `platform/studio/start.mjs`, by whoever needs it first: the editor, an agent's connection, the dev server when a page asks for threads, `pnpm dev`. On start it makes sure of the dev server (port 5173, `CHALK_DEV_PORT`: the app and its preview pages). The dev server runs none of the studio's code. If the studio service can't come up, the page or the editor shows the last lines of its log (`node_modules/.cache/chalk-studio.log`); it watches every studio file, so fixing the code brings it back.

## A thread

```yaml
- id: cmvpi4adan2w
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

- **`by`, `role`**: who started it: the person (a comment), a reviewer (a finding), a fixer (a question, a decision, a proposal; or, `from: chat`, the person's words filed in their name).
- **`board`**: the board, by its build path. Its address is `content/<board>` (with `#<target>` for what on it): open it at `?dev&at=content/<board>`, or `look` at it. Absent for a thread on a planning file (then `source` points at the file and line, `authoring/books/<book>/<chapter>/flow.md:12`, and `quote` has the exact words).
- **`target`**: what was picked on the board, by address: the piece's name, then the groups and the part, joined by `/` (`which/option`). Absent for the whole board. If the board changes and the address no longer finds anything, the preview shows the thread as detached.
- **`prop`**: the prop's type, for a thread on a prop (see below).
- **`source`**: the file and line the piece was written at, from `build/sources.json`.
- **`snapshot`**: what the piece showed when the thread was started. **`commit`**: the commit it was started on.
- **`turn`**: whose turn it is while it is open, planned or ready: `person` or `agent`. Absent once closed or withdrawn.
- **`from`**: `chat` for feedback the person gave in an agent's chat, filed in their name.
- **`changed`**: the files changed for it, recorded from git when it became ready.
- **`reaches`**: what those changes reach, worked out at the same time: how many pieces and boards, and the lessons they are in, or every board and why ([reach.md](reach.md)).
- **`messages`**: everything written on it since, oldest first. A message may move the thread's **`status`**; the last message that moved it to `planned` is its plan.

## Status

1. **open**: being talked about. The person's words on a planned, ready or closed thread send it back here.
2. **planned**: a fixer wrote its plan, after the person agreed to the plan in chat.
3. **ready**: done, rendered and checked; the message says what changed.
4. **closed**: the person is happy. Only the person closes.
5. **withdrawn**: taken back by the person, or by the agent that started it when it became moot (a question settled in chat); its messages are kept as history.

**Whose turn it is** is kept on the thread (`turn`), and every view reads that one field (`waitsOn` in comments.ts; the dev server gives it out as `waitsOn`). Every write sets it (`turnAfter`): ready is the person's, planned the agent's; the person's words and a reviewer's are the agent's to answer; a fixer's question, decision or reason (a message without a move) is the person's. The writer may say it instead (`turn`): a reviewer's taste call, which only the person decides, starts as the person's. A thread written before turns were kept gets its turn worked out once, when read. Nothing is ever hidden by turn: the editor's Reviews list opens with **Your turn**, then **Agent's turn**, then the sitting, then **Past reviews** (folded); a board's threads show the live ones beside it and fold the settled ones into one line. A review stays in progress, and a handover adds to it, until every thread in it is closed or withdrawn, and a thread on a planning file also shows in the file, on the words it is about (VS Code's comments): reply or close it there, or start one with ⌥⌘/ on selected words or the + in the margin.

Approving a planning file needs every thread on it closed or withdrawn.

## Who may do what

Everyone who writes is a participant with a role: the **person** (you), a **fixer** (the agent doing the work), a **reviewer** (an agent reviewing). The writer checks every write against two tables (`MOVES` and `ACTS` in comments.ts), so a rule holds whatever an agent's prompt says.

Status moves:

| Move | person | fixer | reviewer |
|---|---|---|---|
| no move (just a message) | ✅ | ✅ | ✅ |
| → open (reopen) | ✅ | | |
| open or planned → planned | | ✅ | |
| planned → ready | | ✅ | |
| → closed | ✅ | | |
| → withdrawn | ✅ | own, open or planned | own, open |

Other acts:

| | person | fixer | reviewer |
|---|---|---|---|
| Start a thread | ✅ | ✅ (and `from: chat`) | ✅ |
| Delete a thread | own, untouched, never handed over | | |
| Re-point a thread whose place is gone | ✅ | ✅ | |
| Hand over a review | ✅ | ✅ | ✅ |

Also: a thread can't become ready while a reviewer's message is the last word on it (the fixer answers first). What's wrong with a thread's own fix is said **on that thread**; something its change broke **elsewhere** is a new thread there, naming the thread in its words. A thread that has been handed over can't be deleted, only withdrawn, so a review never points at nothing.

**Each agent holds one role, and is shown only what it may do.** This is the standard shape for MCP: one server, every caller identified by its token, the server deciding what that caller sees and may do.

- The person writes through the preview and the editor.
- Agents use **one endpoint**, `http://127.0.0.1:5174/mcp`: the chalk MCP service (`platform/studio/src/mcp/main.ts`, `http.ts`). Each connection sends a bearer token, and the token gives its role. Nobody picks a role per call.
- Where it listens and who may connect are settings: `CHALK_MCP_HOST` (default `127.0.0.1`, unreachable from the network), `CHALK_MCP_PORT` (5174), `CHALK_MCP_ALLOW` (addresses, or `*`; default this machine), `CHALK_TOKENS`. The same service can run on a server by changing them.
- Development tokens are one per role (`chalk-dev-fixer`, `chalk-dev-reviewer`, in `http.ts`; `CHALK_TOKENS` to set others). The shared configs (`.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`) start the **relay** (`platform/studio/src/mcp/connect.ts`) over stdio with the fixer's token (`CHALK_TOKEN`). The **`reviewer` subagent** (`.claude/agents/reviewer.md`) starts it with the reviewer's token and has none of the fixer's tools. Without subagents, a reviewer is a chat whose config sets `CHALK_TOKEN` to the reviewer's. `CHALK_NAME` (or the `x-chalk-name` header) names an agent in threads.
- Each connection gets its own session, showing only the tools its role uses; its `comment` tool offers only the status moves its role may make (from the same `MOVES` table). An agent can't pick what it never sees; the writer still checks every call.
- **Nothing to start by hand.** The relay starts the service if nothing answers (once per machine), then passes every call through. The service runs under `tsx watch`, so it restarts when its code changes; the relay connects again and sends the call again, so agents don't notice (a `comment` write cut off mid-call isn't resent: it says so). The relay gives its agent an id (`x-chalk-agent`) that keys the agent's page for drawing boards, so two agents with one token never share a board. `pnpm mcp`, `pnpm dev` and the editor start the same service, the same way (`platform/studio/start.mjs`). Its output is in `node_modules/.cache/chalk-studio.log`.

What this doesn't stop: on a laptop the tokens sit in config files, so anything on the machine can read them and call the dev server, and an agent with a shell can edit the files (the reader catches a broken file the next time it reads it). Closing that means the same endpoint on the Chalk server, with tokens from sign-in.

## Reviews: one sitting, handed over in one line

A **sitting** is every thread a participant started or wrote on since their last handover, in the order they did: new comments, and old threads they replied to (reopened). Closing or withdrawing alone doesn't count.

In the editor's preview, pick a piece (`c`): a box opens next to it; type, press ⌘↵, and a thread is started. Reply on any thread under its board. When you're done, **Copy for agent (n)** hands the sitting over: the writer writes `authoring/reviews/<id>.yaml` and copies `apply review <id> (n threads)`. Paste it into the agent's chat; the agent reads it with `comments` (`review: "<id>"`) and follows the `apply-review` skill.

```yaml
id: 20261026-1734
by: you
role: person
at: 2026-10-26T17:34:00.000Z
threads:
  - file: authoring/books/class10-maths/real-numbers/comments.yaml
    id: cmvpi4adan2w
```

Reviews point to threads; threads don't point back. How a review stands is worked out from its threads, never stored: done when every thread is ready, closed or withdrawn.

**One review in progress per person.** A handover while your last review isn't done adds to it and keeps its id: your new threads are appended, a reply on one of its threads is already in it, and the time is added to its `added` list. So a conversation on one thread stays one review, however many times it goes back and forth. A new review starts once the last one is done. A thread can still be in several reviews (replied to again after a later review began): each keeps it as history. A reviewer agent's pass is a review too: it hands over when it finishes (`comment` with `handover: true`).

## Watching

- **Chalk Reviews**, in the editor's sidebar: every review and its threads in one place, with Reply, Close, Withdraw and Copy for agent (platform/editor/README.md).
- **A review's page:** select a file in `authoring/reviews/`, click a review in Chalk Reviews, or open `?dev&review=<id>` (`review=sitting`: yours not handed over yet). One page, a list of the review's threads, each a fold: what was said and every message since, then its board as it is now, drawn live with the piece outlined; Reply, Close, Withdraw, and Open board (which comes back to the review). Fold all, Unfold all, Close all ready, Copy for agent at the top. The `reviews` folder (`?dev&reviews`) lists every review.
- Under each board in the preview: its threads, live, each a card until tapped (what was said, the latest answer); open, the whole thread, with the plan, the messages and the files changed; closed ones fold away as the board's history.
- **`?dev&activity`** (or `f` in the preview): everything written, newest first, across every board: who started what, every message and move, every review handed over. `&review=<id>` keeps to one review. A line opens its board.

## The tools (chalk MCP)

- **`comments`** reads. `review` (an id, or `"latest"`): exactly the threads it handed over, in order, with how it stands. `at` (threads at or under an address: a chapter, a board, a prop, or a planning file or folder, `authoring/books/…`) and `unanswered` (what waits on the agent) filter. Each thread says whose turn it is.
- **`comment`** writes, one or many at once. With `id`: write on that thread, maybe with a `status` move. With `at` (an address: a board or something on it, `content/…#piece/part`, a prop wherever it is used, `library/props/<package>/<type>`, or a planning file, `authoring/books/<book>/<chapter>/flow.md`, with `quote`: the exact words), and `from`, `turn`: start a thread; a fixer's `plan` writes its plan on it at once. With `id` and `at`: re-point that thread, its place being gone (the text says where it went and why). Messages come back whole, never cut. `handover: true` hands the connection's sitting over. Agents never see file paths; the writer finds the file from the id or the address.

## A thread whose place is gone

A board renamed, a piece merged, a prop removed, a planning file's words rewritten: an open or planned thread can be left pointing at nothing. `pnpm check`'s threads step (after the content build, `platform/studio/src/thread-places.ts`) fails on each, and the fixer either **re-points** it (`comment` with its `id` and its new `at`; the writer adds "moved from … to …: <why>" to it, and moves it to another chapter's file if it must; the person or a fixer may) or **answers** it (ready: "removed: the dice game is text now"). Closed and withdrawn threads are history and need nothing. A piece's parts aren't checked: only drawing a board says what parts it has.

## Threads on planning files

The planning files (`brief.md`, `objectives.md`, `flow.md`, `props.md`: [authoring-pipeline.md](authoring-pipeline.md)) take threads like the plan did: on the exact words (`quote`), with the line they were at (`source: authoring/books/<book>/<chapter>/flow.md:12`), filed in the chapter's comments.yaml. In the editor, select the words and run "Chalk: Comment on the selected words"; an agent with `comment`. An agent's question at a gate is such a thread, on the words it is about: answered where everything else is, never left in a section someone forgot to empty.

## Threads on a prop

In the preview's pick mode (`c`) a click takes the finest thing under the pointer: a part of a prop, else the piece, else the whole board, and the label says which. A pick on a prop or one of its parts on a board (any prop but the basics: words, choices and buttons are the lesson's own) asks what it is about: **this board** (a board's thread, fixed in the lesson) or **the prop, everywhere** (filed in the prop package's comments.yaml with `prop`, and still `board`, `target` and `source` for the board it was seen on; shown under every board that places the prop and on the prop's own page; fixed in the prop, through its definition, with `affected` listing every piece the fix reaches). On a prop's own page (`?dev&at=library/props/<package>/<type>`) every pick is the prop's, with no board. A prop's thread's address is the prop's, with its part after `#` (`library/props/primes/stickMeasure#piece`).

## Where a piece's line comes from

The build records where each prop was placed, from the call stack when `b.prop(...)` runs (`platform/packages/author/src/site.ts`): the lesson's line when there is one, else the first frame inside `content/`. It writes them to `build/sources.json`, and every frame to `build/reach.json` ([reach.md](reach.md)); neither is published. The preview puts them on the page as `data-source="content/…:42"` on every piece, so an editor's browser, Cursor's design mode or an agent pointing at a piece knows the line. Alt-click a piece in the preview to open that line.

## Moving files over

Files from before threads and reviews (`kind`, `causedBy`, `plan`, `thread`, a `review` stamp on each comment) are moved once with `cd platform/studio && npx tsx --tsconfig ../../tsconfig.base.json src/comments-migrate.ts` (`--dry` to only report). It turns stamps into `authoring/reviews/<id>.yaml` files and leaves entries already in today's shape alone.
