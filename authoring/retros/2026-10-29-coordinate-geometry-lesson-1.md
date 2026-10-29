# Learnings: Class 9 Coordinate Geometry, lesson 1

The first chapter made from scratch through the pipeline (plan → props → lesson → self-review → the person), 28–29 October 2026. What went well, what kept going wrong, what we decided, and what we do next, in order.

## What went well

- **The gates held.** Approved planning files caught drift (flow changed → props to check again); the self-review gate, built mid-chapter, kept a lesson from reaching the person unreviewed.
- **`look` and `play` found real bugs** by running the real app: the lines vanishing at the crossing, measures between grid lines, taps faster than Riya's walk, Check after a wrong answer.
- **The reviewer subagent earned its place**: give-aways, numbered edges giving the answer, stale plan text, Hindi orphans, units missing.
- **Questions done in the prop.** With `check()` (`library/patterns`), the family places the prop, says which state is right and which wrong states get a note; place-the-dot took minutes.
- **Root-cause diagnosis, when we did it**, fixed things for good: the panel's regex eaten by a template string, `source=` addresses never routed to the preview.

## What kept going wrong

1. **Over-designed teaching.** The fair ground with fences, a gate and 10 m marks; "copy it for a friend" with two people; "one number is enough". Each time the book's own version (a dot on a page, 5 cm and 9 cm) was simpler and better. Cause: planning starts from "invent a story and a setup", not from the source.
2. **Threads the person couldn't see** (four separate times): `about` hid a proposal; the reviewer's taste threads waited on the agent; a ready thread blocked an approval and the editor didn't say why; the editor stopped refreshing after node_modules was wiped.
3. **Editor and preview bugs the person found, not us**: the regex in the panel's template string, families opening the home screen, the panel dropping a lesson's questions on reload. No test opened those pages. Early on, patches were guessed instead of diagnosed.
4. **Approval churn.** Every wording fix in `flow.md` meant approving flow, then props, again: four or five times in a day.
5. **Several self-review rounds, mostly mechanical**: units, the answer in the prompt, bold that didn't show, Hindi line ends. A checklist before the reviewer would catch most.
6. **Every question became a choice.** There is no typed or written answer, so open and short-answer questions were squeezed into options that hand over worked solutions.
7. **Repeated shell rituals**: the pipeline CLI path, `npx -y pnpm@10.28.0 check` and grepping for ✗, packaging and installing the editor by hand, ` ` by hand.

## What we decided (and keep)

- **NCERT fixes the objectives; teaching is ours, through prop interactions.** But each board starts from the book's own example and numbers; a departure says why, with the smallest setup and small numbers.
- **Two kinds of question**: ours, done in the prop and checked by its state; NCERT's, kept as written questions in the book's words. No hybrid. The family decides what is on screen; no board-to-question mapping.
- **Self-review always runs before the person**, as a reviewer that didn't build the lesson.
- **Say what the numbers do**, not "one number is enough": on a line, one number; off it, two distances along two lines at right angles.
- **Diagnose before patching.**

## New, from the person, 29 October

- **Answer kinds.** Not everything is a choice:
  - a short exact answer is typed (a number, a pair, a word), checked exactly, with notes for named wrong answers;
  - an open answer is written, then compared with a model answer and two or three things it should say (self-check, practice, not marked);
  - choice only for real choices, with options that are answers, never worked solutions.
- **Review fingerprints.** A hash of what the student sees (text, parts, state, layout; en and hi; the check screens; before and after the witness), recorded when a reviewer passes a board. The next self-review marks each board same screen / code changed, screen same / screen changed / new, and the reviewer chooses to keep, glance or review, recorded. Boards with a ready thread, or reached by another thread's change, always get a fresh look. The gate becomes per board.
- **Pictures are planned, not improvised.** A lesson's glyph ("4,5") and the art for a book, chapter or lesson are allowed today (`build.yaml` glyph, `art.tsx`, `pnpm art`), but no plan asks for them: the builder chose "4,5" alone, and the person never saw it to review. The plan should name each picture, and the person should see them as cards.
- **Book-level properties.** Some decisions belong to the book, not a chapter: recurring characters and places and their timeline (Riya and Aman continue from Class 10), the style of pictures, which props the book leans on and which it avoids, language register, numbers kept small and familiar. Today they live in one chapter's `flow.md`. They want a book file, approved first, that every chapter reads.

## Tools: what to change

- **Fail loudly.** `play` returned "nothing changed" for a tap on a part that isn't there (`ask` "Check", not `ask/check`); `comment` dropped a status move given with a re-point. Anything a tool can't do is an error naming what it can do.
- **No hidden threads.** `comment` warns before writing a thread that waits on the agent; the reviewer's taste threads wait on the person; `comments` reads threads on planning files.
- **A `pipeline` tool**: each planning file's state, lessons to self-review, and for anything that can't be approved, why ("thread X on flow.md is open").
- **`look` takes any preview address** (`source=`, `show=questions`, reviews) and says when it landed on the home screen.
- **The editor writes its state** (`.chalk/editor.json`: version, folder, last refresh, last panel address, errors) so an agent can see what the person sees.
- **An editor smoke test in `pnpm check`**: open each kind of tree item (lesson, family, prop, review) headless; none may land on the home screen.
- **One-command helpers**: a `check` tool that returns only failures; `pnpm editor:install` (bump, package, install, confirm); a lint autofix that keeps numbers with units and pairs together in `t()` strings; answering several threads (planned, ready) in one call.

## What next, in order

**0. Finish lesson 1** (the person): approve `props.md` again; close the five ready threads; review the lesson as a whole.

**1. Stop losing the person's time** (small, first):
- tools fail loudly; no hidden threads; reviewer taste threads to the person;
- the editor says why an approval was refused; `comments` on planning files;
- the `pipeline` tool.

**2. See what the person sees:**
- `look` on any preview address;
- the editor's state file;
- the editor smoke test in `pnpm check`.

**3. The plan, before lesson 2:**
- `plan.md` guide: start from the source's example and numbers, justify departures, smallest setup, small numbers;
- a **book file** (`authoring/books/<book>/book.md`): characters, places, timeline, picture style, props leaned on and avoided, register; a pipeline step approved before any chapter;
- **pictures in the plan**: the book's, the chapter's and each lesson's art and glyph described, then drawn and shown to the person as cards before the lesson is built;
- approve plan edits as a batch, not each wording fix.

**4. Questions:**
- typed-answer and written-answer props in `basics` (definitions and a thread each first);
- the questions guide (`authoring/taste/guides/questions.md`): the kinds, when each, options are answers;
- redo Ex 3.1 Q1 (written) and Q2 (two typed numbers).

**5. Faster reviews:**
- review fingerprints and the per-board gate;
- the builder's checklist before self-review, automatic where possible (an answer inside its own prompt; a number on an axis with no unit on the board).

**6. Helpers and debts:**
- `check` tool, `pnpm editor:install`, the spacing autofix, batch thread answers;
- remove `reveals` from code and docs; fix the stale `board-model.md`; the gate also watching props.

**7. Lesson 2** (the Cartesian plane), through the improved pipeline.
