# Agent notes

The repo has three layers, and they import one way (`pnpm boundaries` checks):

```text
content/    the books: book → chapter → lesson (overview pages + question bank). Changes every day.
library/    props and board patterns, shared across books. Grows with every chapter.
platform/   the fixed code: packages (the core), apps, studio tooling, deploy, engineering docs.
```

Read before changing code:

1. [platform/docs/glossary.md](platform/docs/glossary.md): use these names, nothing else.
   [platform/docs/board-model.md](platform/docs/board-model.md): props, IS, WHEN, THEN.
2. [platform/docs/architecture.md](platform/docs/architecture.md): packages, layers, what may import what.
   [platform/docs/how-it-works.md](platform/docs/how-it-works.md): the whole loop, end to end.
3. [platform/docs/code-conventions.md](platform/docs/code-conventions.md): style and rules.

Before writing content: [content/principles.md](content/principles.md) is the taste — what a lesson is, the story, the teaching rules, questions, writing, props. Every chapter is planned against it and reviewed against it.

Rules of thumb:

- The model: props (state, actions, signals, parts) wired by IS, WHEN and THEN. Read [platform/docs/board-model.md](platform/docs/board-model.md) before writing a lesson or a prop.
- Every change to a prop is one of its actions, through the one door (`BoardRuntime.call`). Never set prop state directly.
- Events: only commits are logged; see [platform/docs/events.md](platform/docs/events.md).
- Art (a book's, chapter's or lesson's picture): an `art.tsx` next to its `build.yaml`; read [platform/docs/making-art.md](platform/docs/making-art.md) and look at `pnpm art`.
- Drawing: read [platform/docs/drawing.md](platform/docs/drawing.md). Draw with `@chalk/draw`'s pieces; before writing geometry, a shape, a scale or a statistic by hand, check the d3 list there and use or extend it. d3 is imported only inside `@chalk/draw`.
- New prop: it lives in `library/props/<name>`, never inside a chapter. Follow [platform/docs/making-a-prop.md](platform/docs/making-a-prop.md) (contract first, laws as tests, then code), then add one line to `library/registry/src/index.ts`.
- A board shape that shows up a second time goes to `library/patterns/` (`@chalk/patterns`).
- New content: read [platform/docs/writing-content.md](platform/docs/writing-content.md). Folders with `build.yaml` manifests; pages in `overview.ts`; questions as `family.ts` + `params.yaml` in the chapter's `questions/`, with `tests: [Concept.X]` from `concepts.gen.ts`; every question has a witness. `pnpm build-content` must say every check passed. (The code still says `concept` where the docs say lesson: same thing.)
- Older JSON lessons: `content/<book>/<chapter>/lessons/*.json`, published with `pnpm publish-lesson <file>` (hands out permanent ids; never edit or reuse an `id`). Nothing is spoken unless a script calls `say`; screen text is turned into spoken words by `content/pronunciations.json`.
- `tmp/` is the old code, for reference only. Do not import from it or edit it.
- Done means `pnpm check` passes.
