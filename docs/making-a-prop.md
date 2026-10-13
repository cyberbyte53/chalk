# Making a prop

How to add a prop, step by step. Written so a person or an AI agent can follow it without help. Read [board-model.md](board-model.md) first; the conventions are in [code-conventions.md](code-conventions.md).

## 1. Write the contract before any code

Write the prop's `README.md` first. It answers:

- **What world is this?** One sentence. A prop knows the laws of its own world and nothing about any lesson ("a number line", not "a √2 finder").
- **Stored state:** the fewest independent quantities. If a field can be worked out from others, it's derived, not stored.
- **Derived state:** what follows from the stored state by the prop's laws (a bulb's brightness, the fraction of heads).
- **Actions:** every way the state can change. For each: what it changes, what it keeps fixed, and whether it reveals an answer. If a lesson will ask the inverse question ("where must the object be for the image to be here?"), give that its own named action.
- **Signals:** what the prop announces (pressed, landed, switched). Mark a signal a commit only if it is the learner deciding something that should be logged; most are not.
- **Parts:** what can be pointed at by name (`marker`, `bulbA`).
- **What a learner can do with a finger:** each of these is just one of the actions above, marked `byLearner: true` in the model (the test bench's simulated students use exactly these).

Names: camelCase, the textbook's own words, booleans start with `is`/`has`/`can`.

## 2. Write the laws as tests

`src/model.test.ts`, before the model. Test against cases you know by hand, not against the code's own output:

- known answers (two equal bulbs in series each get half the voltage);
- conservation laws or invariants that must always hold (current in = current out at every junction), checked over many generated cases;
- every action: what it changes, and that what it says it keeps fixed stays fixed;
- refusals: states the schema must reject;
- timed actions pass the one door at every step (see `props/number-line/src/model.test.ts`).

## 3. Write the model

`src/model.ts` with `defineProp`. Shape to copy: `props/number-line/src/model.ts` (timed actions) or `props/chance/src/coin.ts` (signals, seeded chance).

- `state`: a strict zod object; `defaults` for every field.
- `derived`: pure functions of stored state.
- `actions` via `actionsFor<S>()`: `set(patch, ...signals)` for an instant change, `tween(seconds, to)` to glide, `task(async (c) => …)` for anything that takes steps.
- `invariant` for rules across fields the schema can't say.
- `inputs`: only stored fields a lesson may own with an IS rule (words, an enabled flag).
- No `Math.random`: chance is seeded and the seed is state.
- Helper maths (a solver, geometry) lives in its own file inside the prop.

## 4. Write the view

`src/view.tsx`: draws `view` (stored and derived) at the `width` it's given. Every touch is `call("<action>", args)`. The view owns no state. Words come from the lesson (`{ en, hi }`), not the prop.

Styles go in `packages/player/src/styles.css`, in a section named after the prop. The player wraps each prop in `class="piece-prop prop-<type>"`, so don't reuse `prop-<type>` for an inner element.

## 5. Wire it in

- `package.json` named `@chalk/prop-<folder>`, `tsconfig.json`, `src/index.ts` exporting `<name>Prop: PropModule = { def: asAnyProp(…), View }`. Copy `props/chance/`.
- `library/package.json`: add the dependency; `library/src/index.ts`: add the module to `all`.
- `pnpm install`.
- `library/README.md`: add it to the list.
- If a lesson uses it, `library/src/lessons.test.ts` can play that lesson with fake time.

## 6. Done means

`pnpm check` passes (typecheck, tests, lesson validation, Biome), and a lesson using the prop plays in the app.
