# Threads: what each role reads, and a fix after "not yet"

Plan (2026-11-01), not built. Reviewed once (below); to be agreed before building.

**Goal:** an agent reads exactly the threads that need it, in one answer that arrives whole; it hears of a settled decision when it is about to raise the same point; a fixer can fix a thread again after a reviewer's "not yet", and every fix records what it changed.

## How they are used (every saved session: 53 `comments` calls, 149 `comment` calls)

- **Too long:** 7 `comments` answers didn't arrive whole, all a reviewer reading a lesson or the chapter (`at`); a review's threads (`review`) came to 20–48 KB. Lesson 1 at its address: 66 threads, 129 KB, of which 59 closed (105 KB, 81%) and 3 withdrawn; the 4 open ones were 15 KB. Each thread's `plan:` line repeats the fixer's `planned` message word for word (9 KB of it).
- **Usually quick, twice not:** median 1.3 s; reading review `20261031-2006` took 158 s twice (22:36 and 23:06). No restart of the service and no lock in the reader lines up with either; while the second ran, `pnpm check` was running.
- **A fixer can't answer a "not yet":** 17 refused moves. A fixer marks a thread ready; a reviewer writes that it isn't right yet; the writer says "answer the reviewer first: write a message or a new plan, then mark it ready", but refuses both the new plan (ready → planned) and marking it ready again (already ready). So the fixer only adds a message, the thread stays ready, and the second fix's files are never recorded.
- **A fix's files are wrong when committed:** `ready` records the files `git status` lists as modified since the plan: uncommitted only. A fixer who commits before marking ready records nothing, or other uncommitted files.
- **Closed is closed:** 10 refused moves were a fixer marking ready a batch of threads the person had already closed. Right to refuse; the refusal can say so plainly.
- Writes are fine: messages 250 characters typical, 2,600 at most.

## What each role needs

| Who | Needs | Today |
|---|---|---|
| Reviewer | the open threads to check, each in full | every thread at the address, settled ones too |
| Reviewer | whether a point was already settled | only by reading all history up front |
| Fixer | what waits on it | `unanswered: true`: fine |
| Fixer | to fix again after "not yet", the files of each fix recorded | refused; uncommitted files only |

## Decided (reviewed by a fresh agent against the code; its changes are in)

1. **`comments` answers open threads in full; settled ones are counted.** With `at`, `review`, or nothing given, open, planned and ready threads come in full; closed and withdrawn ones are a count: "59 closed and 3 withdrawn here: `closed: true` for them, or one by `id`". `id` reads one thread in full, settled or not. The `plan:` line goes: the plan is the last `planned` message, already shown. The answer grows with the work open, not with history. (It also removes the 10 closed → ready refusals at the source: the fixer was never shown that those threads were closed.)
2. **A settled decision comes up where it matters: in `comment`.** Starting a new thread on the same board and target as a closed thread, the answer names it: "settled here before: cmvt7i171acg, closed by the person: '<their last words>'"; at most three. The thread is still started; the writer only says what is known there.
3. **A fixer answers a reviewer's "not yet" with a new fix.** The person's words on a ready thread already reopen it; only a reviewer's get stuck. One change in MOVES: a fixer may plan a ready thread again when it is the agent's turn (`turn: agent`, which a reviewer's "not yet" sets and its "fix holds" with `turn: person` doesn't). planned → ready is already allowed, so "answer the reviewer first" then holds as it says.
4. **Each fix records what it changed: committed or not.** Each `planned` message keeps the commit it was planned at (HEAD then); `ready` records `git diff --name-only <that commit>` under content/, library/ and platform/, and what is untracked; and what those files reach (`reaches`) is worked out from the same commit, not HEAD (today a committed fix reaches nothing). Each ready keeps its own list.
5. **A closed thread says it is closed.** Refusing a move on it: "closed by the person on <date>: nothing to do; a new thread if it needs more".
6. **The slow calls, reads and writes (158 s reads; 76, 35, 35, 33 s writes): the editor's tree.** The service does everything on one thread, and the editor's Chalk tree asks `/dev-pipeline` on every rebuild, every comment write and every handover; that answer runs `changesUnder` for every lesson, each reading the code graph and `build/reach.json` afresh and `git show` in loops, synchronously. One of the 158 s reads came right after a handover; `pnpm check` rewrites build/. So:
   - a batch of writes is one file write per home (today one per item, each setting off the tree);
   - the tree's refresh waits a beat after the last change (debounced);
   - the code graph and what each lesson's changes are kept for the build and commit they were worked out from (cached), so asking again is cheap;
   - measured, not guessed: each request's run time (tools and `/dev-*`), the event loop's delay, and the relay's send time against the service's receipt. **Built first (`pnpm tool-times`).** Checked since: the two 158 s reads were at 10:36 and 11:06 in the morning, not after the evening's handovers; today the same review read takes 0.1 s and `/dev-pipeline` 0.6 s (2.1 s just after a rebuild). Nothing shows the editor's tree caused them: the cause is unknown until the log catches one.
7. **Promised but not checked:** ready's words say "no open regression it caused"; the writer doesn't check it. Check it (a thread with an open `about` thread pointing at it can't go ready).
8. **One service, one checkout:** the service reads threads and git from the checkout it started in, and one service serves the machine. A fixer in another worktree must not get another checkout's threads, files or reaches: the relay sends its checkout's root, and the service refuses a call from another one, saying which it serves.

## Steps

1. `comments`: open in full, settled counted, `closed`, `id`, no `plan:` line; the tool's description. Tests: an address with closed threads answers only the open ones and the count; `id` reads a closed one.
2. `comment`: the settled note (same board and target, at most three); a batch written once per home. Tests.
3. Moves: ready → planned on the agent's turn; the closed refusal in words; the open-regression check on ready. Tests: the "not yet" round; closed stays closed; a regression blocks ready.
4. A fix's files and reaches from its plan's commit. Tests: a committed fix records its files and reaches; a second fix its own.
5. The tree's refresh debounced; the code graph and lesson changes cached by build and commit; the timings logged. Measure the tree and a write after a handover, before and after.
6. One checkout per service.
7. Docs (comments.md) and the skills (apply-review, self-review); measure lesson 1's `comments` again.
