# Writing content

Content is a tree of folders. Each folder's `build.yaml` lists what goes into the build and in what order, the way a `CMakeLists.txt` does. Boards (pages and questions) are TypeScript, because they hold logic. The build turns it all into plain JSON in `build/`; the app, Jugnu and the database only ever read that.

Glossary words: Book, Chapter, Concept, Page, Question family, Params row, Question, Witness, Note check, Board pattern, Explainer prop, Build.

## The tree

```text
content/
  build.yaml                              books: [class9-maths]
  graph.yaml                              prerequisite edges between concepts
  (board patterns every concept shares live in library/patterns/, as `@chalk/patterns`)
  class9-maths/
    build.yaml                            title, chapters: [number-systems, …]
    number-systems/
      build.yaml                          title, concepts: [...], questions: all | [...], exclude
      concepts.gen.ts                     the chapter's Concept enum (generated, committed)
      successive-magnification/
        build.yaml                        title, props
        overview.ts                       the pages (walkthroughs too), in reading order
      questions/                          the chapter's question bank
        locate-on-line/
          family.ts                       the template: tests, level, params → board
          params.yaml                     the arguments: one row = one question
```

- **Order is the order of the list.** Chapters in book order, concepts in chapter order, pages in `overview.ts`'s array order.
- **Only what's listed is built.** Leave a name out (or comment it) and the folder stays on disk, out of the build. The build reports folders with a `build.yaml` that no manifest lists.
- **Every name is checked** against the folders on disk; a listed folder that doesn't exist fails the build.
- **Questions are the chapter's pool**: `questions: all` takes every family folder under the chapter's `questions/`, minus `exclude`; or list the families to take. `exclude` only goes with `all`. Each family says which concepts it tests; a question is served once all of them are taught.

## A chapter's own files: `source/`, `plan.md`, `runs/`

Besides its concepts and questions, a chapter folder holds the pipeline's artefacts. They are plain files, so any harness and any agent can read and write them, and git keeps their history.

- **`source/`**: what the chapter is built from, as handed over (a PDF, a text extract, notes). The plan skill reads everything in it. Older chapters point at `content/sources/text/<file>` from their plan instead.
- **`plan.md`**: the chapter plan, written before anything is built and approved before building starts. Front matter, then the sections Studio reads:

  ```markdown
  ---
  status: draft          # queued | draft | approved | built
  source: source/        # or a path under content/sources/
  approved: 2026-10-24   # once approved
  ---
  # <Book>, <Chapter>: <Title> (plan)
  ## Mission            # the story and the "why this chapter"
  ## Lessons            # a numbered list, one lesson (concept folder) per item, in book order
  ## Props              # reused (from library/catalogue.md) and new, each with its reason
  ## Open questions     # what the author wants decided before building; emptied on approval
  ```

  `status` is the gate: `queued` (dropped, not planned), `draft` (planned, awaiting review), `approved` (build may start), `built` (every lesson in the plan exists and `pnpm check` passes). Only a person moves a plan to `approved`.
- **Running a step from Studio**: the chapter page says what the pipeline would do next (from the files: no plan → `plan-chapter`; open comments → `apply-review`; approved and nothing built → `build-props`; then `build-lesson` per lesson; then `self-review`) and runs it with the coding harness installed on the machine, one run at a time. The transcript streams to the page and is kept in `tmp/studio-runs/`. The same skills work from a terminal; Studio adds nothing the files don't say.
- **`runs/`**: one short append-only note per pipeline run, named `<YYYY-MM-DD-HHMM>-<stage>.md` (stages: `plan`, `props`, `lesson-<slug>`, `self-review`, `review`): what was asked, what was produced, which checks passed, what is left. This is the chapter's history; Studio shows it, chat does not keep it.

## Manifests (`build.yaml`)

```yaml
# a chapter
title: { en: Number Systems, hi: संख्या पद्धति }
concepts: [successive-magnification, …]
questions: all
exclude: [one-third-never-lands]   # optional

# a concept
title: { en: A decimal is an address, hi: दशमलव एक पता है }
props: [decimalExpansion]          # optional: extra explainers for Jugnu
```

A book has `title` and `chapters`; `content/build.yaml` has `books`. Unknown fields fail the build.

**Props Jugnu may use** are worked out, not listed: a concept's are the explainers its pages place, those the questions testing it place, and its `props:` extras; a chapter's are the union of its concepts'. Write `props:` only for an explainer nothing on the concept's boards uses.

**`concepts.gen.ts`** is the chapter's concepts as an enum, made from `build.yaml` by `pnpm build-content` (and `preview`). Commit it. Rename or drop a concept and every family still naming it stops compiling; the build also fails while the file is out of date.

## The overview (`overview.ts`)

```ts
const idea = page("idea", (b) => column([ b.prop(textDef, "title", { text: t("…", "…") }), … ]));
const zoom = page("zoom", (b) => { … }, { passOn: PassOn.Rules });

/** The pages, in reading order. Leave one out to drop it from the build. */
export const overview = [idea, zoom, play];
```

A page lets the learner go on at once. An interactive page passes `{ passOn: PassOn.Rules }`, calls `theBoard.pass()` from its own rules, and gives a witness. A page may ask any number of questions (a `choice` making the learner commit, a `goal`); each answers where it sits. The build writes the page's concept into them, ungraded (`isGraded: false`): answering one teaches but counts towards no mastery. Bank questions are graded on the concepts they test. Jugnu is there for doubts on both.

## A question family (`family.ts` + `params.yaml`)

```ts
import { Concept } from "../../concepts.gen";

export const locateOnLine = family({
  level: Level.Medium,
  tests: [Concept.SuccessiveMagnification],         // one or more of the chapter's concepts
  params: z.object({ target: decimal, from: z.number(), to: z.number() }).strict(),
  build: ({ target, from, to }, b) => {
    const line = b.prop(numberLineDef, "line", { from, to, showMarker: true, isZoomable: true });
    const goal = goalQuestion(b, {
      about: line,
      prompt: t(`Put the marker exactly on ${target}.`, "…"),
      isMet: line.field("marker").isAt(target),     // fixed(line.marker, 3) == "7.384"
      solve: reach(line, target),                    // the witness
      notes: [{ when: …, say: t("…", "…"), reach: reach(line, early) }],
    });
    return column([line, goal, space()]);
  },
});
```

```yaml
- params: { target: "2.665", from: 2, to: 3 }
- params: { target: "7.384", from: 7, to: 8 }
  level: hard                      # overrides the family's level
# 4.207 reads too much like 4.27 on a small screen; kept for later
- params: { target: "4.207", from: 4, to: 5 }
  origin: generated
  exclude: true
```

- `family.ts` exports exactly one `family(...)`. It never names its folder. `tests` is for the whole family: if rows would test different concepts, they are two families.
- Each row is one question. `params` is checked against the family's `params` schema; `decimal` turns `"7.384"` into an exact `Dec`; quote it, because unquoted YAML reads a float and drops trailing zeros (`7.30` → `7.3`), so the build refuses an unquoted one. A row may set `level` (else the family's), `origin` (`authored` by default, `generated` from the question generator) and `exclude` (kept in the file, left out of the build).
- Every question has a witness (how a learner gets it right) and a note check per note. The build plays them on the real props; a row that fails is reported and left out, the other rows still build.
- The concepts a question tests are written into its question prop by the build, as ids.

## Rules for TypeScript content

- Props, actions, signals and derived fields come from the prop's definition, typed: `line.learner(NumberLineAction.ZoomIn)`, `goal.on(QuestionSignal.Wrong)`, `line.derived(NumberLineDerived.Level)`. Naming one a prop doesn't have is a compile error. Use the props' enums, never a string.
- Numbers a learner sets are compared with `isAt(dec("…"))`, never `==` on floats.
- Every learner-facing string is `t(en, hi)`.
- When the same board-building shows up a second or third time, lift it into `library/patterns/` (`goalQuestion`, `magnifier`, `reach`).

## Words and maths

Every learner-facing string (text, prompts, options, feedback, notes, Jugnu's replies) is **rich text**: plain words plus a small, fixed syntax.

| Write | Get |
| --- | --- |
| `**bold**` | **bold** |
| `*emphasis*` | *emphasis* |
| `$p(2) = 9$` | inline maths (LaTeX, typeset by KaTeX) |
| `$$\frac{1}{2+\sqrt{3}} = 2 - \sqrt{3}$$` | a display formula on its own line |
| `$\ce{2H2 + O2 -> 2H2O}$` | chemistry (mhchem) |
| `\$5` | a literal dollar |

- Keep Hindi outside the dollars: `t("so $p(2) = 9$.", "तो $p(2) = 9$।")`. Punctuation right after a formula stays on its line.
- Remember that TypeScript strings need `\\` for a LaTeX backslash: `"$\\sqrt{2}$"`.
- The build typesets every formula in every language; broken maths (`$\frac{1}{$`) fails it with the exact string and reason.
- A line that is spoken needs a `speak` version in plain words; the voice can't read LaTeX.
- Headings and lists are not rich text: layout belongs to the board.
- **Live values** (an IS text): `{line.marker}` in words, `\live{…}` inside maths, where braces are LaTeX's own: `t("You are at {fixed(line.marker, 2)}", "…")`, `"$x = \\live{fixed(line.marker, 2)}$"`. Both re-render when the value changes. The build checks the maths with each live value as 0.

## Ids, versions, where it came from

Nobody types an id.

- **id** = a 16-hex hash of the item's path in `content/` (a question: its family's path plus its params). Renaming a folder gives new ids.
- **version** = a hash of the item's built JSON (not the commit). A container lists its children's versions, so any change below it changes it.
- **source** = path, file, row (a question's row in `params.yaml`, a page's place in `overview.ts`) and commit.

## The graph (`graph.yaml`)

```yaml
edges:
  - concept: class9-maths/number-systems/successive-magnification
    parents: [class9-maths/number-systems/place-value]
```

Every path must be a built concept; the build refuses loops. A concept's `prereqs` in `build/` come from here.

## Building

- `pnpm build-content`: builds into `build/` from the files as they are.
- `pnpm preview`: the same on every save; the learner app (`pnpm dev`) shows each built concept as a lesson.
- `pnpm publish-content`: refuses unless git is clean; builds from that commit and keeps a copy as `published/<commit>/`.

`build/` mirrors the tree (`book.json`; `chapter.json` with the bank; `concept.json`, `overview/<page>.json`; `questions/<family>/family.json` and one `<id>.json` per question; `index.json` and `graph.json`). It is generated, never edited, and not in git.

## Colours

A prop's colour field takes a role of the look (`Color.Primary`, `Color.OnSurface`, from `@chalk/prop`), which follows the app's theme, or any `#rrggbb` of the content's own. Use a role for "the thing to look at" or "plain ink"; use a hex when the colour means something across pages (ℕ is always the same blue: `library/patterns/colors.ts`).

## Art

A book, chapter or concept can have a picture: an `art.tsx` next to its `build.yaml`, drawn with the same pieces as the props. See [making-art.md](./making-art.md); `pnpm art` shows them all.

A concept's `build.yaml` may also give a `glyph` (one to four characters: `½`, `0.1`, `√`) for its stop on the chapter's path.
