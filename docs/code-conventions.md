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
- A helper library (geometry, 3D, physics) lives inside one prop, never in the model or the lesson format.

## Props

Every prop folder has the same shape (see [board-model.md](./board-model.md); step by step in [making-a-prop.md](./making-a-prop.md)):

```text
props/<name>/
  README.md
  src/index.ts        exports the prop module(s): `{ def, View }`
  src/model.ts        the definition (`defineProp`) and pure logic (no UI)
  src/view.tsx        draws the prop's state; reports the learner through `call`/`signal`; owns no state
  src/model.test.ts   the prop's laws against cases known by hand, actions, parts, and that its tweens pass the one door
```

- Store only the independent quantities; everything that follows from them is a derived field.
- Every change is an action that says what it keeps fixed. Inverse questions get their own named action.
- A prop holds the laws of its own world, nothing lesson-specific. If a field's name mentions a lesson's topic, it belongs in the lesson's rules.
- Expose what a teacher would want to show or hide. Name things in the textbook's own words.
- Words a prop shows come from the lesson, in both languages.

## Content

- Lessons are JSON under `content/<course>/<chapter>/lessons/`: props placed in a layout, wired with IS and WHEN rules. Refer to props by `name` (camelCase: rules use it); `id`s are handed out by `pnpm publish-lesson` and never edited by hand.
- Nothing is spoken unless a script calls `say`.
- Every user-facing string is `{ en, hi }`. Use `speak` when screen text has maths glyphs.

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
| Folders | `kebab-case` | `props/number-line` |
| Source files (non-UI) | `kebab-case.ts` | `use-board-runtime.ts` |
| Component files | `PascalCase.tsx` | `BoardPlayer.tsx` (prop views: `view.tsx`) |
| Tests | same base + `.test.ts` | `model.test.ts` |
| Types, components | `PascalCase` | `PropDef` |
| Functions, variables | `camelCase` | `applyPatch` |
| Const maps | `PascalCase` | `PieceKind` |
| True constants | `CONSTANT_CASE` | `AXIS_Y` |
| Booleans | `is` / `has` / `can` / `should` | `isPassed` |
| Event handler props | `on` + verb | `onPass` |
| Content names and keys | `camelCase` | `"guessRoot"`, `line.marker` |

No `I` prefix, no `_private`. Abbreviations only if universal (`id`, `url`).

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
