# Making a prop

How to add a prop, step by step. Written so a person or an AI agent can follow it without help. Read [board-model.md](board-model.md) first; the conventions are in [code-conventions.md](code-conventions.md).

## 0. Build from what exists first

Before writing a new prop, check whether it is:

- **one more feature on a prop that exists** (a number line, graph paper): write a **layer** for that host;
- **existing props side by side**, joined by a law (a stepper, a line of maths and a plane showing one polynomial): write a **composite**;
- **truly new**: a prop of its own, as below. Draw its parts with the blocks (`@chalk/prop-blocks`: `plane`, `stepper`, `mathLine`, `iconButton`) where they fit.

Hosts, layers and composites are explained in plain words in the project doc `plans/props-system.md`. Code: `platform/packages/prop/src/compose.ts`. Examples: `library/props/number-line` (a host: `axis.ts` is the core, `layers.ts` the layers, `view-layers.tsx` their drawing), `library/props/coordinates/src/coordinate-plane.ts` (layers on the blocks' plane), `library/props/polynomials/src/value-machine.ts` (a composite).

- **A layer** owns its fields (no two parts of a host may define one field), says which other layers it `needs` and which it `excludes` (a board turning both on is refused at build), and is on when it shows something. Its drawing tags every part with `data-part`.
- **A composite** owns the state and the laws. Each child is drawn from it (`childrenFor<S>()`: `kid(stepper, (s) => ({ value: s.input }), { change: (s, a) => [Put, { x: a.to }] })`); what the learner does to a child becomes one of the parent's actions, and anything not routed does nothing. Its view is `compositeView(def, { child: View, … })`. Children's ids sit under their names: `plane › handle`.

## 1. Write the contract before any code

Write the prop's `README.md` first. It answers:

- **What world is this?** One sentence. A prop knows the laws of its own world and nothing about any lesson ("a number line", not "a √2 finder").
- **Stored state:** the fewest independent quantities. If a field can be worked out from others, it's derived, not stored.
- **Derived state:** what follows from the stored state by the prop's laws (a bulb's brightness, the fraction of heads).
- **Actions:** every way the state can change. For each: what it changes, what it keeps fixed, and whether it reveals an answer. If a lesson will ask the inverse question ("where must the object be for the image to be here?"), give that its own named action.
- **Signals:** what the prop announces (pressed, landed, switched). Mark a signal a commit only if it is the learner deciding something that should be logged; most are not.
- **Observation:** what the student sees right now, as `observe` will report it: a one-line summary, each visible element with its id, its value **typed** (a number as a number, a point as `{ x, y }`), the `words` the screen writes when that isn't just the value printed ("1.40"), and for a control the action(s) it `does`; under `hidden`, what the prop knows but the screen doesn't show (see [board-model.md](board-model.md#the-observation)). Element ids are what `point`, steps and comments take, and each is the `data-part` of what draws it: drawn must equal described (render_board reports any gap).
- **What a learner can do with a finger:** each of these is just one of the actions above, marked `byLearner: true` in the model (the test bench's simulated students use exactly these).

Names: camelCase, the textbook's own words, booleans start with `is`/`has`/`can`.

## 2. Write the laws as tests

`src/model.test.ts`, before the model. Test against cases you know by hand, not against the code's own output:

- known answers (two equal bulbs in series each get half the voltage);
- conservation laws or invariants that must always hold (current in = current out at every junction), checked over many generated cases;
- every action: what it changes, and that what it says it keeps fixed stays fixed;
- refusals: states the schema must reject;
- timed actions pass the one door at every step (see `library/props/number-line/src/model.test.ts`).

## 3. Write the model

`src/model.ts` with `defineProp({ … })`, no type arguments: the state type comes from `state`, and the action, signal and derived names from their keys, so content can name only what the prop has. Shape to copy: `library/props/number-line/src/model.ts` (timed actions) or `library/props/chance/src/coin.ts` (signals, seeded chance).

- `state`: a strict zod object; `defaults` for every field.
- `derived`: pure functions of stored state.
- `actions` via `actionsFor<S>()`: `set(patch, ...signals)` for an instant change, `tween(seconds, to)` to glide, `task(async (c) => …)` for anything that takes steps. Each lists the fields it `changes`: the runtime refuses any other, and the board model uses it to tell setup (fixed where placed) from live (changes on this board).
- Name actions, signals and derived fields once, in `as const` maps exported with the prop (`NumberLineAction`, `NumberLineSignal`, `NumberLineDerived`), and key the definition with them (`[NumberLineAction.MoveMarker]: act({ … })`). Views, lessons and content use the maps, never the strings.
- `isExplainer: false` for props that don't explain anything (words, buttons, questions, timers), so Jugnu isn't offered them.
- `invariant` for rules across fields the schema can't say.
- `inputs`: only stored fields a lesson may own with an IS rule (words, an enabled flag).
- No `Math.random`: chance is seeded and the seed is state.
- Helper maths (a solver, geometry) lives in its own file inside the prop.

## 4. Write the view

`src/view.tsx`: draws `view` (stored and derived) at the `width` it's given. Every touch is `call("<action>", args)`. The view owns no state. Words come from the lesson (`{ en, hi }`), not the prop.

Draw with `@chalk/draw`'s pieces inside a `Stage` (read [drawing.md](./drawing.md) first, including the list of d3 modules to check before writing geometry by hand); draw your own SVG inside the stage only for what no piece covers. For anything on a coordinate plane use Mafs instead (see Libraries below). Styles go in the prop's own `src/styles.css`, exported as `@chalk/prop-<folder>/styles.css`; class names start with the prop's short prefix (`.nl-`, `.ns-`). Draw only with the look's tokens (`var(--color-on-surface)`, `var(--font-display)`, `var(--text-note)`; see `platform/packages/look`), never a raw colour: a test checks. A colour the content picks (a `colorSchema` field) reaches the view as a role or a hex; set it as `--tone` with `cssColor` and mix tints from it. The player wraps each prop in `class="piece-prop prop-<type>"`, so don't reuse `prop-<type>` for an inner element.

## Libraries: use the toolkit, don't add to it

Use what already exists before writing your own, but only from this list. One tool per kind of job keeps props consistent and the app small.

| Job | Use | Notes |
|---|---|---|
| Pictures: apparatus, beads, trees, characters | `@chalk/draw` | Already in. Read [drawing.md](./drawing.md). |
| Scales, ticks, curve paths | `d3-scale`, `d3-shape` | Already in, through `@chalk/draw`. |
| Typeset maths | KaTeX | Already in, through rich text. |
| Anything on a coordinate plane: function graphs, draggable points on an axis, lines, circles, polygons, vectors, ray diagrams, motion graphs | [Mafs](https://mafs.dev) (MIT) | React components run through `@preact/compat`, set up once per prop package. Pass `point` and `onMove` (the prop's state, our action); never `useMovablePoint`, whose state lives in Mafs. `constrain` on `MovablePoint` takes a function, `([x]) => [x, 0]`. Set its `--mafs-*` colours to look tokens in the prop's `styles.css`. Its points take no `data-part`, so give the prop a `locate` from plane to pixels. |
| Algebra: expand, factorise, divide polynomials, exact roots (fractions and surds), read off coefficients | [nerdamer](https://github.com/jiggzson/nerdamer) (Apache-2.0) | Pin the version. It writes terms in its own order (−6+x+x²); print the textbook's order from `coeffs`. |
| Exact fractions in a prop's own arithmetic (cells, remainders) | [fraction.js](https://github.com/rawify/Fraction.js) (MIT) | Small and stateless. `library/props/polynomials` keeps the box's coefficients as fractions with it. |
| A scene to watch, many bodies, nothing measured | matter.js (MIT) | Last resort. Its numbers are approximate and its world holds state: step it with a fixed time step inside a `task` and copy positions into stored state. Never use it for anything a question checks; use closed-form laws, as `library/props/collision` and `library/props/gas` do. |

A library joins this list only if it passes all four:

1. **It holds no state of ours.** It draws from the prop's view or computes from its stored state; every change still goes through an action. Anything that keeps its own copy (a GeoGebra or Desmos board, a JSXGraph point) breaks `observe`, witnesses and `studentOnly`.
2. **It imports cleanly in Node.** The content build, publish and the Jugnu eval load every prop's view in Node; importing the prop must not throw there.
3. **Its licence allows commercial use.** MIT, Apache-2.0, ISC or similar. GeoGebra's free licence does not.
4. **It is small enough for a phone.** Check what it adds to the learner app's gzipped bundle.

Add a library to the prop's own `package.json`, not the root, so only props that use it pay for it.

## 5. Wire it in

- `package.json` named `@chalk/prop-<folder>`, `tsconfig.json`, `src/index.ts` exporting `<name>Prop: PropModule = { def: asAnyProp(…), View }`. Copy `library/props/chance/`.
- `library/registry/package.json`: add the dependency; `library/registry/src/index.ts`: add the module to `all`; `library/registry/src/styles.css`: add its `@import`.
- `pnpm install`.
- `library/README.md`: add it to the list.
- If a lesson uses it, `library/registry/src/lessons.test.ts` can play that lesson with fake time.

## 6. Done means

`pnpm check` passes (typecheck, tests, lesson validation, Biome), and a lesson using the prop plays in the app.
