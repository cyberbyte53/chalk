# Agent notes

Read before changing code:

1. [docs/glossary.md](docs/glossary.md): use these names, nothing else.
   [docs/board-model.md](docs/board-model.md): props, IS, WHEN, THEN.
2. [docs/architecture.md](docs/architecture.md): packages, layers, what may import what.
   [docs/how-it-works.md](docs/how-it-works.md): the whole loop, end to end.
3. [docs/code-conventions.md](docs/code-conventions.md): style and rules.

Rules of thumb:

- The model: props (state, actions, signals, parts) wired by IS, WHEN and THEN. Read [docs/board-model.md](docs/board-model.md) before writing a lesson or a prop.
- Every change to a prop is one of its actions, through the one door (`BoardRuntime.call`). Never set prop state directly.
- Events: only commits are logged; see [docs/events.md](docs/events.md).
- Art (a book's, chapter's or concept's picture): an `art.tsx` next to its `build.yaml`; read [docs/making-art.md](docs/making-art.md) and look at `pnpm art`.
- Drawing: read [docs/drawing.md](docs/drawing.md). Draw with `@chalk/draw`'s pieces; before writing geometry, a shape, a scale or a statistic by hand, check the d3 list there and use or extend it. d3 is imported only inside `@chalk/draw`.
- New prop: follow [docs/making-a-prop.md](docs/making-a-prop.md) (contract first, laws as tests, then code), then add one line to `library/src/index.ts`.
- New lesson: JSON under `content/<course>/<chapter>/lessons/`, props named in camelCase, leave `id`s out, then `pnpm publish-lesson <file>` (hands out permanent ids). Never edit or reuse an `id`. Nothing is spoken unless a script calls `say`; add `--voice macos` to make the audio. Screen text is turned into spoken words by `content/pronunciations.json` (maths, units, chemistry, short forms); if the validator says the voice can't read something, write a `speak` line in plain words or add a rule there.
- New content: read [docs/writing-content.md](docs/writing-content.md). Folders with `build.yaml` manifests; pages in `overview.ts`; questions as `family.ts` + `params.yaml` in the chapter's `questions/`, with `tests: [Concept.X]` from `concepts.gen.ts`; every question has a witness. `pnpm build-content` must say every check passed.
- `tmp/` is the old code, for reference only. Do not import from it or edit it.
- Done means `pnpm check` passes.
