# Authoring pipeline

Status: **built**. Planning happens in the editor (the Chalk extension); the agent runs the skills in its chat. Class 9 Coordinate Geometry will be remade through the pipeline from its source, so its old `plan.md` isn't split. Replaces the one-file `plan.md` with steps that each answer one question, write one file and end at a gate.

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
  brief.md          1  scope (who, languages, what is in or out)
  source/           2  the source as handed over (or a pointer into authoring/sources/), plus outline.yaml
  objectives.md     3  what a student can do at the end
  flow.md           4  lessons and boards in order, each with its objectives, figures and need
  props.md          5  each need matched to a prop; the prop changes it asks for
  runs/                one note per pipeline run
  comments.yaml        threads on the chapter's boards and on the files above        (built)
authoring/props/<package>/comments.yaml   threads on the package's props            (built)
library/props/<package>/src/   5–6  each prop's definition (its contract), then its view and run bodies
library/catalogue.md              generated: every prop's page                       (built)
content/<book>/<chapter>/
  build.yaml, <lesson>/overview.ts, questions/     7  what is built
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
| 1 | Brief | Who is it for, and what is in or out? | `brief.md` | person |
| 2 | Source | What exactly does the source contain? | `source/outline.yaml` | machine |
| 3 | Objectives | What can a student do at the end? | `objectives.md` | machine, then person |
| 4 | Flow | In what order, and which board drives each objective home? | `flow.md` | machine, then person |
| 5 | Props | Which prop meets each need, and what exactly is each new or changed prop? | `props.md`, definitions | machine, then person |
| 6 | Build props | Does each prop work at every screen? | views, run bodies, tests | machine, then person |
| 7 | Boards | The words, with the props placed | `content/…` | machine, then agent |
| 8 | Review | Is it right for students? | threads, in rounds | person closes |
| 9 | Wrap-up | What should the next chapter inherit? | taste lines, checks, catalogue | person approves each line |

A step starts only when the one before it is approved. Only the person approves.

### 1. Brief

Short, in the person's words, written by the agent from the conversation:

```markdown
---
approved: 1a2b3c4
---
- For: class 9; taught live on a projector, then self-study on phones
- Languages: English and Hindi, every string
- Story: none
- Questions: none in this pass
- Must keep: every NCERT example and figure
```

It shapes the objectives and flow. Screens are not the chapter's: every check that draws boards or props (`show`, layout, steps) runs at the platform's check screens (360×640 phone, 640 column, 640×720 projector).

### 2. Source

`outline.yaml` lists everything in the source with a stable id later files cite:

```yaml
- { id: s3.2, kind: section, title: Cartesian System }
- { id: fig3.10, kind: figure, page: 4, says: "P is 4 units from the y-axis and 3 from the x-axis" }
- { id: def-abscissa, kind: definition, text: "The x-coordinate of a point is…" }
- { id: ex3.2-q2, kind: exercise }
```

**Gate (machine):** counts of figures, examples, activities and exercises match a scan of the text. Every citation anywhere later must be an id here.

### 3. Objectives

```markdown
- **o5** Define the abscissa and ordinate as signed distances from the axes. (def-abscissa, def-ordinate, fig3.10)
- **o8** Tell a point's quadrant from the signs of its coordinates, and say why. (fig3.13)
```

Something a student can *do*, citing source ids. **Gate (machine):** every source item no objective cites is listed, so leaving something out is a decision. **Then person:** the most important gate; everything below traces back to it.

### 4. Flow

```markdown
## coordinates-of-a-point
### two-ways  (o5, o9; fig3.15)
Purpose: going x then y and going y then x reach the same point.
Needs: tap any point; two walkers leave O, one along x first, one along y first, and meet.
```

Needs are words, never prop names. Board ids are the ids used in `content/` later. **`flow.md` is the only place that says which objectives and figures a board serves**; boards don't repeat it. **Gate (machine):** every objective has a board; every board cites an objective; every figure the brief must keep has a board. **Then person.**

### 5. Props

**The match, in the chapter's `props.md`.** Every need from `flow.md`, grouped, each with one verdict, found by looking at `library/props/` and at the candidates' addresses: **reuse**, **configure** (fields it already has), **extend**, **new**, or **no prop** (words or a picture do it better). For each extend or new: the change it asks for and the boards that need it. This is where "one prop or three" is decided, on purpose.

**The design, in the prop's definition.** For each extend or new, before any view: the definition is written or changed (state, actions with arguments and `changes`, signals, a `describe` opening with what it is for, invariant), with run bodies and the view left for step 6. For an extension, `affected` lists every board it reaches and the thread says why nothing there changes.

**Gate (machine):** the definition type-checks and its generated page builds. **Then person:** the match, and one thread per new or changed prop, carrying its generated page before and after.

### 6. Build props

Run bodies and the view, to the definition ([making-a-prop.md](making-a-prop.md)). **Gate (machine):** tests, `checkProp`, `show` the prop's address at the check screens, with `steps` over its actions (the learner's gestures and `call`s) with frames to show nothing jumps. **Then person:** opens `?dev&at=library/props/<package>/<type>`, plays with it and its panel, and comments on it there, before any lesson uses it.

### 7. Boards

Today's `build-lesson`. **Gate (machine):** build, layout, both languages, the check screens, and **field use** for each prop the chapter uses (its page's list: what no board uses and what only one does), across all content. **Then agent:** a fresh `self-review`.

### 8 and 9. Review and wrap-up

As today ([comments.md](comments.md); `apply-comments`, `wrap-up`), with the thread changes below.

## Prop changes always go through the definition first

Any change to a prop's fields, actions or signals, at any step after 5 and from any chapter (a review round asking for a walker, a board that wants a scene), is first a definition change with its thread, approved by the person, as in step 5. Then the view and run bodies. No prop grows one request at a time without a thread showing it.

## Approval and staleness

`brief.md`, `objectives.md`, `flow.md` and `props.md` have `status: draft | approved` in front matter; `approved` records the commit. A prop's approval is its thread. When an approved file changes, it goes back to `draft`, and the check lists what it reaches as **to recheck**:

| Changed | To recheck |
|---|---|
| brief | objectives, flow, props |
| outline | objectives |
| objectives | flow, props |
| flow | props |
| props (the match) | the boards it names |
| a prop's definition | every board, in any chapter, that `affected` lists |

The agent rechecks each and either changes it or says why it still holds; the person approves again. An agent that is about to edit an approved file says first that it will need approving again (and what after it), and never writes an `approved:` line.

**An approval is committed alone.** The commit that brings an `approved:` line changes nothing else in the file, so history says exactly which text was approved. The person's approval, not yet committed, goes in a commit of its own before any edit to that file. `pnpm check`'s pipeline step fails otherwise (`stampProblems`). (Id-level diffing, marking only what cites a changed id, is added later only if this proves too noisy.) Coming into an existing chapter works the same way.

**Lessons are self-reviewed before the person sees them.** A built lesson with a board that is new, or changed since it was last passed (`authoring/books/<book>/<chapter>/reviewed.yaml`: each board's record from the build when the reviewer passed it, written only by the chalk MCP's `changes` tool), is **to self-review**: the Chalk tree marks it, and `pnpm check`'s pipeline step lists it (a note, not a failure: lessons change while they're built). `build-lesson` and `apply-comments` end with a self-review by the `reviewer` agent, and only then hand the lesson over.

## Threads on everything

**The address** (built). A thread's address is worked out from what it stores (its board and target, or its prop and part), never stored twice: `content/…/two-ways#plane/walkBoth`, `library/props/coordinates/coordinatePlane#readout`. Threads on planning files (built): the file and line, and the exact words (`quote`), filed in the chapter's comments.yaml.

**Board or prop** (built). A pick on a prop on a board asks: this board (fixed in the lesson), or the prop, everywhere (fixed in the prop through its definition, `affected` showing every board the fix reaches). On a prop's own page every comment is the prop's.

**A thread whose target is gone must be answered** (built). If an open or planned thread's address no longer resolves, `pnpm check` fails on it, and the fixer either re-points it (with a message: "merged into the axes board") or answers it ("removed: the dice game is text now"). Closed threads are history. The preview shows an unresolved thread at the deepest part of its address that still exists, with its saved copy; that is display only.

**Before → after** (built, in `apply-comments`). A fixer's `ready` message carries the thing before and after: a picture, its generated page, or the old and new words.

**Gate questions are threads** (built). An agent's question at a gate is a thread on that file. No "Open questions" section.

## Skills

| Today | Proposed |
|---|---|
| `plan-chapter` | `plan-chapter`: steps 1–4, one gate at a time |
| `build-props` | `build-props`: steps 5–6 (match via `show` the library, definitions, build) |
| `build-lesson` | `build-lesson`: step 7 |
| `self-review`, `apply-comments`, `wrap-up` | as today; `apply-comments` adds before → after, re-points threads, and routes prop changes through the definition first |

## Moving over

1. ~~Addresses gain their root.~~ Done.
2. ~~Threads and reviews move to `authoring/`.~~ Done.
3. ~~`content/<book>/<chapter>/{plan.md, runs/, source/}` move to `authoring/books/<book>/<chapter>/`.~~ Done.
4. ~~An agent splits each existing `plan.md`~~ (dropped: class 9 is remade from its source instead): Mission → `brief.md`, Lessons → `flow.md` (needs written from what boards do), Props → `props.md` (the match), Open questions → threads. `objectives.md` from the plan's objectives, else drafted. Built chapters are approved as they stand.
5. Each prop's `describe` is checked to open with what it is for (a few open with only what it shows: "A factor tree.", "Two sticks, a and b.").
6. `outline.yaml` generated for each chapter with a source.
7. ~~`coordinatePlane` run through field use~~: removed with class 9 Coordinate Geometry, its old threads and reviews, to remake the chapter from its source through the pipeline.

## Build order

1. ~~Addresses with roots, everywhere.~~
2. ~~A prop at its address: the one-prop board, the preview, `show` with `state` and `call`.~~
3. ~~The panel, from the schemas.~~
4. ~~Purpose (the first sentence of `describe`), the one generator: prop pages, `show` the library, the preview's library, the catalogue.~~
5. ~~Comments on props; this board or the prop everywhere; threads and reviews under `authoring/`.~~
6. ~~The pipeline: the files (moving `plan.md`, `runs/`, `source/`), gates and staleness (`pnpm check`'s pipeline step, the editor's Chalk tree), threads on planning files, the check on threads whose place is gone, before → after, the skills.~~
