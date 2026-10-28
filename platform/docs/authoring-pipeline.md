# Authoring pipeline (proposal)

Status: **proposal**, 2026-10-28. Nothing here is built yet. It replaces the one-file plan (`plan.md` in the chapter folder) with ten steps, each one answering a single question, writing a single file and ending at a gate. It also extends threads ([comments.md](comments.md)) to every one of those files, with one pointer rule.

## Why

Class 9 Coordinate Geometry was built in one day from one `plan.md`, and the plan made decisions nobody saw being made:

- **"One new prop carries the whole chapter."** This was written before anyone listed what each board needed. `coordinatePlane` ended with about 40 fields. The colony, the cinema and the two walkers were added to it mid-day, one request at a time. Nobody looked at its design before it existed.
- **The story, the dice game and the questions** were written into the plan, then dropped. A short brief would have settled them before planning.
- **The projector glitch** (the zoom feedback loop) was found by the person in class prep, not by a check.
- **The plan, its runs and the source PDF sit in `content/`**, next to what is published.

Each step below exists to catch one of these earlier, in a file someone can read and comment on.

## Where the files live

What is authored stays out of `content/`. Only boards (step 8) go there.

```text
authoring/books/<book>/<chapter>/
  brief.md            1  who, why, limits
  source/             2  the PDF and text as handed over, plus outline.yaml
  objectives.md       3  what a student can do at the end
  flow.md             4  lessons and boards, in order, each with its need
  props.md            5–6  needs matched to props; contracts for new or extended ones
  runs/               one note per pipeline run (as today)
content/<book>/<chapter>/
  build.yaml, <lesson>/overview.ts, questions/     8  what is built
  comments.yaml       threads on all of the above (see Threads)
library/props/<package>/                          7  props, with their comments.yaml
```

`authoring/sources/` (the NCERT zips) stays where it is; a chapter's `source/` may point into it instead of copying.

## The steps

| # | Step | Question | Output | Gate |
|---|---|---|---|---|
| 1 | Brief | Who is this for, and what are the limits? | `brief.md` | person |
| 2 | Source | What exactly does the source contain? | `source/outline.yaml` | machine |
| 3 | Objectives | What can a student do at the end? | `objectives.md` | person |
| 4 | Flow | In what order, and which moment drives each objective home? | `flow.md` | person |
| 5 | Props: match | For each need, what is the best tool? | `props.md` (match) | person |
| 6 | Props: contract | What exactly will each new or extended prop be? | `props.md` (contracts) | person |
| 7 | Props: build | Does it work, at every size we teach on? | code, tests, a sandbox board | machine, then person |
| 8 | Boards | The words, with the props placed | `content/…/overview.ts` | machine, then agent |
| 9 | Review | Is it right for students? | threads, in rounds | person closes |
| 10 | Wrap-up | What should the next chapter inherit? | guide lines, checks, catalogue | none |

### 1. Brief

A short page in the person's words, written by the agent from the conversation and confirmed:

```markdown
---
status: approved
---
- For: class 9, taught live in class today; later, self-study on phones
- Device: laptop + projector, mouse; then phones
- Languages: English and Hindi, every string
- Story: none for now
- Questions: none for now
- Must keep: every NCERT example and figure; Section 3.3 (plotting)
- Deadline: class at 15:00
```

The brief is where "no story" and "no questions" get decided, before a plan is written around them.

### 2. Source

`outline.yaml` lists everything in the source, each item with a stable id that later files cite:

```yaml
- id: s3.2
  kind: section
  title: Cartesian System
- id: fig3.10
  kind: figure
  page: 4
  says: P is 4 units from the y-axis and 3 from the x-axis
- id: example2
  kind: example
  page: 6
- id: def-abscissa
  kind: definition
  text: "The x-coordinate of a point is its perpendicular distance from the y-axis…"
- id: ex3.2-q2
  kind: exercise
```

**Gate (machine):** the counts of figures, examples, activities and exercises match a scan of the text (`Fig 3.n`, `Example n`, `EXERCISE n.n`). Every later citation must be an id in this file.

### 3. Objectives

```markdown
- **o5** Define the x-coordinate (abscissa) and the y-coordinate (ordinate) as signed distances from the axes. (def-abscissa, def-ordinate, fig3.10)
- **o8** Tell a point's quadrant from the signs of its coordinates, and say why. (fig3.13)
```

Each objective is something a student can *do*, and cites source ids. **Gate (person):** this is the most important one; everything below traces back to it. A source item no objective cites is listed, so leaving something out is a decision, not an accident.

### 4. Flow

Lessons, then boards in order. Each board says what it is for, what it cites, and **what the student needs to see or do**, in words, not as a prop name:

```markdown
## coordinates-of-a-point
### two-ways  (o5, o9; fig3.15)
Purpose: going x then y and going y then x reach the same point.
Needs: tap any point on the plane; two walkers set off from O, one along x first, one along y first, and meet.
```

The board ids here are the board ids in `content/` later, so a thread on `flow.md#two-ways` and one on the built board point at the same thing at two stages. **Gate (person).** Machine check: every objective has at least one board.

### 5. Props: match

Every need from `flow.md`, grouped, each given one verdict against `library/catalogue.md`:

| Need | Boards | Verdict | Why |
|---|---|---|---|
| a point on a number line, moved by drag or stepper | number-line | **new**: `numberLine` | catalogue: `@chalk/draw` has an `Axis`, nothing a learner moves |
| a point on a plane with signed perpendiculars | distances, definition, … | **new**: `coordinatePlane` | nothing places a point in a plane |
| houses on streets, seats in rows | street, cinema | **configure** `coordinatePlane` with a scene? or **new** `gridScene`? | decide in the contract |
| the dice game | dice-game | **no prop**: text | the person wants it shown, not played, for now |
| a definition | many | **reuse**: `wordsOn(b).definition` | |

Verdicts: **reuse** (as is), **configure** (fields it already has), **extend** (a new field or action; `affected` lists every place it reaches), **new**, or **no prop** (words or a picture do it better). **Gate (person).** This is where "one prop or three" is decided, once and on purpose.

### 6. Props: contract

For each **extend** or **new**, before any code: the state (fields and their meaning), the actions, what it shows, the invariants, the sizes it must work at, and which boards use which settings. For an extension: what `affected` lists, and why nothing there changes. A contract over a size budget (say, more than 15 fields) has to argue for itself or split. **Gate (person).**

### 7. Props: build

Built to the contract ([making-a-prop.md](making-a-prop.md)). **Gate (machine):** tests, `checkProp`, and `look` at every screen in the brief (a projector at 1280×600 and a phone at 390 wide, at least), with `play` over its actions to show it doesn't jump. **Then person:** they play with it on a sandbox board, one per prop, before any lesson uses it. A finding here is a thread on `props.md` or on the prop.

### 8. Boards

Today's `build-lesson`. Each board cites its objectives (`b.serves("o5")`, beside `b.purpose`) so staleness can reach it. **Gate (machine):** the build, layout, both languages, every screen in the brief. **Then agent:** a fresh `self-review`.

### 9 and 10. Review and wrap-up

As today ([comments.md](comments.md), the `apply-review` and `wrap-up` skills), with the thread changes below.

## Status and staleness

Each file from steps 1 to 6 has `status: draft | approved` in its front matter, and `approved` records the commit it was approved on. A step starts only when the step before it is approved. Only the person approves.

**Staleness flows down by id.** When an approved file changes, the check diffs it against its approved commit and finds the ids that changed (`o5` reworded, `fig3.13` added). Every later file or board that cites a changed id is marked **stale** and listed: "flow.md#signs and the board coordinates-of-a-point/signs cite o8, which changed." The agent rechecks each one and either changes it or says why it still holds. Nothing is silently kept.

This is what makes working on an existing chapter safe: you can come in at any step. Rewording an objective, adding a board or splitting a prop each start where they belong and show what they reach.

**The fast lane.** On a day like today ("class in a few hours"), the person can approve 1, 3 and 4 in one go, or say "go" to everything up to 7. The files still get written, so the decisions are still visible and can be commented on later.

## Threads on everything

Threads work as today ([comments.md](comments.md)), with three changes: one pointer for every kind of file, a fallback when it no longer resolves, and before → after on answers.

### The pointer is the path

A thread's `at` is a path, as deep as the person clicked:

```text
class9-maths/coordinate-geometry/coordinates-of-a-point/two-ways#plane/walkBoth
└ book ─────┴ chapter ──────────┴ lesson ───────────────┴ board ──┴ piece/part

authoring/books/class9-maths/coordinate-geometry/flow.md#two-ways      + quote
authoring/books/class9-maths/coordinate-geometry/props.md#coordinatePlane + quote
```

For a board, `at` is today's `board` and `target` joined. For a text file it is the file, a heading anchor and the exact words (`quote`, as plan threads have today). Prop threads keep `prop`.

### Fallback: a thread is never lost

To show a thread, walk its path from the deep end and stop at the first part that still exists: the part, else the piece, else the board, else the lesson, else the chapter. For text: the quote, else the heading, else the file, else the chapter. The thread shows there, with its **saved copy** (today's `snapshot`, or the `quote`, and the commit) so you can still see what it was about.

This replaces "shown as detached". The resolved place is worked out when the thread is read, never stored, so it follows renames back and forth.

**An open thread that has fallen back needs an answer.** If an open or planned thread no longer resolves to where it was made, `pnpm check` lists it, and the fixer must either re-point it (`at` updated, with a message saying where it went: "merged into the axes board") or answer it ("removed: the dice game is text now"). Fallback keeps it visible; the check makes sure someone responds. Closed and withdrawn threads fall back quietly, as history.

### Before → after

A fixer's `ready` message carries what the thing was and what it is now: for a board, a picture of the piece before and after; for text, the old and new words. The person judges the change from the thread without opening the diff. Editing a file directly counts as review: if the person changes `objectives.md` themselves, there is no thread, but staleness still flows.

### Gates as threads

An approval is the person moving a file's `status` to `approved`. An agent's question at a gate (today's "Open questions" section) is a thread on that file, filed by the agent, so it is answered in the same place as everything else and is never left behind in a section someone forgot to empty.

## Skills

| Today | Proposed |
|---|---|
| `plan-chapter` | `brief`, `outline-source`, `write-objectives`, `write-flow` (one skill per step, each small) |
| `build-props` | `match-props` (5), `prop-contract` (6), `build-props` (7) |
| `build-lesson` | `build-lesson` (8), now citing objectives |
| `self-review`, `apply-review`, `wrap-up` | as today; `apply-review` adds before → after and re-points fallen-back threads |

Studio's chapter page reads the next step from the files, as today: the first file that is missing or not approved, then stale items, then open threads.

## Moving over

1. `content/<book>/<chapter>/{plan.md, runs/, source/}` move to `authoring/books/<book>/<chapter>/`. `writing-content.md` and Studio's chapter page are updated to read them there.
2. An existing `plan.md` is split by an agent: Mission → `brief.md`, Lessons → `flow.md` (needs written from what the boards do), Props → `props.md`, Open questions → threads. `objectives.md` is written from the plan's learning objectives where there are any, otherwise drafted and left `draft`. Chapters already built are approved as they stand, so nothing goes stale on day one.
3. `source/outline.yaml` is generated for each chapter that has a source.
4. Threads: `board` + `target` become `at`, done by the existing migration script (`comments-migrate.ts`); plan threads move their `source` to the new file path. The fallback replaces the detached state in the preview.
5. Boards gain `b.serves(…)` as chapters are next touched, not all at once. A board without it is never stale, and the check says so.

## Open questions

- **Size budget for a prop contract.** 15 fields is a guess. Recommendation: make it a warning in step 6, not a hard rule.
- **One sandbox board per prop, or one per contract setting?** Recommendation: one per prop, with the settings each board uses as presets on it.
- **`comments.yaml` for authoring files:** in the chapter's `content/` folder (one place for all a chapter's threads), or beside the files in `authoring/`? Recommendation: the chapter's one file, since a thread's home is its chapter and its pointer says the rest.
