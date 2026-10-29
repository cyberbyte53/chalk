# Learnings: Class 9 Coordinate Geometry, lesson 1

The first chapter made from scratch through the pipeline (plan → props → lesson → self-review → the person), 28–29 October 2026. What went well, then each problem with its cause, how I'd attack it, and my opinion; then the order of work.

## What went well

- **The gates held.** Approved planning files caught drift (flow changed → props to check again); the self-review gate, built mid-chapter, kept a lesson from reaching the person unreviewed.
- **`look` and `play` found real bugs** by running the real app: the lines vanishing at the crossing, measures between grid lines, taps faster than Riya's walk, Check after a wrong answer.
- **The reviewer subagent earned its place**: give-aways, numbered edges giving the answer, stale plan text, Hindi orphans, units missing.
- **Questions done in the prop.** With `check()` (`library/patterns`), the family places the prop, says which state is right and which wrong states get a note; place-the-dot took minutes.
- **Root-cause diagnosis, when we did it**, fixed things for good: the panel's regex eaten by a template string; `source=` addresses never routed to the preview (`app.tsx`).

## Decisions we keep

- NCERT fixes the objectives; teaching is ours, through prop interactions, starting from the book's own example.
- Two kinds of question: ours, done in the prop and checked by its state; NCERT's, in the book's words. No hybrid; the family decides what is on screen; no board-to-question mapping.
- Self-review always runs before the person, by a reviewer that didn't build the lesson.
- Say what the numbers do ("on a line, one number; off it, two distances along two lines at right angles"), not "one number is enough".
- Diagnose before patching.

---

## The problems, and how I'd attack each

### 1. Over-designed teaching

**What happened.** The fair ground with fences, a gate and 10 m marks; "copy it for a friend" with two people; "one number is enough". Each time the person pulled it back to the book's own version (a dot on a page, 5 cm and 9 cm), which was simpler and better.

**Why.** Planning starts from "make it a story with a setup". The plan guide and the brief reward a mission and characters, and nothing asks "what does the book do here, and why isn't that enough?" Big numbers came from the invented setting (a ground is measured in tens of metres), not from the student.

**What I'd do.**
- In `flow.md`, every board gets a `Source:` line before its `Purpose:` (the book's example, its numbers, in a sentence), and a `Departs:` line only if we change it, saying what the change buys the student.
- Add to `authoring/taste/guides/plan.md` three rules: start from the source's example and numbers; the smallest setup that makes the point (no second person, no extra place, no props on screen the board doesn't use); numbers a student counts on their fingers unless the source uses bigger.
- The pipeline's flow check fails a board with no `Source:` line, and lists the boards with a `Departs:` line in the thread asking for approval, so the person sees every departure at once.

**My opinion.** This is the most expensive problem of the day: it cost several rounds of the person's attention, and it's a habit, not a bug. A machine check can only make the departures visible; the guide has to change what I reach for first. Story stays, but as the thread between the book's examples, not a replacement for them.

### 2. Threads the person couldn't see

**What happened.** Four times: `about` hid a proposal; the reviewer's taste threads waited on the agent; an approval was refused and the person couldn't tell why; the editor stopped refreshing after node_modules was wiped.

**Why.**
- `waitsOn` (`platform/studio/src/comments.ts`) treats any open thread a reviewer started as the agent's: right for a mechanical fix, wrong for a taste decision. Nothing lets the reviewer say "this one is the person's".
- `about` means "a regression, the agent's" and the tool accepts it silently.
- The editor shows an approval's refusal only as a passing pop-up (`setApproval` in `platform/editor/src/planning.ts`); the planning file's entry in the tree keeps offering Approve.

**What I'd do.**
- A reviewer's thread says whose it is when filed: `for: "person"` (taste: the person decides) or the default (mechanical: the agent fixes). `waitsOn` honours it. The self-review skill already sorts findings this way; the data should carry it.
- `comment` refuses `about` unless the text names what the other thread's change broke, and says in its result "this waits on the agent; the person won't see it in Your turn".
- The tree's planning entry shows its blocker in place: "can't approve: thread cmvt… on line 31 is ready to close", clicking it opens the thread. The same reason is in the pipeline tool (5).
- After every thread write, the tool's result says who it waits on now.

**My opinion.** Small changes, large payoff: every one of these cost the person a round of "I can't see it". Do them first.

### 3. Editor and preview bugs the person found

**What happened.** The panel's script died on a regex eaten by its template string; question families opened the app's home screen; the panel dropped a lesson's questions on reload. Early on I patched by guessing.

**Why.** No test opens the pages the editor opens. The MCP's `look` takes only `at=` addresses, so the `source=` path was invisible to me too. And I can't see the editor, so I guessed.

**What I'd do.**
- An editor smoke test in `pnpm check`: for each kind of tree item (a book, a chapter, a lesson, a question family, a prop, a review), compute the query the extension would send, load it headless, and fail if it lands on the home screen or throws. The headless check I ran by hand today found the `source=` bug in seconds.
- The panel's page script lives in its own `.js` file, not a template string, so the backslash class of bug can't happen.
- The extension writes `.chalk/editor.json`: version, folder, last refresh, the panel's current address, the last errors. Agents read it before guessing.

**My opinion.** The smoke test is the important one: every bug here was "this page never loads", which is cheap to check and expensive for the person to find.

### 4. Approval churn

**What happened.** Every wording fix in `flow.md` meant approving flow, then props (to check again), again: four or five times in a day.

**Why.** Approval is all or nothing on the file's text, and props.md depends on all of flow.md, so a word in one board's Purpose re-opens both.

**What I'd do.**
- Batch: I collect plan edits from a round of review and ask once, with the diff summarised by board.
- Narrow the dependency: props.md is "to check again" only if a board's `Needs:` line changed, or a board was added or removed. A Purpose wording fix doesn't touch the props match.
- A small edit to an approved file can carry `minor: <why>` in its commit message; the pipeline shows it as approved, with a "minor edit since" note, and the person can still take the approval back.

**My opinion.** Batching and the narrower dependency are enough; I'm less sure about `minor`, because it lets the agent decide what the person needs to see. I'd start without it.

### 5. Several self-review rounds, mostly mechanical

**What happened.** Three rounds for lesson 1, then one per change: units, the answer inside a prompt, bold that didn't show, Hindi line ends, stale plan text.

**Why.** The builder hands over without its own pass, and the reviewer re-reviews everything each time (see 8).

**What I'd do.**
- A builder's checklist (`authoring/taste/checks.md`, run by build-lesson and apply-review before calling the reviewer), automatic where it can be:
  - a question's prompt contains its own answer (the right option's words, or the pair being asked for);
  - a number on an axis or a measure with no unit anywhere on the board;
  - `**bold**` inside a part drawn bold;
  - a Hindi string whose last word wraps alone at 360 px (`look` can report it);
  - the plan names something the boards no longer have (a word in `flow.md` not on any board: "stall", "fence").
- What the machine finds is a `pnpm check` failure, not a review finding.

**My opinion.** Half of the reviewer's mechanical findings today could have been automatic checks. The reviewer should be spending its time on teaching, not on units.

### 6. Every question became a choice

**What happened.** The library answers only by choosing (`choice`, `multiChoice`, `orderSteps`) or doing in a prop, so NCERT's "how many?" and "how will you describe…?" were turned into options that hand over worked solutions.

**What I'd do.** Three answer kinds:
- **Typed answer** (new prop in `basics`): a number, a pair or a short word, checked exactly; the family names wrong answers and a note for each (typed (3, 4) for (4, 3)). Graded.
- **Written answer** (new prop in `basics`): a box; on submit, the model answer and two or three things it should say, which the student ticks against their own. Practice, not marked. Later, a model could mark it against the same points.
- **Choice**, only for a real choice; options are answers, never explanations, and about the same length.
- The questions guide (`authoring/taste/guides/questions.md`) says how to pick the kind from the question.
- Redo Ex 3.1 Q1 (written) and Q2 (two typed numbers).

**My opinion.** Typed answers will be most of NCERT's exercises in this chapter (coordinates, abscissas, counts), so they are worth more than they look. The written answer should never pretend to be marked.

### 7. Repeated shell rituals

**What happened.** The long pipeline CLI command; `npx -y pnpm@10.28.0 check` and searching for ✗; bumping, packaging and installing the editor by hand; typing ` ` into "5 cm" and "(4, 5)", once wrongly by regex.

**What I'd do.**
- A `check` MCP tool: runs `pnpm check`, returns only what failed, with where.
- `pnpm editor:install`: bump the patch version, package, install into Cursor, confirm the installed version.
- A lint autofix on `t()` strings: a number and its unit, and a pair's two numbers, joined by a no-break space. Then nobody types it.
- `comment` takes several threads' plan and ready in one call.

**My opinion.** Each is small; together they're most of the noise in a day.

### 8. Reviews redo work that didn't change

**What happened.** A change to one board made the reviewer look at the whole lesson; a prop change made it look at every board using the prop, even when nothing on them changed.

**Why.** The gate is per lesson, and a board's `version` (`platform/studio/src/content/build.ts`) hashes its whole module and its props' whole packages: one edit to `overview.ts` changes all five boards.

**What I'd do.**
- A screen fingerprint per board: a hash of what `look` and `play` read from the real app (text, parts and their state, layout), in English and Hindi, at the check screens, before and after the board's witness steps.
- When a reviewer passes a board, its fingerprint is recorded (machine-readable, in the run note or a `reviewed.yaml`).
- The next self-review marks each board: same screen, code changed but screen the same, screen changed, or new. The reviewer chooses to keep, glance or review, and that choice is recorded.
- Always looked at again: a board with a thread made ready since, or reached by another thread's change.
- The gate becomes per board: a lesson is self-reviewed when every board's current fingerprint was passed.
- Later, the same for a prop's own page and each question family.

**My opinion.** First of the "faster" work: every later lesson's review shrinks to what changed. Rendering costs about a minute a chapter; a reviewer pass costs much more.

### 9. Pictures nobody planned

**What happened.** The lesson's glyph "4,5" was chosen by the builder alone; no art was made for the book, the chapter or the lesson; the person never saw a picture to review.

**Why.** Art is allowed (`build.yaml` glyph, `art.tsx`, `pnpm art`, `platform/docs/making-art.md`) but no planning file asks for it, so it's improvised at build time or forgotten.

**What I'd do.**
- `flow.md` names each lesson's glyph and what its art shows, in a line ("a dot where two dashed lines cross"); the chapter's art the same at the top.
- build-lesson draws them first, and the person sees them as cards (the chapter path and the lesson cards as the app shows them) with the lesson.
- The book file (10) sets the style: how much, which colours, what never (no portraits of real people).

**My opinion.** Cheap to add, and pictures are what a student sees first; they deserve the same review as boards.

### 10. Book-level properties live in a chapter

**What happened.** Riya and Aman, the fair, the timeline from Class 10: all written in this chapter's `flow.md`. The next chapter would have to find them there, or reinvent them.

**What I'd do.**
- A book file, `authoring/books/<book>/book.md`, approved before any chapter (a new first step in the pipeline):
  - recurring characters, their ages, places and the timeline across books;
  - the picture style;
  - props the book leans on, and ones it avoids;
  - language register in English and Hindi, and the words it uses for things ("street", "गली");
  - numbers: small and familiar unless the source says otherwise.
- plan-chapter reads it first; a chapter's brief says only what's different.

**My opinion.** Needed before the second chapter of a book, and it's where the "small numbers" and "no invented settings" rules can live for a whole book.

### 11. The tools: what to change

- **Fail loudly.** `play` returned "nothing changed" for a tap on a part that isn't there (`ask` "Check", not `ask/check`): it should say there's no such button and list the parts. `comment` dropped a status move given with a re-point: it should do both or refuse.
- **A `pipeline` tool**: each planning file's state, lessons to self-review, and for anything that can't be approved, why.
- **`comments` reads planning files** (`authoring/books/…` addresses), so I don't grep `comments.yaml`.
- **`look` takes any preview address** (`source=`, `show=questions`, reviews) and says when it landed on the home screen.

---

## What next, in order

0. **Finish lesson 1** (the person): approve `props.md` again, close the five ready threads, review the lesson as a whole.
1. **Stop losing the person's time** (2, 11): thread ownership and the `about` warning; blockers shown in the tree; tools fail loudly; the `pipeline` tool; `comments` on planning files.
2. **See what the person sees** (3, 11): the editor smoke test; the panel's script in its own file; `.chalk/editor.json`; `look` on any address.
3. **The plan, before lesson 2** (1, 4, 9, 10): the source-first plan guide and flow check; the book file; pictures in the plan; batched approvals and the narrower props dependency.
4. **Questions** (6): typed and written answers, the questions guide, NCERT's two questions redone.
5. **Faster reviews** (5, 8): fingerprints and the per-board gate; the builder's checklist and its automatic checks.
6. **Helpers and debts** (7): `check` tool, `pnpm editor:install`, the spacing autofix, batch thread answers; remove `reveals`; fix the stale `board-model.md`.
7. **Lesson 2**, the Cartesian plane, through the improved pipeline.
