# @chalk/prop

The board model (see [docs/board-model.md](../../docs/board-model.md)): props, events between them, one queue for time.

- `define.ts`: `prop()`, the one building block (variables, start, facts, needs, actions, signals, rules, parts, layout, frame), `action()`, `signal()`, the tools a rule gets.
- `board.ts`: the `Board`: builds a prop and its parts from what a board gives, runs events (instant ones as calls, signals up to their holders), needs read live, the time queue, planned moves, `input` (the student's) and `send` (a lesson's), replay.
- `queue.ts`, `move.ts`, `helpers.ts` (`sequence`), `voice.ts` (how long a line takes, for the queue).
- `layout.ts`: how a prop lays out its parts (a column, a row, a frame) and which are shown.
- `vocabulary.ts`: what every prop shares: its role, frames, what the student sees (`Element`, `Observation`), actions' names (`nameOf`), the board's own names (`BOARD`), `purposeOf`.
- `question.ts`: what every question prop shares (status, attempts, feedback; `checked`, `correct`, `wrong`).
- `tags.ts`: the view's tags (`does`, `says`, `shows`) and the description read back from them; `jsx-runtime.ts`: the element types that make a pressable element say what it does.
- `size.ts`: how the player sizes a prop. `color.ts`: `colorSchema` (a role of the look, or any `#rrggbb`). `address.ts`: paths and names. `snapshot.ts`: what agents read of a board.

May import: `@chalk/look` (names only), `zod`. No UI.
