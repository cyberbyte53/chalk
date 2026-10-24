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
| `platform/packages/prop` | `@chalk/prop` | The prop contract (state, actions, signals, parts), the one door, the board prop, the question role, colours (`colorSchema`: a look role or `#rrggbb`), expressions, plain-text descriptions | `@chalk/look` (names), `zod` |
| `platform/packages/content` | `@chalk/content` | Content formats (Zod): lesson, board (layout + IS + WHEN), scripts, events, audio keys, and the built formats in `build/` (book, chapter, concept, page, family, question) | `@chalk/prop` (types), `zod` |
| `platform/packages/exact` | `@chalk/exact` | Exact decimals for content (`dec("7.384")`): kept as written, digit work without floats | nothing |
| `platform/packages/author` | `@chalk/author` | How content is written: typed board building (props, IS, WHEN, witnesses), `page`, `family`, manifest schemas, ids and versions | `@chalk/content`, `@chalk/prop`, `@chalk/exact`, `zod`, `node:crypto` |
| `platform/packages/events` | `@chalk/events` | The event backbone: adds the envelope, checks schemas, hands events to subscribers | `@chalk/content` |
| `platform/packages/jugnu` | `@chalk/jugnu` | Jugnu, the AI tutor: an agent loop over the board as data, run on the server on a copy of the board, with tools to think (try what actions would do, calculate) and one reply (say, show, point, then ask with options or go quiet), typed from the board's actions and strict where the board allows through a swappable model (any OpenAI-style API, Ollama); his reply comes back as cues the phone plays | `@chalk/content`, `@chalk/prop`, `zod` |
| `platform/packages/player` | `@chalk/player` | The board runtime (framework-free; state in `@preact/signals-core`) and the player (Preact, re-rendering each prop only when its own view changes): layout, chrome (Check, comments, Continue, Jugnu's chat), narration, rich text (KaTeX); raises commits as events | `@chalk/content`, `@chalk/prop`, `@chalk/events`, `@chalk/jugnu`, `preact`, `@preact/signals`, `katex` |
| `library/props/<name>` | `@chalk/prop-<name>` | One prop (or a family) each: definition + view + its own `styles.css` (drawn with the look's tokens) | `@chalk/prop`, `@chalk/content`, `@chalk/player` (types), `@chalk/draw`, `preact` |
| `library/registry` | `@chalk/library` | The registry of every prop type, and `styles.css` gathering every prop's styles | props, `@chalk/prop`, `@chalk/player` (types) |
| `platform/studio` | `@chalk/studio` | Validator and publish for JSON lessons (ids, version, audio); the content build (`pnpm build-content`, `pnpm preview`, `pnpm publish-content`: manifests walked, boards checked, witnesses played on the real props, `build/` written); later a viewer | `@chalk/content`, `@chalk/prop`, `@chalk/library`, Node |
| `platform/packages/api` | `@chalk/api` | What the app and the server say to each other: paths, request and reply schemas, roles, error codes, join and school codes; progress from events (`progressFrom`), the same on both sides | `@chalk/content` (event types), `zod` |
| `platform/apps/learner` | `@chalk/learner-app` | The app (a PWA): Google sign-in, setup, joining a teacher, home, a chapter's path, a concept's pages and practice, the result; a teacher's groups and their learners' progress; events kept on the phone and uploaded | everything above |
| `platform/apps/server` | `@chalk/server` | The server: Hono API (Google sign-in, setup, groups, joining, events), Jugnu's turns (thought through here on a board with no screen; the model's key never leaves) and flagged chats, the built app; Postgres through Drizzle | `@chalk/api`, `@chalk/content`, `@chalk/jugnu`, `@chalk/player` (the runtime), `@chalk/library`, Node, `hono`, `drizzle-orm`, `postgres`, `google-auth-library` |
| `platform/deploy/` | (no package) | Running it on the box: Docker Compose (Postgres, the app, Caddy for HTTPS, nightly backups), `pnpm ship` and `pnpm add-school`; see `platform/deploy/README.md` | n/a |
| `content/` | `@chalk/content-source` | The content tree: `build.yaml` manifests (books → chapters → concepts), each concept's `overview.ts`, each chapter's question bank `questions/<family>/{family.ts, params.yaml}` and generated `concepts.gen.ts`, `graph.yaml`, `principles.md` (the taste), `review/` (screen-review comments), `sources/` (textbooks); the older lessons as JSON | `@chalk/author`, `@chalk/content`, `@chalk/exact`, `@chalk/patterns`, prop packages |
| `library/patterns` | `@chalk/patterns` | Board patterns every lesson shares: question shapes (`choiceQuestion`, `goalQuestion`, `orderQuestion`), colours, LaTeX helpers, the magnifier | `@chalk/author`, `@chalk/content`, `@chalk/prop`, a few prop packages |
| `tmp/` | (ignored) | The old codebase, parked for reference; not tracked | n/a |

## Layers

```text
apps/learner, studio
  → library            (which props exist)
  → library/props/*          (each prop: definition + view)
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
5. When the learner asks Jugnu (on any board), the phone sends the board, its state and the chat to the server, which thinks the turn through on a copy of the board with no screen: tries actions and calculates out of sight, then writes one reply, which is checked on the copy before it goes. It comes back as cues the phone plays; his actions go through the phone's own door as `Actor.Jugnu`, under limits the runtime enforces on both sides (see `platform/packages/jugnu/README.md`).
6. Commits (Continue, Check, lesson start/complete/leave, a question to Jugnu) become events on the backbone (see [events.md](./events.md)). Today the dev log subscribes; later the uploader will.

## How content is built

1. `content/build.yaml` lists the books; each folder's `build.yaml` lists its children in order (books → chapters → concepts). Only what is listed is built; every name is checked against the folders.
2. A concept's pages come from its `overview.ts`. A chapter's question bank comes from each family folder under its `questions/`: `family.ts` built once per row of `params.yaml`; each family names the concepts it `tests`.
3. A book, chapter or concept with an `art.tsx` gets its art drawn with `@chalk/draw` (rendered to SVG in Node) and checked; see [making-art.md](./making-art.md).
4. Every board is checked (the lesson validator, then its witness and note checks played on the real props on fake time). Every item gets an id (a hash of its path, plus a question's params), a version (a hash of its built JSON) and its source.
5. The result is plain JSON in `build/`, mirroring the tree; nothing of the TypeScript ships. `pnpm build-content` writes it once, `pnpm preview` on every save (the learner app shows it in development), `pnpm publish-content` only from a clean commit, keeping a copy as `published/<commit>/`. See [writing-content.md](./writing-content.md).

## Not built yet

Jugnu's slate, speech and memory, chapter bundles and the CDN, the learner model, what stood out (misconceptions) on the teacher's view, the Studio GUI. The system design doc is the reference for all of these.
