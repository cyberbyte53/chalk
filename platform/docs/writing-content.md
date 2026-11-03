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
props: [decimalExpansion]          # optional: extra explainers (for Jugnu, when he is built)
```

A book has `title` and `chapters`; `content/build.yaml` has `books`. Unknown fields fail the build.

**A concept's explainers** (for Jugnu, when he is built) are worked out, not listed: a concept's are the explainers its pages place, those the questions testing it place, and its `props:` extras; a chapter's are the union of its concepts'. Write `props:` only for an explainer nothing on the concept's boards uses.

**`concepts.gen.ts`** is the chapter's concepts as an enum, made from `build.yaml` by `pnpm build-content` (and `preview`). Commit it. Rename or drop a concept and every family still naming it stops compiling; the build also fails while the file is out of date.

## The overview (`overview.ts`)

A page is a scene ([board-model.md](board-model.md#a-board-its-scene)): its pieces, top to bottom, and the lesson's rules.

```ts
const seatingPlan = page(
  "seating-plan",
  scene({
    pieces: {
      title: words.title(t("Desks in a classroom", "कक्षा में डेस्क")),
      tap: words.body(t("Tap the desk at (5, 3), then the one at (3, 5).", "…")),
      room: place(coordinatePlane, setup(classroom(), { places: { showAddress: true } })),
      same: hidden(same.piece),          // a question, shown once both desks are tapped
    },
    uses: [same.use],
    hear: {
      "room.places.targetChosen": (me, p, t) => …,
    },
    witness: [tap("room", "places.chooseTarget", { x: 5, y: 3 }), …],
  }),
);

/** The pages, in reading order. Leave one out to drop it from the build. */
export const overview = [busStops, streetAndHouse, dotOnPaper, seatingPlan, twoLines];
```

- **Pieces, top to bottom:** `place(def, given)`, part by part for a prop that holds parts (`{ plane: { window }, walker: { walkFrom } }`); words with `words.title`, `words.body`, `words.note`, `words.definition` (`@chalk/patterns`). What a piece says aloud, when not its words as shown: `{ says: t(…) }`.
- **What appears later:** `hidden(piece)` starts it hidden; a rule shows it (`t.self.show({ name: "found" })`). A piece hidden that nothing shows doesn't build.
- **The lesson's rules:** `hear` answers a piece's signal (`"town.walker.arrived": (me, p, t) => …`), `onSaid` a line's end. A rule reads the board as `me` (each piece by name), the payload as `p`, and acts with `t` ([board-model.md](board-model.md#a-rule)). Conditions are plain TypeScript, typed from the pieces.
- **When the student may go on:** when every question on the page is right; at once on a page with none. `passBy: "rules"` makes it pass only when a rule says `t.self.pass()`. Passing also opens the board (`isOpen`): what the student may then play with is the board's choice (houses placed with `choosing: Choosing.OnceOpen`, or a rule that hands them the dot), so the story can't be broken while it is being shown ([board-model.md](board-model.md#the-boards-own-actions-and-signals)).
- **Questions:** `choice({ prompt, options, answer })` from `@chalk/patterns`, its options shuffled the same way every build (`keepOrder` keeps them as written); `check({ about, prompt, isRight, solve, notes })` for "get this prop into a state, then Check". Each gives a `piece` and a `use` (its rules, its witness, its note checks): place the piece, list the use in `uses`. The build writes the page's concept into them, ungraded: answering one teaches but counts towards no mastery. Bank questions are graded on the concepts they test.
- **A picture:** a prop drawn still, from the setup you give it: `place(coordinatePlane, …, { still: t("The main road and Street 4, with Aman's house", "…") })`. Nothing on it can be tapped, dragged or focused, and the sentence is what a screen reader reads.
- **Sizes are the player's:** a board is drawn for a phone and fits any screen on its own (the column grows to 640px, text grows with it, props scale; see [making-a-prop.md](./making-a-prop.md)). A placement can override its prop's rule: `place(def, given, { size: { fit: "fill" } })`.
- **Every interactive page has a witness:** how a student gets through it, as taps (`tap("town", "walker.step", { direction: "up" })`) and waits, played on the real props at publish.

A bank question's `build` returns a scene the same way, and passes when its questions are right.

## A question family (`family.ts` + `params.yaml`)

```ts
import { Concept } from "../../concepts.gen";

/** Given an address, walk Riya there: along the main road to the street, then up it to the house. */
export const walkToAddress = family({
  level: Level.Easy,
  tests: [Concept.TwoNumbersForAPlace],             // one or more of the chapter's concepts
  params: z.object({ street: z.number().int(), house: z.number().int() }).strict(),
  build: ({ street, house }) => {
    const town = place(coordinatePlane, plane.town());
    const ask = check({
      about: "town",
      prompt: t(`Aman lives at **Street ${street}, House ${house}**. Walk Riya there, then press Check.`, "…"),
      isRight: plane.isAt("town", street, house),
      solve: plane.walkTo("town", street, house),    // the witness
      notes: [{ when: plane.isAt("town", house, street), say: t("The street comes first…", "…"),
                reach: plane.walkTo("town", house, street) }],
    });
    return scene({ pieces: { town, ask: ask.piece }, uses: [ask.use] });
  },
});
```

```yaml
- params: { street: 4, house: 3 }
- params: { street: 2, house: 5 }
  level: medium                    # overrides the family's level
# the corner itself: too easy to tell anything
- params: { street: 1, house: 1 }
  origin: generated
  exclude: true
```

- `family.ts` exports exactly one `family(...)`. It never names its folder. `tests` is for the whole family: if rows would test different concepts, they are two families.
- Each row is one question. `params` is checked against the family's `params` schema; `decimal` turns `"7.384"` into an exact `Dec`; quote it, because unquoted YAML reads a float and drops trailing zeros (`7.30` → `7.3`), so the build refuses an unquoted one. A row may set `level` (else the family's), `origin` (`authored` by default, `generated` from the question generator) and `exclude` (kept in the file, left out of the build).
- Every question has a witness (how a student gets it right) and a note check per note. The build plays them on the real props; a row that fails is reported and left out, the other rows still build.
- The concepts a question tests are written into its question prop by the build, as ids.

## Rules for TypeScript content

- Pieces, their parts, actions, signals and what a rule reads come from the props' definitions, typed: `t.to.town.plane.raiseUpLine({ at: 4 })`, `"town.walker.arrived"`, `me.town.walker.at`. Naming one a prop doesn't have is a compile error.
- Numbers a student sets are compared with an exact decimal, `dec("7.384").isAt(value)`, never `==` on floats.
- Every learner-facing string is `t(en, hi)`.
- When the same board-building shows up a second or third time, lift it into `library/patterns/` (`choice`, `check`, `plane.walkTo`).

## Words and maths

Every learner-facing string (text, prompts, options, feedback, notes) is **rich text**: plain words plus a small, fixed syntax.

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
