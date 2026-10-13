# Architecture

The single map of this repo. README and AGENTS link here instead of copying it. The model itself is in [board-model.md](./board-model.md).

## Packages

| Path | Package | Role | May import |
|---|---|---|---|
| `packages/prop` | `@chalk/prop` | The prop contract (state, actions, signals, parts), the one door, the board prop, the question role, expressions, plain-text descriptions | `zod` |
| `packages/content` | `@chalk/content` | Content formats (Zod): lesson, board (layout + IS + WHEN), scripts, events, audio keys | `@chalk/prop` (types), `zod` |
| `packages/events` | `@chalk/events` | The event backbone: adds the envelope, checks schemas, hands events to subscribers | `@chalk/content` |
| `packages/jugnu` | `@chalk/jugnu` | Jugnu, the AI tutor: an agent loop over the whole board as data, with tools (the board's own actions, point, calculate, hand back) through a swappable model (any OpenAI-style API, Ollama) | `@chalk/content`, `@chalk/prop`, `zod` |
| `packages/player` | `@chalk/player` | The board runtime (framework-free) and the player (Preact): layout, chrome (Check, feedback, Continue, Jugnu's chat), narration; raises commits as events | `@chalk/content`, `@chalk/prop`, `@chalk/events`, `@chalk/jugnu`, `preact` |
| `props/<name>` | `@chalk/prop-<name>` | One prop (or a family) each: definition + view | `@chalk/prop`, `@chalk/content`, `@chalk/player` (types), `preact` |
| `library` | `@chalk/library` | The registry of every prop type | props, `@chalk/prop`, `@chalk/player` (types) |
| `studio` | `@chalk/studio` | Validator and publish (ids, version, audio); later the authoring GUI | `@chalk/content`, `@chalk/prop`, `@chalk/library`, Node |
| `apps/learner` | `@chalk/learner-app` | The learner app (dev shell for now) | everything above |
| `content/` | (data) | Lessons as JSON, by course and chapter | n/a |
| `tmp/` | (ignored) | The old codebase, parked for reference; not tracked | n/a |

## Layers

```text
apps/learner, studio
  → library            (which props exist)
  → props/*            (each prop: definition + view)
  → player             (runs boards; never names a specific prop)
  → jugnu              (the mentor; sees a board only through the JugnuBoard interface)
  → events             (the event backbone)
  → content            (formats, including event shapes)
  → prop               (the contract; no UI)
```

Lower layers never import higher ones. `prop` and `content` have no UI. A helper library (e.g. for geometry or 3D) only ever lives inside one prop.

## How a lesson plays

1. `content/**/lessons/*.json` goes through `pnpm publish-lesson`: checked (formats, every prop's contract, the wiring), given permanent ids, version bumped, and with `--voice` the lines scripts say are spoken. The latest published copy is in `published/`, and every version in `published/versions/`.
2. The app parses it (`parseLesson`) and hands it to `LessonPlayer` with the prop library.
3. Each board gets a `BoardRuntime`: every prop starts from its defaults plus what the lesson gives (through the one door), IS rules are made true, and `board.started` is raised, which usually starts the board's script.
4. The learner's taps and drags call the same actions; touching a prop stops the lesson's animation on it.
5. When the learner asks Jugnu (on a question board), he reads the whole board as data and works in a loop: act, point or calculate, see the result, decide; his actions go through the same door as `Actor.Jugnu`, under limits the runtime enforces (see `packages/jugnu/README.md`).
6. Commits (Continue, Check, lesson start/complete/leave, a question to Jugnu) become events on the backbone (see [events.md](./events.md)). Today the dev log subscribes; later the uploader will.

## Not built yet

Jugnu's slate, speech and memory, chapter bundles and the CDN, event upload, the server and learner model, the teacher view, the Studio GUI. The system design doc is the reference for all of these.
