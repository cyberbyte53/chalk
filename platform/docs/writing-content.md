# Writing content

Content is a tree of folders. Each folder's `build.yaml` lists what goes into the build and in what order, the way a `CMakeLists.txt` does. Boards (pages and questions) are TypeScript, because they hold logic, and they ship as TypeScript: the build checks every board and writes the course's shape as JSON in `build/`, each page and question naming the module that makes it; the app and the server make each board from that module (its rules stay typed functions, never strings).

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

## A chapter's own files: its planning files, `source/`, `runs/`

A chapter's pipeline artefacts live apart from what is built, in `authoring/books/<book>/<chapter>/` (with its threads, `comments.yaml`). `content/<book>/<chapter>/` holds only its concepts and questions. They are plain files, so any harness and any agent can read and write them, and git keeps their history.

- **The planning files**, written before anything is built, each answering one question and ending at a gate ([authoring-pipeline.md](authoring-pipeline.md) has their formats): `brief.md` (who it is for, what is in or out), `source/outline.yaml` (everything in the source, with ids), `objectives.md` (what a student can do, citing the outline), `flow.md` (lessons and boards, each with the objectives it serves and what it needs), `props.md` (each need matched to a prop). The machine's gate (`pnpm check`'s pipeline step, `platform/studio/src/pipeline.ts`): every citation is an id that exists, every objective has a board, every board's need has a verdict, the outline has every figure, example, activity and exercise in the text. The person's gate: approving it in the editor, in order, once it is committed, which writes `approved: <commit>` into its front matter. Nothing else about its state is stored: a file changed since it was approved, and a later file written from one that changed (to be checked again), are worked out from git.
- **`source/`**: what the chapter is built from, as handed over (a PDF, a text extract, notes). The plan skill reads everything in it.
- **In the editor** (the Chalk extension, `platform/editor`): the Chalk tree shows each chapter's planning files in order with their state (not written, checks fail, to approve, approved, changed, to check again), a file's failing checks are problems on its lines, and the person approves a file (or takes it back) from the tree or the open file, comments on selected words, and adds a new chapter's source. The steps themselves are skills the person's agent runs in its chat (`plan-chapter`, `build-props`, `build-lesson`, `self-review`, `apply-review`); what is next is what the files say: the first planning file not written, failing its checks or to be checked again, then the props, the lessons, the review.
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
const story = page("story", (b) => {
  const w = wordsOn(b);
  const race = b.prop(lapRaceDef, "race", {});
  b.witness(race.learner(LapRaceAction.Play), race.learner(LapRaceAction.Arrive));
  const must = choice(b, {
    name: "must",
    prompt: t("So a minute when they're there together is…", "…"),
    right: t("a multiple of both 18 and 12", "…"),
    wrong: {
      factor: { label: t("a factor of both", "…"), feedback: t("Their minutes only grow…", "…") },
    },
  });
  const lcmIs = w.definition(t("…the **lowest common multiple**…", "…"), "lcmIs");
  b.after(race.on(LapRaceSignal.Met), must);                        // appears when they meet
  b.after(race.on(LapRaceSignal.Met), lcmIs, { if: (at) => at(race).time > 36 });
  b.passWhen(race.on(LapRaceSignal.Met), { if: (at) => at(race).time > 36 });
  return [w.title(t("HCF and LCM", "HCF और LCM")), race, must, lcmIs];
});

/** The pages, in reading order. Leave one out to drop it from the build. */
export const overview = [story, towers, play];
```

- **A page returns its pieces, top to bottom.** It is laid out as a column with room at the bottom; `row(...)` and `overlay(...)` are for pieces side by side or on top of each other.
- **What appears later:** `b.after(trigger, pieces, { if })`. The pieces start hidden and show when the trigger fires (and the condition holds). The trigger is a signal (`race.on(LapRaceSignal.Met)`) or a question (shown once it is answered right). A piece shown in steps, or hidden again, uses `b.when(signal, theBoard.show(p) / theBoard.hide(p))`. A piece that starts hidden and that nothing shows doesn't build.
- **When the learner may go on:** when every question on the page is answered right; at once on a page with none. `b.passWhen(signal, { if })` replaces that (passing on a prop's signal, or a page whose question is a stop on the way). Nothing else passes a page.
- **Conditions are plain functions of the board,** typed from the pieces: `(at) => at(race).time > 36`, `(at) => at(line).marker > 2 && at(ask).status === AnswerStatus.Correct`. Any condition TypeScript can compute; no strings.
- **Questions:** `choice(b, { prompt, right, wrong: { key: { label, feedback } } })`, its options shuffled the same way every build (`keepOrder` keeps them as written, the right one first); `goal(b, { about, prompt, met: (at) => …, solve, notes })` for "get this prop into a state, then Check". Each answers where it sits. The build writes the page's concept into them, ungraded (`isGraded: false`): answering one teaches but counts towards no mastery. Bank questions are graded on the concepts they test. Jugnu is there for doubts on both.
- **A picture:** a prop drawn still, from a state you give it: `b.prop(coordinatePlaneDef, "town", { … }, { still: t("The main road and Street 4, with Aman's house", "…") })`. Nothing on it can be tapped, dragged or focused, and the sentence is what a screen reader and Jugnu read. Use it to show again something the student has already used (the same picture, now to look at); a prop for a page's own drawing doesn't exist yet.
- **Sizes are the player's:** a board is drawn for a phone and fits any screen on its own (the column grows to 640px, text grows with it, props scale; see [making-a-prop.md](./making-a-prop.md)). A placement can override its prop's rule when needed: `b.prop(numberLineDef, "line", { … }, { size: { fit: "fill" } })`.
- Every interactive page has a witness: how a learner gets through it (`b.witness(...)`, with `wait(seconds)` for the board's clock).
- Anyone may act on any piece; Jugnu's judgement (never answering an open question for the learner) is checked by his evals, not by the board. Don't write `b.studentOnly`.

A bank question's `build` is the same: it returns its pieces, and passes when its questions are right. The build refuses a board that returns anything but a list. Chapters still in the older shape live on the `content-pipeline` branch and come over one at a time.

## A question family (`family.ts` + `params.yaml`)

```ts
import { Concept } from "../../concepts.gen";

export const locateOnLine = family({
  level: Level.Medium,
  tests: [Concept.SuccessiveMagnification],         // one or more of the chapter's concepts
  params: z.object({ target: decimal, from: z.number(), to: z.number() }).strict(),
  build: ({ target, from, to }, b) => {
    const line = b.prop(numberLineDef, "line", { from, to, showMarker: true, isZoomable: true });
    const ask = goal(b, {
      about: line,
      prompt: t(`Put the marker exactly on ${target}.`, "…"),
      met: (at) => target.isAt(at(line).marker),     // exact: a Dec, never == on floats
      solve: reach(line, target),                    // the witness
      notes: [{ when: (at) => …, say: t("…", "…"), reach: reach(line, early) }],
    });
    return [line, ask];
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
- Numbers a learner sets are compared with an exact decimal, `dec("7.384").isAt(at(line).marker)`, never `==` on floats.
- Every learner-facing string is `t(en, hi)`.
- When the same board-building shows up a second or third time, lift it into `library/patterns/` (`choice`, `goal`, `magnifier`, `reach`).

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

Everything is one tree, and a node's **path** is its identity: book → chapter → concept → its pages (`class10-maths/real-numbers/division-lemma/story`); the chapter's question families beside its concepts (`…/real-numbers/questions/locate`), each row named by 8 hex characters of a hash of its params (`…/questions/locate/3fa1c2d9`: only params count, not level, `firstTry` or `exclude`; two rows with the same params are a build error). Each node names only itself and siblings' names are unique; a title is what a learner sees, so a chapter can be retitled without moving its path. Renaming a folder makes a new node.

Each built item carries its `path`, its `id` (a hash of the path, always worked out from it, what events carry) and its `version`: a hash of its own content and everything it is made from (a board: its module's code and the version of every prop type it places, listed in `props`; a concept, chapter or book: its children's versions). `build/index.json` also names the commit it was built from (`<sha>-dirty` with uncommitted changes; `pnpm ship` refuses those).

A node's file is `build/<path>.json` (`build/class10-maths.json`, `build/class10-maths/real-numbers.json`, …), next to `index.json` and `graph.json`. It is generated, never edited, and not in git. `platform/content-source/modules.gen.ts` (every module that makes boards, for the app and the server to load) is generated too, and committed, like each chapter's `concepts.gen.ts`.

## Colours

A prop's colour field takes a role of the look (`Color.Primary`, `Color.OnSurface`, from `@chalk/prop`), which follows the app's theme, or any `#rrggbb` of the content's own. Use a role for "the thing to look at" or "plain ink"; use a hex when the colour means something across pages (ℕ is always the same blue: `library/patterns/colors.ts`).

## Art

A book, chapter or concept can have a picture: an `art.tsx` next to its `build.yaml`, drawn with the same pieces as the props. See [making-art.md](./making-art.md); `pnpm art` shows them all.

A concept's `build.yaml` may also give a `glyph` (one to four characters: `½`, `0.1`, `√`) for its stop on the chapter's path.
