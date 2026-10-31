# Architecture

The single map of this repo. README and AGENTS link here instead of copying it. The model itself is in [board-model.md](./board-model.md).

## Three layers

```text
content/     the books                       → may import library and the core
library/     props, patterns, the registry   → may import the core
platform/    packages/ (the core)            → imports nothing above it
             apps/, studio/, deploy/, docs/  → the assembly: may import everything
```

`pnpm boundaries` (part of `pnpm check`) reads every package's dependencies and imports and fails on a crossing. The point: a chapter is written by changing `content/` and, when a new prop is needed, `library/`; `platform/` stays still.

## Packages

| Path | Package | Role | May import |
|---|---|---|---|
| `platform/packages/look` | `@chalk/look` | The look: design tokens (`tokens.json`: colour roles, fonts, type scale) generated into CSS variables (`look.css`) and the `Color` names; `cssColor`. The one place a raw colour lives | nothing |
| `platform/packages/draw` | `@chalk/draw` | The drawing pieces (`Stage`, `Axis`, `Dot`, `Mark`, `Curve`, `Dots`, `OnTop`): d3 geometry + the look's tokens + the optimisations in [drawing.md](./drawing.md). The only package that imports d3 | `@chalk/look`, `preact`, `d3-scale`, `d3-shape` |
| `platform/packages/prop` | `@chalk/prop` | The board model ([board-model.md](./board-model.md)): `prop()` (variables, facts, needs, actions, signals, rules, parts), the `Board` (events, the queue, planned moves, replay), the question role, colours (`colorSchema`: a look role or `#rrggbb`), the view tags and descriptions | `@chalk/look` (names), `zod` |
| `platform/packages/content` | `@chalk/content` | Content formats (Zod): lesson, board (its scene + layout), events, sound cues, and the built formats in `build/` (book, chapter, concept, page, family, question) | `@chalk/prop` (types), `zod` |
| `platform/packages/exact` | `@chalk/exact` | Exact decimals for content (`dec("7.384")`): kept as written, digit work without floats | nothing |
| `platform/packages/author` | `@chalk/author` | How content is written: `scene()` (pieces, the lesson's rules, witnesses), `page`, `family`, manifest schemas, ids and versions | `@chalk/content`, `@chalk/prop`, `@chalk/exact`, `zod`, `node:crypto` |
| `platform/packages/events` | `@chalk/events` | The event channel: one `record()`, which adds the envelope, checks each kind's payload and hands entries to subscribers | `@chalk/content` |
| `platform/packages/player` | `@chalk/player` | The board runtime (a board model `Board` on the screen's clock) and the player (Preact, re-rendering each prop only when its own view changes): layout, chrome (comments, Continue, the prop panel), sound (sound/: the engine, the voice), rich text (KaTeX); records what happens on each board (recorder.ts) | `@chalk/content`, `@chalk/prop`, `@chalk/events`, `preact`, `@preact/signals`, `katex` |
| `library/props/<name>` | `@chalk/prop-<name>` | One prop (or a family) each: definition + view + its own `styles.css` (drawn with the look's tokens) | `@chalk/prop`, `@chalk/content`, `@chalk/player` (types), `@chalk/draw`, `preact` |
| `library/registry` | `@chalk/library` | The registry of every prop type, and `styles.css` gathering every prop's styles | props, `@chalk/prop`, `@chalk/player` (types) |
| `platform/studio` | `@chalk/studio` | The content build (`pnpm build-content`, `pnpm preview`, `pnpm publish-content`: manifests walked, boards checked, witnesses played on the real props, `build/` written); later a viewer | `@chalk/content`, `@chalk/prop`, `@chalk/library`, Node |
| `platform/packages/api` | `@chalk/api` | What the app and the server say to each other: paths, request and reply schemas, roles, error codes, join and school codes; board facts from events and progress from them and the tree (`boardFactsFrom`, `progressFrom`), the same on both sides | `@chalk/content` (event types), `zod` |
| `platform/apps/learner` | `@chalk/learner-app` | The app (a PWA): Google sign-in, setup, joining a teacher, home, a chapter's path, a concept's pages and practice, the result; a teacher's groups and their learners' progress; events kept on the phone and uploaded | everything above |
| `platform/apps/server` | `@chalk/server` | The server: Hono API (Google sign-in, setup, groups, joining, events); the built app; Postgres through Drizzle | `@chalk/api`, `@chalk/content`, `@chalk/library`, Node, `hono`, `drizzle-orm`, `postgres`, `google-auth-library` |
| `platform/deploy/` | (no package) | Running it on the box: Docker Compose (Postgres, the app, Caddy for HTTPS, nightly backups), `pnpm ship` and `pnpm add-school`; see `platform/deploy/README.md` | n/a |
| `content/` | `@chalk/content-source` | The content tree: `build.yaml` manifests (books → chapters → concepts), each concept's `overview.ts`, each chapter's question bank `questions/<family>/{family.ts, params.yaml}` and generated `concepts.gen.ts`, `graph.yaml`, `principles.md` (the taste), `review/` (screen-review comments), `sources/` (textbooks) | `@chalk/author`, `@chalk/content`, `@chalk/exact`, `@chalk/patterns`, prop packages |
| `library/patterns` | `@chalk/patterns` | Board patterns every lesson shares: words and question shapes (`words`, `choice`, `check`), the coordinate plane's setups and taps (`plane`) | `@chalk/author`, `@chalk/content`, `@chalk/prop`, a few prop packages |
| `tmp/` | (ignored) | The old codebase, parked for reference; not tracked | n/a |

## Layers

```text
apps/learner, studio
  → library            (which props exist)
  → library/props/*          (each prop: definition + view)
  → draw               (the pieces props and art are drawn with; the only home of d3)
  → player             (runs boards; never names a specific prop)
  → events             (the event backbone)
  → content            (formats, including event shapes)
  → prop               (the contract; no UI)
  → look               (design tokens; read by everything that draws)
```

Lower layers never import higher ones. `prop` and `content` have no UI.

Styles: the app loads `@chalk/look/look.css`, then `@chalk/player/styles.css` (the player's screens) and `@chalk/library/styles.css` (every prop's own). Props and the player use only the look's variables, so a theme is a change to `tokens.json` alone. Views never import CSS: the studio runs them in Node. A helper library (e.g. for geometry or 3D) only ever lives inside one prop.

## How a lesson plays

1. The content build checks every board (formats, every prop's contract, the wiring, its witness) and writes the course to `build/` (see "How content is built" below).
2. When a chapter is opened, the app fetches its pages' and questions' files, makes each board from its module's code (`boardOf`), groups them into lessons and hands each to `LessonPlayer` with the prop library.
3. Each board gets a `BoardRuntime`: its scene starts, every piece from its start plus what the lesson gives, and the board tells `started`; the screen's frame loop moves its clock and does what is due.
4. The learner's taps and drags are actions from the screen; touching a prop drops what the props holding it had queued for it.
5. Everything the learner does is recorded on the event channel (see [events.md](./events.md)); the uploader sends it to the server, whose processors keep board facts and progress.

## How content is built

1. `content/build.yaml` lists the books; each folder's `build.yaml` lists its children in order (books → chapters → concepts). Only what is listed is built; every name is checked against the folders.
2. A concept's pages come from its `overview.ts`. A chapter's question bank comes from each family folder under its `questions/`: `family.ts` built once per row of `params.yaml`; each family names the concepts it `tests`.
3. A book, chapter or concept with an `art.tsx` gets its art drawn with `@chalk/draw` (rendered to SVG in Node) and checked; see [making-art.md](./making-art.md).
4. Every board is checked: its witness and note checks played on the real props, the clock jumped, in every language. Every item gets an id (a hash of its path, plus a question's params), a version (a hash of its built JSON, which holds the hash of the code that makes its board) and its source.
5. **Chapters ship as code.** `build/` holds JSON, mirroring the tree: the course's shape, and each page and question by which module makes its board (`overview.ts`, or `family.ts` with its params row). The board itself is never turned into data: the app and the build each make it from that module (`boardOf` in `@chalk/author`), so its rules stay typed functions. `platform/content-source/modules.gen.ts` lists the modules (generated from the manifests); the app splits each into its own chunk, fetched when its chapter is first opened and kept for offline. `pnpm build-content` writes it once, `pnpm preview` on every save (the learner app shows it in development), `pnpm publish-content` only from a clean commit, keeping a copy as `published/<commit>/`. See [writing-content.md](./writing-content.md).

## Not built yet

Jugnu (parked, to be remade on the board model), chapter bundles and the CDN, the learner model, what stood out (misconceptions) on the teacher's view, the Studio GUI. The system design doc is the reference for all of these.
