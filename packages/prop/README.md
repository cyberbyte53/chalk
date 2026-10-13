# @chalk/prop

The prop contract (see [docs/board-model.md](../../docs/board-model.md)). Every prop looks the same from outside: state (stored + derived), actions, signals, parts. Validation, Studio's panels and Jugnu's tools are all generated from it.

- `define.ts`: the contract (`PropDef`, `defineProp`, `actionsFor`) and effects (`set`, `tween`, `task`).
- `state.ts`: **the one door** (`applyPatch`, `prepareAction`), `viewOf` (stored + derived), tween sampling.
- `board.ts`: the board itself as a prop (`pass`, `show`, `hide`, `continue`; `started`, `continued`).
- `question.ts`: the question role every question prop shares.
- `expression.ts`: the read-only expression language used in rules (parsed, never run as code).

May import: `zod` only. No UI.
