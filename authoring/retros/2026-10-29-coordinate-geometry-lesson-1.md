# Learnings: Class 9 Coordinate Geometry, lesson 1

The first chapter made from scratch through the pipeline, 28–29 October 2026.

## The goal

Our time goes to the pedagogy: how to introduce a topic, which interaction makes it click, bouncing ideas between us, with NCERT as the reference and not a rule. That takes iterations, and the iterations are the work: the fair ground becoming a dot on a notebook page was time well spent.

Everything around that work has two targets:

1. **No systematic errors.** Things that should never happen and cost the person's attention: a thread you can't see, a page that won't open, a tool that silently does nothing. Each one is fixed at its root, once, so it can't come back.
2. **A tight loop.** From the person's feedback to the person seeing the change, as short as it can be: the change, its check and its review take only as long as what actually changed.

Each fix below is the simplest one that removes a cause, not a check added on top of it.

The prompts and skills (how chapters are planned, how lessons are built) come after: once the systematic things hold, we iterate on them, keeping the rules that help and dropping the ones that don't.

## What worked

- `look` and `play` run the real app: picture, source line, state, and what each step changed. They found real bugs.
- The reviewer subagent caught what the builder missed.
- Questions done in the prop with `check()`: a new question in minutes, checked by the prop's state.
- The pipeline's gates kept the plan and the boards in step.

---

## 1. Systematic errors

### Threads the person couldn't see (four times)

`about` hid a proposal; the reviewer's taste threads waited on the agent; a ready thread blocked an approval and only a passing pop-up said why; the editor stopped refreshing after node_modules was wiped.

**Root cause.** Whose turn it is is inferred (from role, `about`, who spoke last, status), and the person's view is filtered by that inference (`waitsOn` in `platform/studio/src/comments.ts`). When the inference is wrong, the thread disappears.

**Fix.**
- Every thread names whose turn it is; whoever writes sets it. Nothing infers it.
- The person sees every thread that isn't closed, grouped by whose turn. Nothing is filtered away.
- `about` goes; "this broke because of thread X" is said in the text.
- Whatever blocks an approval is shown on the file in the tree, not in a pop-up.

### Editor and preview pages that didn't open

The panel's script died on a regex eaten by its template string; question families opened the app's home screen; the panel dropped a lesson's questions on reload.

**Root cause.** The editor keeps its own copies of what the app already knows: the address (the panel's `state.query` and the extension's `shown`), how an address is built (`queryFor`), which addresses the app routes (`app.tsx`). Copies drift, and each drift was a bug.

**Fix.**
- One owner: the app. The panel shows the app's page and keeps no address of its own; the app's one router takes every kind of address (`at=`, `source=`, reviews).
- The panel's script in its own file, not a template string.
- One test of that router: every kind of address opens its page, not the home screen.

### Tools that silently did nothing

`play` returned "nothing changed" for a tap on a button that isn't there; `comment` dropped a status move given with a re-point.

**Root cause.** A tool that couldn't do what was asked returns success.

**Fix.** One rule in the tool layer, for every tool: an action that changes nothing is an error that says why and what it can do instead ("no 'Check' in ask; its parts: ask/check").

### Agents guessing at what the person sees

Diagnosing "I can't see the thread" meant reading Cursor's storage and logs, and I still couldn't see the panel.

**Root cause.** The agent can't observe the person's editor.

**Fix.** With one owner (above), what the person sees is an app address, which `look` opens. The extension also writes its state (`.chalk/editor.json`: version, folder, last refresh, current address, errors).

### Mistakes a component could prevent

Units missing on axes, bold that didn't show in prompts, a pair or "5 cm" split across lines, Hindi words alone at a line end: each found by a reviewer reading screens, each a review round.

**Root cause.** Rules a component could enforce are left to people and reviewers.

**Fix.** Make the mistake impossible where it's made: the text renderer keeps a number with its unit and a pair together; a prop that shows a measure takes a unit and always shows it; prompts have one style. A check stays only for what no component can know (an answer inside its own prompt).

### Rituals done by hand

The long pipeline command; `npx -y pnpm@10.28.0 check` and searching for ✗; bumping, packaging and installing the editor.

**Fix.** Each is one command or tool: `pipeline` and `check` tools that return only what matters; `pnpm editor:install`.

---

## 2. The loop

### The reviewer re-reviews what didn't change

A change to one board meant reviewing the lesson; a prop change meant reviewing every board using it, even where nothing on screen changed.

**Root cause.** The gate is per lesson, and a board's `version` hashes its whole module and its props' whole packages, so it changes when the screen doesn't.

**Fix.** A fingerprint of what the student sees, per board: the text, parts, their state and layout that `look` and `play` read from the real app, in English and Hindi, on the check screens, before and after the board's witness steps. When the reviewer passes a board, its fingerprint is recorded. Next time each board is marked same screen or changed; the reviewer can keep an unchanged board in one line, or look again, and its choice is recorded. A board with a thread made ready since always gets a look. The gate is per board.

### Approving the plan again and again

Every wording fix in `flow.md` re-opened flow, then props: four or five approvals in a day.

**Root cause.** Approval is per file, but the person approves decisions, and the files are chained (props depends on flow).

**Fix.** One approval for the chapter's plan (`flow.md` and `props.md` together), once per round of changes. No chain.

### Questions limited to choices

NCERT's "how many?" and "how will you describe…?" became options that hand over the reasoning.

**Root cause.** A missing building block: the library can only answer by choosing or by doing in a prop.

**Fix.** Two answer props in `basics`: a typed answer (a number, a pair, a word; checked exactly, with notes for named wrong answers) and a written answer (a box, then a model answer and two or three points to tick; practice, not marked). Choice stays for real choices. The questions guide says which kind when.

### Decisions nobody was asked for

The lesson's glyph "4,5" was chosen by the builder alone; Riya and Aman, carried over from Class 10, live in one chapter's flow.

**Root cause.** The plan doesn't ask for everything the student will see, so some of it is improvised at build time; and decisions that span a book have no place above a chapter.

**Fix.** The plan names everything the student sees, at the level it applies to:
- a book file (`authoring/books/<book>/book.md`): recurring characters, places, timeline, picture style, props leaned on and avoided, language;
- the chapter's and each lesson's art and glyph, in `flow.md`, shown to the person as cards.

---

## 3. From reading the whole session back

A read-through of every person message over 27–29 October (about 180), ranked by messages lost. Most matches the causes above (threads: ~18 messages; editor bugs and blind patching: ~12; approval churn: ~15, eleven of them a bare "done" or "approved"). It found two causes the list above missed, and a set of the agent's own habits.

### The environment isn't guaranteed

A pnpm 8 run wiped node_modules mid-session (the start of the worst thread episode); the MCP server wasn't running three times and the person had to restart it; the dev server served old code until restarted by hand; the person was asked to Reload Window eleven times.

**Root cause.** `package.json` names pnpm 10.28.0, but nothing refuses another version; nothing starts or reloads the servers and the extension when their code changes.

**Fix.**
- The wrong pnpm refuses to run instead of rewriting the install (`engines` plus `engine-strict`).
- The dev server and the MCP restart themselves when their code changes; the extension reloads its own code after `pnpm editor:install`. The person never restarts or reloads anything.

### A new review for every pass or reply

Raised on 27 October ("we are creating new reviews every time we are replying to an existing thread"), not fixed, back on 29 October as "three reviewers".

**Root cause.** The same as threads: a review is a unit of the system's bookkeeping (a handover), shown to the person as if it were theirs. Fixed by section 1's threads fix: the person sees one list of what waits on them; a pass is a line inside a thread.

### The agent's habits

- **Questions in the agent's own words** ("helpers", "reveals", "the hybrid"): "So what do you mean by helper?", "I didn't get this". Ask as a concrete choice between two things the person can picture.
- **Long replies that end by asking permission**: half of the closing replies over 300 words, twelve ending "Shall I…?"; "just tell me yes or no". Short replies; act when the next step is clear.
- **Handing the person work a tool could do**: approve in the editor, Reload Window, paste the Output panel. Each one is a gap in the tools (sections 1 and 3).
- **Guessing instead of diagnosing**, asked about at least six times ("diagnose first", "root cause, not patches").
- **Skipping a process step** (self-review, twice): fixed by making it a gate the pipeline checks, not a sentence in a skill.

The habits are the agent's to change now (kept in its memory); the rest is the work below.

## What next

0. **Finish lesson 1** (the person): approve `props.md`, close the five ready threads, review the lesson as a whole.
1. **The environment holds itself up**: the wrong pnpm refuses; servers and the extension reload themselves. First, because a broken environment caused the worst episode and looks like every other bug.
2. **Threads**: whose turn is one stored fact, set by whoever writes; one list for the person, grouped by board, closed ones folded; a pass is a line in a thread, not a review; `about` goes; blockers shown where they block; the reviewer's instructions corrected; thread text shown formatted everywhere (line breaks, bullets, bold: the app prints it as one raw string today), and written one point per line with a short first line.
3. **Tools never fail silently**; `pipeline` and `check` tools; `pnpm editor:install`.
4. **The editor has one owner**, the app: no copied address or routing; the panel's script in its own file; one router test; the editor's state file.
5. **The review loop**: fingerprints of what the student sees, the per-board gate (this also makes the gate notice prop changes).
6. **The plan's shape**: one approval per round for flow and props; the book file; pictures in the plan.
7. **Questions**: typed answers (with a pair mode, for backward questions) and written answers; then the questions guide.
8. **Components enforce the rules**: units, numbers kept with units, one prompt style.
9. **Clean-ups**: remove `reveals` from code and docs; fix `board-model.md`.
10. **Prompts and skills** (plan-chapter, build-lesson, self-review, the reviewer's rubric), iterated once 1–8 hold.
11. **Lesson 2**, the Cartesian plane.

On hold: approving from chat.
