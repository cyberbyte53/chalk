# Comments

Everything said about content goes in one place: the person's comments, a reviewer agent's findings, an agent's questions, decisions and proposals, what a change broke, feedback given in an agent's chat. Each is a **thread**: someone said something about a place, and it waits on someone. Anyone starts one; what it is follows from who started it (`by`, `role`). Each thread keeps whose turn it is (`turn`), and **whoever opened it closes it**. There is no hand-over: the person's open comments are what the agent works through next.

```text
authoring/books/<book>/<chapter>/comments.yaml   threads on a chapter's boards (and its planning files)
authoring/props/<package>/comments.yaml          threads on a prop, wherever it is used
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
- **`board`**: the board, by its build path. Its address is `content/<board>` (with `#<target>` for what on it): open it at `?dev&at=content/<board>`, or `show` it. Absent for a thread on a planning file (then `source` points at the file and line, `authoring/books/<book>/<chapter>/flow.md:12`, and `quote` has the exact words).
- **`target`**: what was picked on the board, by address: the piece's name, then the groups and the part, joined by `/` (`which/option`). Absent for the whole board. If the board changes and the address no longer finds anything, the preview shows the thread as detached.
- **`prop`**: the prop's type, for a thread on a prop (see below).
- **`source`**: the file and line the piece was written at, from `build/sources.json`.
- **`snapshot`**: what the piece showed when the thread was started. **`commit`**: the commit it was started on.
- **`turn`**: whose turn it is while it is open, planned or ready: a role, `person`, `fixer` or `reviewer`. Absent once closed or withdrawn.
- **`weight`**: on a reviewer's finding (required when it starts one): `must` (the fixer fixes it) or `consider` (the fixer decides, and says what it did in its reply). Older threads have none.
- **`options`**: on an agent's question to the person (`ask`, below): two to four, each a `label` and `why`, the agent's pick first. His answer is a reply: an option's label, or his own words.
- **`from`**: `chat` for feedback the person gave in an agent's chat, filed in their name.
- **`changed`**: the files its fix changed, recorded when it became ready: what git says differs from the commit its plan was written at (each `planned` message keeps that commit), committed or not, and files made since. A second fix, planned again, records its own.
- **`reaches`**: what those changes reach, worked out at the same time: how many pieces and boards, and the lessons they are in, or every board and why ([reach.md](reach.md)).
- **`messages`**: everything written on it since, oldest first. A message may move the thread's **`status`**; the last message that moved it to `planned` is its plan.

## Status

1. **open**: being talked about. The person's words on a planned, ready or closed thread send it back here.
2. **planned**: a fixer wrote its plan, after the person agreed to the plan in chat.
3. **ready**: done, rendered and checked; the message says what changed.
4. **closed**: settled, by whoever opened it (the person, a reviewer or a fixer), once it is back on their turn; the person may close any thread.
5. **withdrawn**: taken back by the person, or by the agent that started it when it became moot (a question settled in chat); its messages are kept as history.

**Whose turn it is** is kept on the thread (`turn`), and every view reads that one field (`waitsOn` in comments.ts; the dev server gives it out as `waitsOn`). Every write sets it (`turnAfter`): **ready goes back to whoever opened the thread** (the person checks his comment's fix, a reviewer its finding's, a fixer its own proposal's), to close it or send it back; planned is the fixer's; the person's words and a reviewer's are the fixer's to answer; a fixer's words without a move (a question, a reason, what it decided on a consider) are the reviewer's on a reviewer's finding, else the person's. An `ask` is always the person's. The writer may say it instead (`turn`). A thread written before turns were kept gets its turn worked out once, when read. Nothing is ever hidden by turn: the editor's Threads list opens with **Your turn**, then **Agents' turn**; a board's threads show the live ones beside it and fold the settled ones into one line; a thread on a planning file also shows in the file, on the words it is about (VS Code's comments): reply or close it there, or start one with ⌥⌘/ on selected words or the + in the margin.

Approving a planning file needs every thread on it closed or withdrawn.

## Who may do what

Everyone who writes is a participant with a role: the **person** (you), a **fixer** (the agent doing the work), a **reviewer** (an agent reviewing). The writer checks every write against two tables (`MOVES` and `ACTS` in comments.ts), so a rule holds whatever an agent's prompt says.

Status moves:

| Move | person | fixer | reviewer |
|---|---|---|---|
| no move (just a message) | ✅ | ✅ | ✅ |
| → open (reopen) | ✅ | | |
| open or planned → planned | | ✅ | |
| ready → planned (a fix sent back: the fixer's turn) | | ✅ | |
| planned → ready | | ✅ | |
| → closed | ✅ any | own, open or ready, on its turn | own, open or ready, on its turn |
| → withdrawn | ✅ | own, open or planned | own, open |

Other acts:

| | person | fixer | reviewer |
|---|---|---|---|
| Start a thread | ✅ | ✅ (and `from: chat`) | ✅ |
| Start a finding | | | ✅ with its weight |
| Ask the person (`ask`) | | ✅ | ✅ |
| Delete a thread | own, untouched | | |
| Re-point a thread whose place is gone | ✅ | ✅ | |

Also: a thread can't become ready while a reviewer's message is the last word on it (the fixer answers first). What's wrong with a thread's own fix is said **on that thread**; something its change broke **elsewhere** is a new thread there, naming the thread in its words. A thread someone else wrote on can't be deleted, only withdrawn.

**Each agent holds one role, and is shown only what it may do.** This is the standard shape for MCP: one server, every caller identified by its token, the server deciding what that caller sees and may do.

- The person writes through the preview and the editor.
- Agents use **one endpoint**, `http://127.0.0.1:5174/mcp`: the chalk MCP service (`platform/studio/src/mcp/main.ts`, `http.ts`). Each connection sends a bearer token, and the token gives its role. Nobody picks a role per call.
- Where it listens and who may connect are settings: `CHALK_MCP_HOST` (default `127.0.0.1`, unreachable from the network), `CHALK_MCP_PORT` (5174), `CHALK_MCP_ALLOW` (addresses, or `*`; default this machine), `CHALK_TOKENS`. The same service can run on a server by changing them.
- Development tokens are one per role (`chalk-dev-fixer`, `chalk-dev-reviewer`, in `http.ts`; `CHALK_TOKENS` to set others). The shared configs (`.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`) start the **relay** (`platform/studio/src/mcp/connect.ts`) over stdio with the fixer's token (`CHALK_TOKEN`). The **`reviewer` subagent** (`.claude/agents/reviewer.md`) starts it with the reviewer's token and has none of the fixer's tools. Without subagents, a reviewer is a chat whose config sets `CHALK_TOKEN` to the reviewer's. `CHALK_NAME` (or the `x-chalk-name` header) names an agent in threads.
- Each connection gets its own session, showing only the tools its role uses; its `comment` tool offers only the status moves its role may make (from the same `MOVES` table). An agent can't pick what it never sees; the writer still checks every call.
- **Nothing to start by hand.** The relay starts the service if nothing answers (once per machine), then passes every call through. The service runs under `tsx watch`, so it restarts when its code changes; the relay connects again and sends the call again, so agents don't notice (a `comment` write cut off mid-call isn't resent: it says so). The relay gives its agent an id (`x-chalk-agent`) that keys the agent's page for drawing boards, so two agents with one token never share a board. `pnpm mcp`, `pnpm dev` and the editor start the same service, the same way (`platform/studio/start.mjs`). Its output is in `node_modules/.cache/chalk-studio.log`.

What this doesn't stop: on a laptop the tokens sit in config files, so anything on the machine can read them and call the dev server, and an agent with a shell can edit the files (the reader catches a broken file the next time it reads it). Closing that means the same endpoint on the Chalk server, with tokens from sign-in.

## The person's comments are the hand-over

In the editor's preview, pick a piece (`c`): a box opens next to it; type, press ⌘↵, and a thread is started. Reply on any thread under its board, or on a planning file's words. Nothing is handed over: the agent works through the threads on its turn (`comments` with `unanswered: true`), the person's open comments among them, with the `apply-comments` skill.

## Ask: an agent's question, with options

When an agent is stuck or at a real decision, it asks the person with the `ask` tool, never in prose: `ask({ question, options: [{ label, why }], at, quote? })`, two to four options in order of recommendation (the first is its pick), pinned where it applies (`at`: a board, a piece, a prop, or a planning file, with `quote` for its words or without for the whole file). Either agent may ask. It is a thread with `options`, always on the person's turn. The preview's thread card and the open threads' page show the options as buttons and a box for his own words; on a planning file, VS Code's comment shows each option as a link, and the reply box takes his words. A button posts its label as his reply, through the one writer like any reply; the thread goes to the fixer's turn, and `comments` says which option he picked.

## Watching

- **Threads**, at the top of the editor's Chalk tree: every open thread, yours first, then the agents', with Reply, Close, Withdraw (platform/editor/README.md).
- **The open threads' page:** click Threads in the Chalk tree, or open `?dev&threads` (`&thread=<id>` opens at one). One page, every thread not yet settled, yours first, each a fold: what was said (an ask's options as buttons) and every message since, then its board as it is now, drawn live with the piece outlined; Reply, Close, Withdraw, and Open board (which comes back here). Fold all, Unfold all, Close all ready at the top.
- Under each board in the preview: its threads, live, each a card until tapped (what was said, the latest answer); open, the whole thread, with the plan, the messages and the files changed; closed ones fold away as the board's history.
- **`?dev&activity`** (or `f` in the preview): everything written, newest first, across every board: who started or asked what, every message and move. A line opens its board.

## The tools (chalk MCP)

- **`comments`** reads. `at` (threads at or under an address: a chapter, a board, a prop, or a planning file or folder, `authoring/books/…`) and `unanswered` (what waits on the caller's role) filter. The threads still open (open, planned, ready) come in full, each saying whose turn it is, a finding's weight, an ask's options and the one he picked; settled ones (closed, withdrawn) are counted, read with `closed: true`, and `id` reads any one thread in full. An answer grows with the work open, not with history (lesson 1's: 129 KB before, 18 KB now).
- **`ask`** starts an agent's question to the person, with its options (above).
- **`comment`** writes, one or many at once. With `id`: write on that thread, maybe with a `status` move. With `at` (an address: a board or something on it, `content/…#piece/part`, a prop wherever it is used, `library/props/<package>/<type>`, or a planning file, `authoring/books/<book>/<chapter>/flow.md`, with `quote`: the exact words), and `from`, `turn`: start a thread (a reviewer's, with its `weight`); a fixer's `plan` writes its plan on it at once. With `id` and `at`: re-point that thread, its place being gone (the text says where it went and why). Messages come back whole, never cut. Starting a thread where one was settled (the same board and target, or prop and target), the answer names it with its last words, at most three: what was decided comes up when the point may be raised again. Agents never see file paths; the writer finds the file from the id or the address.

## A thread whose place is gone

A board renamed, a piece merged, a prop removed, a planning file's words rewritten: an open or planned thread can be left pointing at nothing. `pnpm check`'s threads step (after the content build, `platform/studio/src/thread-places.ts`) fails on each, and the fixer either **re-points** it (`comment` with its `id` and its new `at`; the writer adds "moved from … to …: <why>" to it, and moves it to another chapter's file if it must; the person or a fixer may) or **answers** it (ready: "removed: the dice game is text now"). Closed and withdrawn threads are history and need nothing. A piece's parts aren't checked: only drawing a board says what parts it has.

## Threads on planning files

The planning files (`brief.md`, `objectives.md`, `flow.md`, `props.md`: [authoring-pipeline.md](authoring-pipeline.md)) take threads like the plan did: on the exact words (`quote`), with the line they were at (`source: authoring/books/<book>/<chapter>/flow.md:12`), filed in the chapter's comments.yaml. In the editor, select the words and run "Chalk: Comment on the selected words"; an agent with `comment`. An agent's question at a gate is such a thread, on the words it is about: answered where everything else is, never left in a section someone forgot to empty.

## Threads on a prop

In the preview's pick mode (`c`) a click takes the finest thing under the pointer: a part of a prop, else the piece, else the whole board, and the label says which. A pick on a prop or one of its parts on a board (any prop but the basics: words, choices and buttons are the lesson's own) asks what it is about: **this board** (a board's thread, fixed in the lesson) or **the prop, everywhere** (filed in the prop package's comments.yaml with `prop`, and still `board`, `target` and `source` for the board it was seen on; shown under every board that places the prop and on the prop's own page; fixed in the prop, through its definition, with `affected` listing every piece the fix reaches). On a prop's own page (`?dev&at=library/props/<package>/<type>`) every pick is the prop's, with no board. A prop's thread's address is the prop's, with its part after `#` (`library/props/primes/stickMeasure#piece`).

## Where a piece's line comes from

The build records where each prop was placed, from the call stack when `place(...)` runs (`platform/packages/author/src/site.ts`): the lesson's line when there is one, else the first frame inside `content/`. It writes them to `build/sources.json`, and every frame to `build/reach.json` ([reach.md](reach.md)); neither is published. The preview puts them on the page as `data-source="content/…:42"` on every piece, so an editor's browser, Cursor's design mode or an agent pointing at a piece knows the line. Alt-click a piece in the preview to open that line.
