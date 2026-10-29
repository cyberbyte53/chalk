# Code conventions

Rules for TypeScript in this monorepo. Must/should language. Inspired by Google TypeScript Style and common monorepo practice.

## Names first

- Use the names in [glossary.md](./glossary.md). One concept, one name across code, content and docs.
- A new concept gets a glossary row before it gets code.

## Package boundaries

- Each package is a real unit: `package.json`, `tsconfig.json`, public entry `src/index.ts`, and a short `README.md` (what it is, what it may import, what it exports).
- Cross-package imports use the package name (`@chalk/...`), never relative paths into another package.
- Import only another package's public entry, never its internals.
- The dependency graph stays acyclic and follows the layers in [architecture.md](./architecture.md).
- `prop` and `content` must not import UI code.
- The player must never import a specific prop; props reach it through the library.
- A helper library (geometry, 3D, physics) lives inside one prop, never in the model or the lesson format. The one shared exception is drawing: d3 lives in `@chalk/draw`, and props draw with its pieces (see [drawing.md](./drawing.md)).

## Props

Every prop folder has the same shape (see [board-model.md](./board-model.md); step by step in [making-a-prop.md](./making-a-prop.md)):

```text
library/props/<name>/
  README.md
  src/index.ts        exports the prop module(s): `{ def, View }`
  src/model.ts        the definition (`defineProp`) and pure logic (no UI)
  src/view.tsx        draws the prop's state; reports the learner through `call`/`signal`; owns no state
  src/styles.css      the view's styles, drawn only with the look's tokens (`@chalk/look`)
  src/model.test.ts   the prop's laws against cases known by hand, actions, parts, and that its tweens pass the one door
```

- Store only the independent quantities; everything that follows from them is a derived field.
- Every change is an action that says what it keeps fixed. Inverse questions get their own named action.
- A prop holds the laws of its own world, nothing lesson-specific. If a field's name mentions a lesson's topic, it belongs in the lesson's rules.
- Expose what a teacher would want to show or hide. Name things in the textbook's own words.
- Words a prop shows come from the lesson, in both languages.

## Content

- Content is TypeScript in the folder tree [writing-content.md](./writing-content.md) describes: `build.yaml` manifests, a concept's `overview.ts`, a chapter's question bank (`questions/<family>/family.ts` + `params.yaml`). `pnpm build-content` turns it into JSON in `build/`. Nobody types an id.
- Content is TypeScript in the tree (`writing-content.md`); hand-written JSON boards are only test boards (`platform/studio/evals/boards/`).
- Props, actions, signals and derived fields are named through the prop's enums (`NumberLineAction.ZoomIn`); concepts through the chapter's generated `Concept` enum. Never a string.
- Nothing is spoken unless a script calls `say`.
- Every user-facing string is `t(en, hi)` (JSON: `{ en, hi }`), rich text. Use `speak` when screen text has maths glyphs.

## Schemas and types

- Zod schemas are the source of truth; types are inferred (`z.infer`), never written twice.
- The only exception is a recursive type zod cannot infer (`Piece`, `Script`); then the schema is annotated with the type so the compiler keeps them in step.

## TypeScript

- `strict: true`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`.
- No `any`; prefer `unknown` and narrow. Avoid `as` and `!` unless justified with a short comment.
- `import type` / `export type` for type-only imports.
- Named exports only. No default exports (config files excepted).
- Public functions have explicit return types or exported type aliases.

## Closed string sets

Define a domain string set once:

```ts
export const AnswerStatus = { Open: "open", Correct: "correct", Wrong: "wrong" } as const;
export type AnswerStatus = (typeof AnswerStatus)[keyof typeof AnswerStatus];
```

- Must not repeat the same domain string across files (kinds, statuses, event names, keys).
- Prefer `as const` objects or unions. No `const enum`, avoid `enum`.
- UI copy lives in tables with closed keys (`UiText`).

## Naming

| Thing | Convention | Example |
|---|---|---|
| Packages | `@chalk/<kebab-case>` | `@chalk/prop-number-line` |
| Folders | `kebab-case` | `library/props/number-line` |
| Files | `kebab-case`, always (`.ts`, `.tsx`, `.css`) | `use-board-runtime.ts`, `board-player.tsx` |
| A view beside its logic | `<thing>-view.tsx` | `rich-text.ts` + `rich-text-view.tsx`; a prop's `view.tsx` |
| Tests | same base + `.test.ts` | `model.test.ts` |
| Types, components | `PascalCase` | `PropDef` |
| Functions, variables | `camelCase` | `applyPatch` |
| Const maps | `PascalCase` | `PieceKind` |
| True constants | `CONSTANT_CASE` | `AXIS_Y` |
| Booleans | `is` / `has` / `can` / `should` | `isPassed` |
| Event handler props | `on` + verb | `onPass` |
| Content names and keys | `camelCase` | `"guessRoot"`, `line.marker` |

No `I` prefix, no `_private`. Abbreviations only if universal (`id`, `url`).

Files are kebab-case even when they hold a component; the component inside is still `PascalCase` (`board-player.tsx` exports `BoardPlayer`). One case for every file means two files can't differ only in case, which on macOS and Windows would make `./rich` and `./Rich` reach the same file. Imports drop `.ts`/`.tsx`, so `rich-text.ts` and `rich-text.tsx` would clash too: name the view `rich-text-view.tsx`. A test (`platform/studio/src/file-names.test.ts`) fails on any such clash, so Linux catches it too.

## UI (Preact)

- Views are presentational: props in, events out.
- Prop views never own state; every change is an action through the player's one door.

## Errors

- Throw `Error` with a message that says what and where (`Board guess, line: numberLine.to: …`).
- No empty `catch`. Fail loudly on bad content; the validator should have caught it.

## Checks

- Tests sit next to the code. Pure logic (contract, runtime, prop definitions, validator) must have tests.
- `pnpm check` (typecheck, tests, validate, Biome) passes before a change is done.
- One formatter and linter: Biome (`pnpm format` fixes formatting).
- **A lint rule is met, never skipped.** `pnpm check` fails on any `biome-ignore`. If a rule is wrong for our code, it is turned off once in `biome.json`, with the reason here:
  - `noArrayIndexKey` is off. Biome also requires a key on every list item (`useJsxKeyInIterable`), and many of our lists are positional: identical beads, tick marks, the pieces of a split text, a table's columns. There, position is the item's identity, and no other key exists. The rule that still holds: a list whose items can be added, removed or reordered is keyed by its items' ids (options, steps, desks), never by position.
