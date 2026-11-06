# Authoring pipeline

Status: **built**, and being changed by [plans/authoring.md](plans/authoring.md) (step 4 done: `plan.md` and `boards.md` replace the brief, objectives, flow and props match). Planning happens in the editor (the Chalk extension); the agent runs the skills in its chat.

## Why

Class 9 Coordinate Geometry was built from one `plan.md` that made decisions nobody saw being made:

- "One new prop carries the whole chapter" was decided before anyone listed what each board needed. `coordinatePlane` ended with ~40 fields; scenes and walkers were bolted on one request at a time.
- The story, the dice game and the questions were written into the plan, then dropped.
- The projector glitch (the zoom feedback loop) was found by a person, not a check: the projector was never a screen the checks looked at, and `zoomTo` could only be tried through a lesson.
- Plan, runs and source sit in `content/`, next to what is published.

Each step exists to catch one of these, in a file someone can read and comment on.

## Files

Only what is built lives in `content/` and `library/`. What is written about the work (plans, threads, reviews) lives in `authoring/`.

```text
authoring/books/<book>/<chapter>/
  source/en/        1  the English book: its PDF, items.yaml (its words, item by item), terms, figures
  plan.md           2  the intent, approved by the person: goal, objectives, skipped, story, lessons,
                       chapter art, props (reuse / extend / new), question families
  boards.md         2  the detail, never approved: each board and question family, what it is for,
                       its beat, needs, objectives and the items it cites, props; the items skipped
  runs/                one note per pipeline run
  comments.yaml        threads on the chapter's boards and on the files above        (built)
authoring/props/<package>/comments.yaml   threads on the package's props            (built)
library/props/<package>/src/   3–4  each prop's definition (its contract), then its view and run bodies
library/catalogue.md              generated: every prop's page                       (built)
content/<book>/<chapter>/
  build.yaml, <lesson>/overview.ts, questions/     5  what is built
```

## Addresses (built)

An address is where the thing lives, then what on it:

```text
content/class9-maths/coordinate-geometry/coordinates-of-a-point/two-ways          a board
content/class9-maths/coordinate-geometry/coordinates-of-a-point/two-ways#plane    a piece on it
library/props/coordinates/coordinatePlane                                         a prop
library/props/coordinates/coordinatePlane#readout                                 a part of it
library/props/coordinates, library/props/                                         a package, the library
```

The roots are the real folders. One without a root is refused. Everything takes addresses: the preview (`?dev&at=<address>`), the chalk MCP (`show`, `affected`, `comments`, `comment`) and threads. Read and written in one place: `@chalk/content/address`.

## Props: the contract is the code (built)

The library exists so props are **reused** across chapters and **easy to discover**. A contract serves both, and almost all of it is already declared in code (`prop()`: its variables, needs and facts, actions and signals with their payloads, the invariant, a `describe`). A hand-written contract would be a second writer that drifts, so:

- **One writer: the definition.** Its `describe` opens with one sentence saying what it is for; that sentence is its purpose wherever props are listed (`purposeOf`). No other field.
- **One page per prop, generated** (`@chalk/player`'s `prop-pages.ts`) from the definition and from what the build records about every board (`build/reach.json`: each piece's type, the fields its board sets, the inputs its rules feed, the actions its scripts call):
  - its address, role, purpose and `describe`
  - its fields (a setting, its own state and which actions change it, or an input), its actions with their arguments, its signals
  - **where it is used:** every board, with what each sets, feeds and calls
  - **field use:** the settings and lesson actions no board uses, and what only one board uses. Where a prop carries one board's special case shows here, measured.
- **Approval is a thread** on the prop, its before → after the generated page (and pictures). The person closing it is the approval.

### Finding props: list, then look (built)

1. **`show` `library/props/`** (or one package): a line per prop, `address · role · purpose · used on N boards`. No ranking: matching a need to a purpose is the agent's judgement; the MCP reports facts.
2. **`show` a prop's address:** everything about it as for a piece (where it is defined, setup, state, what can be done, its parts), then its page: what it is for, every board that uses it, field use.
3. **The preview's library, `?dev&at=library/props/`:** every prop drawn live at its defaults (or what it needs, when its defaults draw nothing), with role, purpose and use count; a click opens it.
4. **`library/catalogue.md`:** the same pages as a file, for a plain checkout without the MCP.

The MCP reads props only through the app (`__chalkProps`): it never loads prop code itself.

## Seeing props (built)

A prop's address opens a board with only that prop on it, at its defaults or from `state` (fields over its defaults). From there it is any board.

**The panel** beside it stands in for the lesson: its inputs (what a board's rules feed), its fields, and a button per action with its arguments. Built from the definition's schemas, one control per schema type all the way down (toggle, number with a slider when bounded, list to pick from, text, two boxes for both languages, objects, lists and choices of these), so nothing is written per prop. A field is set on the live prop as a rule would set it, checked first; Run does an action as a lesson would; the fields show the live values.

**The MCP** takes the same: `show` at a prop's address takes `state`, steps name its parts as its address does (`drag: "movePoint"`), and its steps have `{ call: "setX", args: { value: -3 } }` for its actions as a lesson would call them (refused on a board, where the lesson calls them). A package without that prop, fields that don't fit, an unknown action or arguments that don't fit are refused, saying what there is.

A prop that only draws inside another's frame (`drawsOn`) is shown as needing one; none does yet.

## Steps

| # | Step | Question | Output | Gate |
|---|---|---|---|---|
| 1 | Source | What exactly does the source contain? | `source/en/items.yaml` | machine |
| 2 | Plan | What can a student do at the end, and how will the chapter get them there? | `plan.md`, `boards.md` | machine, then person (`plan.md`) |
| 3 | Props | What exactly is each new or changed prop the plan names? | definitions | machine, then person (a thread per prop) |
| 4 | Build props | Does each prop work at every screen? | views, run bodies, tests | machine, then person |
| 5 | Boards | The words, with the props placed | `content/…` | machine, then agent |
| 6 | Review | Is it right for students? | threads, in rounds | person closes |
| 7 | Wrap-up | What should the next chapter inherit? | taste lines, checks, catalogue | person approves each line |

Nothing is built until `plan.md` is approved. Only the person approves.

### 1. Source

`pnpm source` extracts the book into `source/en/` ([plans/sources.md](plans/sources.md)): `items.yaml`, every block in the book's exact words, each with a positional id (`2.13`) that `boards.md` cites.

**Gate (machine, `pnpm check`'s sources step):** every item is found in the book's text layer, every number the book prints is an item's, the terms are real and every figure has its picture.

### 2. Plan

**`plan.md`**, English, one to two pages: the one file the person approves (`approved: <commit>` in its front matter). Its `## ` sections:

```markdown
## Goal
A student can say where any point in a plane is with two numbers in an agreed order, …

## Objectives
- **o6** Find a point's abscissa and ordinate as its signed distances from the axes.

## Skipped
- Activity 2, the dice game: the treasure trail (o13) takes its place.

## Story
The arc, and the characters it uses.

## Lessons
### coordinates-of-a-point  (o6, o7)
Goal: … Does: what the student does. Card: its card's art.

## Chapter art
The tile's idea.

## Props
- **new** `coordinatePlane`: a sketch. Why: …

## Question families
- **read-a-point** what it tests. (o6, o7)
```

A lesson's slug is its folder and its name in `build.yaml`; a family's is its folder under `questions/`. A prop's verdict is **reuse**, **extend** or **new**; where words or a picture do better, the plan says so in a sentence. `ready: true` in the front matter (written by the agent when the last lesson is built and reviewed, its words unchanged so the approval holds) says the chapter is ready for the person.

`plan.md` has no ids: the person reads it, so its `Skipped` names items as the book does.

**`boards.md`**: per lesson `## <slug>`, then each board `### <board-id>  (o6; 2.12)` and each question family `### questions/<family>  (o7; 2.30.2)` under the lesson it tests, then `## Skipped`, each item left out by its id, with why (`- **3.12** the treasure trail takes its place.`):

```markdown
### distances-from-axes  (o6; 2.11, 2.12, 2.13)
Purpose: a point's distance from the y-axis is measured along the x-axis, …
Beat: Riya walks from O to P and to Q.
Needs: graph-paper axes with P and Q; the perpendiculars from each point to both axes, …
Props: coordinatePlane (reading a point; walker)
```

Needs are words, never prop names. Board ids are the ids used in `content/`. **`boards.md` is the only place that says which objectives and items a board serves**; boards don't repeat it. Nothing in it is approved, and no status is written in it: each board is **planned**, **built** (in the build) or **reviewed** (passed by a reviewer as built now, `reviewed.ts`), worked out each time. (**Waiting**, on a new prop whose showing thread the person hasn't closed, isn't worked out yet: a thread doesn't say which prop it shows.)

**Gate (machine, `pipeline.ts`):** `plan.md` has its sections and a goal, and no item ids; lessons and families cite objectives that exist; every prop has a verdict. In `boards.md`: every board and family is under a lesson of the plan, serves an objective, cites only objectives and items that exist, and says its purpose and needs; every item is cited or skipped with a reason (a section or an exercise counts when any item in it is); every family is the plan's, and every family of the plan has its entry; every objective is served by a board or family. The build: `build.yaml`'s concepts are the plan's lessons, in its order (some while they are built; all once the plan says `ready: true`, with the chapter's `art.tsx`), each with its `art.tsx`. **Then person:** approves `plan.md`.

### 3. Props

**The design, in the prop's definition.** For each extend or new the plan names, before any view: the definition is written or changed (state, actions with arguments and `changes`, signals, a `describe` opening with what it is for, invariant), with run bodies and the view left for step 4. For an extension, `affected` lists every board it reaches and the thread says why nothing there changes.

**Gate (machine):** the definition type-checks and its generated page builds. **Then person:** one thread per new or changed prop, carrying its generated page before and after.

### 4. Build props

Run bodies and the view, to the definition ([making-a-prop.md](making-a-prop.md)). **Gate (machine):** tests, `checkProp`, `show` the prop's address at the check screens, with `steps` over its actions (the learner's gestures and `call`s) with frames to show nothing jumps. **Then person:** opens `?dev&at=library/props/<package>/<type>`, plays with it and its panel, and comments on it there, before any lesson uses it.

### 5. Boards

Today's `build-lesson`. **Gate (machine):** build, layout, both languages, the check screens, and **field use** for each prop the chapter uses (its page's list: what no board uses and what only one does), across all content. **Then agent:** a fresh `self-review`.

### 6 and 7. Review and wrap-up

As today ([comments.md](comments.md); `apply-comments`, `wrap-up`), with the thread changes below.

## Prop changes always go through the definition first

Any change to a prop's fields, actions or signals, at any step after 3 and from any chapter (a review round asking for a walker, a board that wants a scene), is first a definition change with its thread, approved by the person, as in step 3. Then the view and run bodies. No prop grows one request at a time without a thread showing it.

## Approval and staleness

`plan.md` alone is approved: `approved: <commit>` in its front matter, written by the dev server when the person approves it in the editor, once its checks and the source's hold, no thread on it is open, and it is committed. A prop's approval is its thread. When the approved plan changes, it is **changed** (approve it again); when `source/en/items.yaml` changes after it was approved, it is **to check again**. Nothing below the plan is approved, so nothing cascades: `boards.md` follows the plan and is checked by the machine. An agent about to edit an approved `plan.md` says first that it will need approving again, and never writes an `approved:` line.

`pnpm check`'s pipeline step fails where `boards.md`'s checks fail, or an approved plan's (its sources step, where the source's do); a draft plan's failing checks only stand in the way of its approval.

**An approval is committed alone.** The commit that brings an `approved:` line changes nothing else in the file, so history says exactly which text was approved. The person's approval, not yet committed, goes in a commit of its own before any edit to that file. `pnpm check`'s pipeline step fails otherwise (`stampProblems`). (Id-level diffing, marking only what cites a changed id, is added later only if this proves too noisy.) Coming into an existing chapter works the same way.

**Lessons are self-reviewed before the person sees them.** A built lesson with a board that is new, or changed since it was last passed (`authoring/books/<book>/<chapter>/reviewed.yaml`: each board's record from the build when the reviewer passed it, written only by the chalk MCP's `changes` tool), is **to self-review**: the Chalk tree marks it, and `pnpm check`'s pipeline step lists it (a note, not a failure: lessons change while they're built). `build-lesson` and `apply-comments` end with a self-review by the `reviewer` agent, and only then hand the lesson over.

## Threads on everything

**The address** (built). A thread's address is worked out from what it stores (its board and target, or its prop and part), never stored twice: `content/…/two-ways#plane/walkBoth`, `library/props/coordinates/coordinatePlane#readout`. Threads on planning files (built): the file and line, and the exact words (`quote`), filed in the chapter's comments.yaml.

**Board or prop** (built). A pick on a prop on a board asks: this board (fixed in the lesson), or the prop, everywhere (fixed in the prop through its definition, `affected` showing every board the fix reaches). On a prop's own page every comment is the prop's.

**A thread whose target is gone must be answered** (built). If an open or planned thread's address no longer resolves, `pnpm check` fails on it, and the fixer either re-points it (with a message: "merged into the axes board") or answers it ("removed: the dice game is text now"). Closed threads are history. The preview shows an unresolved thread at the deepest part of its address that still exists, with its saved copy; that is display only.

**Before → after** (built, in `apply-comments`). A fixer's `ready` message carries the thing before and after: a picture, its generated page, or the old and new words.

**Gate questions are threads** (built). An agent's question at a gate is a thread on that file. No "Open questions" section.

## Skills

| Skill | Steps |
|---|---|
| `plan-chapter` | 1–2: the source, `plan.md`, `boards.md` |
| `build-props` | 3–4: definitions, then the build |
| `build-lesson` | 5 |
| `self-review`, `apply-comments`, `wrap-up` | as today; `apply-comments` adds before → after, re-points threads, and routes prop changes through the definition first |

## Moving over

1. ~~Addresses gain their root.~~ Done.
2. ~~Threads and reviews move to `authoring/`.~~ Done.
3. ~~`content/<book>/<chapter>/{plan.md, runs/, source/}` move to `authoring/books/<book>/<chapter>/`.~~ Done.
4. ~~An agent splits each existing `plan.md`~~ (dropped: class 9 is remade from its source instead): Mission → `brief.md`, Lessons → `flow.md` (needs written from what boards do), Props → `props.md` (the match), Open questions → threads. `objectives.md` from the plan's objectives, else drafted. Built chapters are approved as they stand.
5. Each prop's `describe` is checked to open with what it is for (a few open with only what it shows: "A factor tree.", "Two sticks, a and b.").
6. ~~`outline.yaml` generated for each chapter with a source~~: replaced by `items.yaml` ([plans/sources.md](plans/sources.md)).
7. ~~`coordinatePlane` run through field use~~: removed with class 9 Coordinate Geometry, its old threads and reviews, to remake the chapter from its source through the pipeline.
8. ~~The brief, objectives, flow and props match become `plan.md` and `boards.md`; `source/` becomes `source/en/`~~ ([plans/authoring.md](plans/authoring.md), step 4). Done for class 9 Coordinate Geometry.

## Build order

1. ~~Addresses with roots, everywhere.~~
2. ~~A prop at its address: the one-prop board, the preview, `show` with `state` and `call`.~~
3. ~~The panel, from the schemas.~~
4. ~~Purpose (the first sentence of `describe`), the one generator: prop pages, `show` the library, the preview's library, the catalogue.~~
5. ~~Comments on props; this board or the prop everywhere; threads and reviews under `authoring/`.~~
6. ~~The pipeline: the files (moving `plan.md`, `runs/`, `source/`), gates and staleness (`pnpm check`'s pipeline step, the editor's Chalk tree), threads on planning files, the check on threads whose place is gone, before → after, the skills.~~
