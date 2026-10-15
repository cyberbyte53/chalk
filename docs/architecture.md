# Architecture

The single map of this repo. README and AGENTS link here instead of copying it. The model itself is in [board-model.md](./board-model.md).

## Packages

| Path | Package | Role | May import |
|---|---|---|---|
| `packages/look` | `@chalk/look` | The look: design tokens (`tokens.json`: colour roles, fonts, type scale) generated into CSS variables (`look.css`) and the `Color` names; `cssColor`. The one place a raw colour lives | nothing |
| `packages/draw` | `@chalk/draw` | The drawing pieces (`Stage`, `Axis`, `Dot`, `Mark`, `Curve`, `Dots`, `OnTop`): d3 geometry + the look's tokens + the optimisations in [drawing.md](./drawing.md). The only package that imports d3 | `@chalk/look`, `preact`, `d3-scale`, `d3-shape` |
| `packages/prop` | `@chalk/prop` | The prop contract (state, actions, signals, parts), the one door, the board prop, the question role, colours (`colorSchema`: a look role or `#rrggbb`), expressions, plain-text descriptions | `@chalk/look` (names), `zod` |
| `packages/content` | `@chalk/content` | Content formats (Zod): lesson, board (layout + IS + WHEN), scripts, events, audio keys, and the built formats in `build/` (book, chapter, concept, page, family, question) | `@chalk/prop` (types), `zod` |
| `packages/exact` | `@chalk/exact` | Exact decimals for content (`dec("7.384")`): kept as written, digit work without floats | nothing |
| `packages/author` | `@chalk/author` | How content is written: typed board building (props, IS, WHEN, witnesses), `page`, `family`, manifest schemas, ids and versions | `@chalk/content`, `@chalk/prop`, `@chalk/exact`, `zod`, `node:crypto` |
| `packages/events` | `@chalk/events` | The event backbone: adds the envelope, checks schemas, hands events to subscribers | `@chalk/content` |
| `packages/jugnu` | `@chalk/jugnu` | Jugnu, the AI tutor: an agent loop over the whole board as data, with tools (the board's own actions, point, calculate, hand back) through a swappable model (any OpenAI-style API, Ollama) | `@chalk/content`, `@chalk/prop`, `zod` |
| `packages/player` | `@chalk/player` | The board runtime (framework-free; state in `@preact/signals-core`) and the player (Preact, re-rendering each prop only when its own view changes): layout, chrome (Check, feedback, Continue, Jugnu's chat), narration, rich text (KaTeX); raises commits as events | `@chalk/content`, `@chalk/prop`, `@chalk/events`, `@chalk/jugnu`, `preact`, `@preact/signals`, `katex` |
| `props/<name>` | `@chalk/prop-<name>` | One prop (or a family) each: definition + view + its own `styles.css` (drawn with the look's tokens) | `@chalk/prop`, `@chalk/content`, `@chalk/player` (types), `@chalk/draw`, `preact` |
| `library` | `@chalk/library` | The registry of every prop type, and `styles.css` gathering every prop's styles | props, `@chalk/prop`, `@chalk/player` (types) |
| `studio` | `@chalk/studio` | Validator and publish for JSON lessons (ids, version, audio); the content build (`pnpm build-content`, `pnpm preview`, `pnpm publish-content`: manifests walked, boards checked, witnesses played on the real props, `build/` written); later a viewer | `@chalk/content`, `@chalk/prop`, `@chalk/library`, Node |
| `apps/learner` | `@chalk/learner-app` | The learner app (dev shell for now) | everything above |
| `content/` | `@chalk/content-source` | The content tree: `build.yaml` manifests (books → chapters → concepts), each concept's `overview.ts`, each chapter's question bank `questions/<family>/{family.ts, params.yaml}` and generated `concepts.gen.ts`, `graph.yaml`, shared board patterns (`patterns/`); the older lessons as JSON | `@chalk/author`, `@chalk/content`, `@chalk/exact`, prop packages |
| `tmp/` | (ignored) | The old codebase, parked for reference; not tracked | n/a |

## Layers

```text
apps/learner, studio
  → library            (which props exist)
  → props/*            (each prop: definition + view)
  → draw               (the pieces props and art are drawn with; the only home of d3)
  → player             (runs boards; never names a specific prop)
  → jugnu              (the mentor; sees a board only through the JugnuBoard interface)
  → events             (the event backbone)
  → content            (formats, including event shapes)
  → prop               (the contract; no UI)
  → look               (design tokens; read by everything that draws)
```

Lower layers never import higher ones. `prop` and `content` have no UI.

Styles: the app loads `@chalk/look/look.css`, then `@chalk/player/styles.css` (the player's screens) and `@chalk/library/styles.css` (every prop's own). Props and the player use only the look's variables, so a theme is a change to `tokens.json` alone. Views never import CSS: the studio runs them in Node. A helper library (e.g. for geometry or 3D) only ever lives inside one prop.

## How a lesson plays

1. `content/**/lessons/*.json` goes through `pnpm publish-lesson`: checked (formats, every prop's contract, the wiring), given permanent ids, version bumped, and with `--voice` the lines scripts say are spoken. The latest published copy is in `published/`, and every version in `published/versions/`.
2. The app parses it (`parseLesson`) and hands it to `LessonPlayer` with the prop library.
3. Each board gets a `BoardRuntime`: every prop starts from its defaults plus what the lesson gives (through the one door), each IS rule becomes an effect that runs again only when a prop it read changes, and `board.started` is raised, which usually starts the board's script.
4. The learner's taps and drags call the same actions; touching a prop stops the lesson's animation on it.
5. When the learner asks Jugnu (on any board), he reads the whole board as data and works in a loop: act, point or calculate, see the result, decide; his actions go through the same door as `Actor.Jugnu`, under limits the runtime enforces (see `packages/jugnu/README.md`).
6. Commits (Continue, Check, lesson start/complete/leave, a question to Jugnu) become events on the backbone (see [events.md](./events.md)). Today the dev log subscribes; later the uploader will.

## How content is built

1. `content/build.yaml` lists the books; each folder's `build.yaml` lists its children in order (books → chapters → concepts). Only what is listed is built; every name is checked against the folders.
2. A concept's pages come from its `overview.ts`. A chapter's question bank comes from each family folder under its `questions/`: `family.ts` built once per row of `params.yaml`; each family names the concepts it `tests`.
3. A book, chapter or concept with an `art.tsx` gets its art drawn with `@chalk/draw` (rendered to SVG in Node) and checked; see [making-art.md](./making-art.md).
4. Every board is checked (the lesson validator, then its witness and note checks played on the real props on fake time). Every item gets an id (a hash of its path, plus a question's params), a version (a hash of its built JSON) and its source.
5. The result is plain JSON in `build/`, mirroring the tree; nothing of the TypeScript ships. `pnpm build-content` writes it once, `pnpm preview` on every save (the learner app shows it in development), `pnpm publish-content` only from a clean commit, keeping a copy as `published/<commit>/`. See [writing-content.md](./writing-content.md).

## Not built yet

Jugnu's slate, speech and memory, chapter bundles and the CDN, event upload, the server and learner model, the teacher view, the Studio GUI. The system design doc is the reference for all of these.
