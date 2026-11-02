# Plan: tools that answer what we actually ask

Written from the record of 2026-11-02, the day lessons 3 and 4 were built and reviewed, and
reviewed once by an independent agent (its corrections are folded in).

## What the record says

Measured from the session log for that day:

| What | Calls | Time |
|---|---|---|
| Checks after edits: format, type-check, test, `build-content`, `pnpm check`, catalogue | ~500 | ~76 min in `pnpm check` and builds alone |
| Chalk work done around the chalk tools, through scripts in the shell | 62 | ~85 min |
| Searching code for where something happens | 436 | — |
| `show` through the tool | 134 | 22 min; 19 failed ("nothing changed", "didn't run", timeouts) |
| `sleep` to wait for the dev server | 44 | — |

What the scripts and searches were really asking for:
- many board states at once (Riya at every square; five positions);
- only the problem lines from a chapter check, or pictures saved to files;
- what the reviewer would see, asked as the reviewer;
- where each tool's time went;
- why a board did what it did: which rule sent Riya back, and why a witness never got Continue.

The tool changes made that day (cache, resize skipping, scroll fix, overlap check, the drag's drop
tag) were patches, each found by hitting a wall mid-lesson.

## The six gaps, from first principles

The tools exist to answer, before the person sees a board: is it right, can a student do it, can a
student follow it? And for whoever builds: is my change fine, and why does the board do this? They
fall short in six ways. Each is a root cause, not a symptom. They are in order of time saved.

### 1. A check after a change redoes everything

**Root cause:** every drawing in the cache is keyed on all of `platform/` and `library/` and the
driver (`platform/studio/src/mcp/draw-cache.ts:19-25`). Any code edit redraws all 75 boards. The
content build runs again by hand although `show` rebuilds first. The record shows 61 manual builds.
So "is my change fine?" means minutes, many times an hour.

**Fix:** key each board's drawing and its checks on **the code that board runs**. That is its
`boardCode` digest (`platform/studio/src/reach/board-code.ts`), already computed for `changes`,
plus its content, the driver and the browser. A prop edit then redraws only the boards that place
that prop; a pattern edit, only the boards whose code reaches it.

Then add **one `verify` step** (CLI and tool): from the files changed since the last verify, it:
- formats them;
- runs `pnpm check`'s steps (already cached by files read: `platform/studio/src/check/reads.ts`);
- draws and checks only the boards whose digest changed.

It answers in one block: problems first, then what was reused. Full checks run only before a
commit, as now.

**Proof:**
- a one-line prop edit verifies in seconds, redrawing only its boards;
- a content-only edit redraws one chapter's touched boards;
- a full chapter check after no change reuses everything.

### 2. A test passes what no student can do

**Root cause:**
- **The build's witness** calls actions on the engine with no screen (`content/witness.ts:72`).
  It passed the treasure trail while Riya, drawn on top, caught real taps.
- **`show`** refuses a covered tap, but it aims at the middle of the target's whole box
  (`app-driver.ts:1331`). For a stall, that is its label, which is inside it, so the cover went
  unseen. Drags and taps at a point use raw mouse moves (`:1330`, `:1347`) and miss silently.

**Fix: act like a student, honestly.**
- **Aim where a finger aims.** That is the middle of the input's own drawn shapes (its non-text
  children), or its own box for an HTML button. For a point, the point through the frame, re-read
  after scrolling. Then ask the page what is on top there (`elementFromPoint`, which respects the
  props' `pointer-events: none` layers). If it is not the input or inside it, the step fails and
  names the cover: `step 6: "Snacks" (places/chooseTarget:3,2) is covered by Riya (walker)`.
- **Check in the right state.** Only once the board is idle (not mid-walk or mid-glide). Skip inputs
  that are off or `inert`. Ignore the dev page's own furniture (the preview bar, the review sheet).
- **Drags:** check the start the same way. The end must lie in the frame, or the step fails
  (`(7, −3) is outside the plane`).
- **Mapping a witness step to its input**, generically from the tags:
  - match the step's action against **every** action in an input's `data-does` (the dot does
    `moveDot plotAt`; a choice option does `select check`);
  - match args by `data-with`, or by key for a by-hand input;
  - let one press **absorb** the next step it already performs (a choice option's tap is its
    select and its check);
  - judge by the action the screen actually called (a drag snaps or clamps), not by the numbers
    aimed at.
- **Whole-area inputs** (tap anywhere on the plane, a quadrant) count as reachable if any of a few
  sample points is.

**Order:**
- **(a)** aim and reachability in `show`'s taps and drags;
- **(b)** the chapter check replays each board's witness on the screen, in English at 360,
  cached as in 1;
- **(c)** every drawn state reports an input that is on but reachable at **no** sample point.

**Not now:** steps by visible words, and "tap until".

**Proof:**
- with the walker's pointer-events fix reverted in a scratch build, (a) and (b) both report Snacks
  covered by Riya;
- lessons 1–3 replay as before, apart from what they truly find.

Witnesses that ask for something no finger can do (dots dropped outside the plane) are listed by
(b). Fixing them edits reviewed lessons, so that is a separate change, reviewed on its own.

### 3. A play doesn't explain itself

**Root cause:** a step reports engine events and state changes, which is debugging output. To
check the flow, I rebuild what is on screen in my head; to see why something happened, I search
the code. Hence the 436 searches, rule logs added by hand, and a witness failure that says only
"never gets Continue".

**Fix:** every play, a failing witness included, writes after each step:
- **on screen:** the pieces visible now, top to bottom, with their words, and what was said;
- **can do now:** each input that is on and reachable, by its words (`aria-label`, its text);
- **why:** each rule that ran, as `file:line`, and what it decided (show, hide, pass, call).

A failing witness prints this up to where it stopped.

**Proof:**
- the trail's old stage-counting bug reads as one wrong "why" line, with no added log;
- "a question about a page not shown yet" is visible in the on-screen list.

### 4. One question per call, and answers too big or too small

**Root cause:** `show` answers one state per call, with every picture, or nothing. Sweeps, problem
lines only, pictures to files, and "what would the reviewer see" were all done through scripts
(85 minutes that day). A long play went over the output limit and was cut off.

**Fix:**
- **`vary`:** a step's value runs over a list or range ("walk to (x, y) for x in −6…6, y in −4…4";
  "each scale"). Each state is played, and the problems from all of them come back together, with
  the states that had them.
- **`only`:** `problems`, `lines` or `pictures`. Pictures may be written to files (paths returned)
  instead of inline. Nothing is cut silently: a long answer says what it left out and how to ask
  for it.
- **`as: "reviewer"`** for the fixer: see what the reviewer would see (`changes`, old against new),
  without a second connection.

**Proof:** the day's 125-square sweep in both languages is one call, and its answer is the
problems only.

### 5. A board's reason sits apart from it

**Root cause:** what a board is for (its flow purpose and needs) and the source passages it cites
were fetched by hand, by both the builder and the reviewer.

**Fix:** `show` at a board gives its `flow.md` purpose and needs, and the outline passages its board
id cites, under its script.

**Proof:** a review needs no `flow.md` or source reads beyond what `show` gives.

### 6. Tools don't say how fresh or how slow they are

**Root cause:** after an edit, I slept and hoped the dev server had reloaded (44 sleeps). A slow call
said nothing about why, so a morning went to timing it by hand.

**Fix:**
- every answer starts with the code version it ran, and waits for a reload in progress rather than
  answering from old code;
- every answer ends with its time, split by what it did (built, drawn, reused from the cache,
  played), from the existing `tool-times.ts`.

**Proof:** no `sleep` in a day's record; a slow answer names its slow part.

## Habits, not tools

- Use `show` at a prop for its actions, fields and parts, instead of searching its code.
- Format at verify time, not after every edit: formatting reshapes code under the next exact edit.
- Read every board as a student while making it (already in the skills).

## Second review: corrections (grounded in the tools' own logs for the day)

The logs (`node_modules/.cache/chalk-checks.jsonl`, `chalk-calls.jsonl`) correct the record above:

| | The record above | The tools' logs |
|---|---|---|
| `pnpm check` | ~76 min with builds | **26.5 min over 87 runs** (tests 9.3, typecheck 6.5, pipeline 4.1, content 3.5); it draws no boards |
| `show` | 22 min (the builder's calls only) | **986 calls, 100 min**, reviewers' included |
| `changes` | not counted | **78 calls, 52 min** |

So drawing boards in `show` and `changes` is where the time goes.

- **1:**
  - The per-board key speeds `show` and `changes`, not `pnpm check`.
  - `boardCode` alone is unsound as a key: it reads only `.ts`/`.tsx`/`.css` from roots `BoardPlayer`
    and `LessonPlayer` (`reach/index.ts:43-46`). It misses `apps/learner` (`main.tsx`'s fonts,
    `preview-shell.tsx`), the lockfile, `vite.config`, `index.html`, CSS `@import`s and the driver.
  - **Key:** `boardCode.digest` + a narrow shell key (root files, `apps/learner`, `app-driver.ts`,
    `model-schema.ts`) + `contentKey` + the browser. `undefined` from `boardCode` means key on
    everything. `build/reach.json` must be current, so build first.
  - `verify` shrinks to `pnpm check`'s cached steps plus redrawing the touched boards; formatting is
    left out.
- **2:**
  - `show`'s plain taps already hit-test (Playwright's `click`); the blind paths are raw
    `mouse.click`/`move` (`app-driver.ts:1330`, `:1345-1354`) and the bounding-box aim.
  - Generic: presses are read in one place (`player/src/does.ts:27-48`).
  - In 2b, impossible witness steps are **listed findings, not failures**, until fixed in their own
    reviewed change.
- **3:**
  - Rules run in one place, `prop/src/board.ts` (`on` :383-394, `hear` :409-416, `show` :271-274).
  - Name each rule by its `step` label, and get `file:line` from the piece's recorded site
    (`author/src/site.ts`, `reach.pieces[].stack`).
  - `show` rules are getters, so they are reported as state at each step's end.
- **4:**
  - `as: "reviewer"` is cut: a connection is one role (`http.ts:12-13`). At most, a read-only
    `changes` view for the fixer.
  - `only` and pictures to files merge into 6.
- **6:**
  - Freshness mostly exists: `tsx watch` (`start.mjs:58`), the relay retries a new boot
    (`main.ts:37`, `connect.ts:111-125`), `show` rebuilds first (`tools.ts:725-738`), and pages
    reloaded mid-draw are retried (`app-driver.ts:975`).
  - The per-phase timing exists but is off (`app-driver.ts:151-163`, `/dev-timing`). Turn it on in
    every answer.
  - Find what the 44 sleeps waited for before building anything for them.

## Order and cost (revised)

| # | What | Size |
|---|---|---|
| 1 | Timing in every answer (switch on the existing phases); `only: problems`; pictures to files; no silent cut-offs | small |
| 2 | Aim and reachability in `show`'s taps and drags (2a); then the witness replayed in the chapter check, in English at 360, impossible steps listed (2b) | medium |
| 3 | Per-board cache key plus the shell key, aimed at `show` and `changes`; proven on lessons 1–3 (no stale drawings, and a font or `preview-shell` edit still shows) | medium |
| 4 | Plays that explain: the student's view and the rules that ran | medium |
| 5 | `vary`: many states per call | medium |
| 6 | Every input checked in every state (2c); a board's reasons beside it (5) | small |

Each lands on its own commit with its proof. The docs (`seeing-boards.md`, `changes.md`) and the
skills change with each.

The table before the second review is kept above for the record; this one replaces it.
