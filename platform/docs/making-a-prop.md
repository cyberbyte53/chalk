# Making a prop

How to add a prop, step by step. Written so a person or an AI agent can follow it without help. Read [board-model.md](board-model.md) first; the conventions are in [code-conventions.md](code-conventions.md).

## 0. Build from what exists first

Before writing a new prop, check whether it is:

- **one more feature on a prop that exists** (a number line, graph paper): write a **layer** for that host;
- **existing props together**, each with its own laws, joined by links (a stepper, a line of maths and a plane showing one polynomial): write a **group**;
- **truly new**: a prop of its own, as below.

- **A host** (`defineHost` in `platform/packages/prop/src/compose.ts`) is a core plus layers side by side. A layer (`layersFor<S>()({ … })`) owns its fields (no two parts of a host may define one), its actions, signals and derived values; says which other layers it `needs` and which it `excludes` (a board turning both on is refused at build); says when it is on (`isOn`); and draws on the host's kind of frame. The host's `frame` is its picture (`FrameSpec`: kind, pixels at a width, a label).
- **A group** (`defineGroup` in `group.ts`) holds its own fields and each child's facts. Links: `is` (fields bound into a child, worked out from the group's view when read; any may read another, a loop throws), `show`, `when` (a child's signal runs steps: `when: { input: { changed: (s, p, run) => [run.put({ x: p.to })] } }`), `route` (a learner's action on a child does something else, or is refused with a reason: `route: { dial: { move: (s, a, run) => [run.input.change({ to: a.x })] } }`; a learner control on a bound field must be routed). Links name children, signals and actions by key, typed; `run` builds each step with its arguments checked. Its layout is a column, a row, or a **frame**: one child provides the picture (`frame`), the others draw into it (`drawsOn` its kind), some go `below`. Its view is `groupView(def, { child: View, … })`. A child's parts are named under it (`plane/handle`) and its inputs do its action by path (`plane.move`). Tests: `group.test.ts`, the player's `group-view.test.tsx`.

## 1. Write the contract before any code

Write the prop's `README.md` first. It answers:

- **What world is this?** One sentence. A prop knows the laws of its own world and nothing about any lesson ("a number line", not "a √2 finder").
- **Stored state:** the fewest independent quantities. If a field can be worked out from others, it's derived, not stored.
- **Derived state:** what follows from the stored state by the prop's laws (a bulb's brightness, the fraction of heads).
- **Actions:** every way the state can change. For each: what it changes, what it keeps fixed, and whether it reveals an answer. If a lesson will ask the inverse question ("where must the object be for the image to be here?"), give that its own named action.
- **Signals:** what the prop announces (pressed, landed, switched). Mark a signal a commit only if it is the learner deciding something that should be logged; most are not.
- **What the student sees:** each part the student can tell apart, as the view will tag it: an input and what it does, or something read and its value, **typed** (a number as a number, a point as `{ x, y }`), with the words the screen writes when that isn't just the value printed ("1.40"); the one-line `summary`; and under `offScreen`, what the prop knows but the screen doesn't show (see [board-model.md](board-model.md#what-the-student-sees)).
- **What a learner can do with a finger:** each of these is just one of the actions above, marked `byLearner: true` in the model (the test bench's simulated students use exactly these).

Names: camelCase, the textbook's own words, booleans start with `is`/`has`/`can`.

## 2. Write the laws as tests

`src/model.test.ts`, before the model. Test against cases you know by hand, not against the code's own output:

- known answers (two equal bulbs in series each get half the voltage);
- conservation laws or invariants that must always hold (current in = current out at every junction), checked over many generated cases;
- every action: what it changes, and that what it says it keeps fixed stays fixed;
- refusals: states the schema must reject;
- timed actions pass the one door at every step;
- what the student sees, and that every input says what it does (`checkProp`, `describeView`: `library/props/primes/src/seen.test.ts`).

## 3. Write the model

`src/model.ts` with `defineProp({ … })`, no type arguments: the state type comes from `state`, and the action, signal and derived names from their keys. Shape to copy: `library/props/primes/src/sweet-share.ts` (signals, required `changes`) or `library/props/primes/src/lap-race.ts` (time).

- `state`: a strict zod object; `defaults` for every field.
- `derived`: pure functions of stored state.
- `actions` via `actionsFor<S>()`: `set(patch, ...signals)` for an instant change; anything over time is steps, as data: `tween(seconds, to, { ease, interpolate })` to glide (it stops if anything else moves those fields), `wait(s)`, `say()`, `call(action)`, `seq(...)`, `par(...)`, `waitUntil(test)`, and `repeat(every, tick, { while })` for things that run (a tick is an action marked `internal`). Each lists the fields it `changes`: the runtime refuses any other, and the board model uses it to tell setup (fixed where placed) from live (changes on this board).
- **Names are keys, passed as themselves.** An action or signal is named by its key, once; everything else passes the spec: a view does `does(sweetShare.actions.giveRound)`, a model raises `raise(signals.over, { q, r })` and runs `call(arrive)`, content writes `game.learner.split({ n: 4 })` and `b.when(game.on.over, …)`. Arguments are typed from the action's schema. No string names, no name maps.
- `role`: `PropRole.Explainer` (a world the student works in; Jugnu may bring it in), `Question`, or `Page` (words, the board). Required.
- `invariant` for rules across fields the schema can't say.
- `inputs`: only stored fields a lesson may own with an IS rule (words, an enabled flag).
- No `Math.random`: chance is seeded and the seed is state.
- Helper maths (a solver, geometry) lives in its own file inside the prop.

## 4. Write the view

`src/view.tsx`: draws `view` (stored and derived) at the `width` it's given. The view owns no state. Words come from the lesson (`{ en, hi }`), not the prop.

**What's on screen is written once, in the view.** Each part the student can tell apart is tagged on the element that draws it (`@chalk/prop`'s tags.ts), and the prop's description (for `look`, `play`, Jugnu, tests) is read from those tags in what the view draws: there is no second copy.

```tsx
<SymbolButton {...does(sweetShare.actions.giveRound)} />                         // a button
<SymbolButton {...does(stickMeasure.actions.tryPiece, { length: 3 }, 3)} />     // with its values, and a key
<Stepper {...says(sweetShare.actions.setFriends)} onChange={(value) => call(sweetShare.actions.setFriends, { value })} />
<div {...shows("box", s.box, "17 sweets")}>…</div>                               // something read
```

- `does(action, args?, key?)`: the player presses it (no `onClick`). Named by the action, and the key when several inputs do one action.
- `says(action, key?)`: an input whose own handler works the arguments out when it's used (a stepper, a typed number).
- `shows(name, value, words?)`: anything else the student reads. A part inside something `disabled` is off.
- A component passes the tags on to the element that is pressed (`{...tagsOf(props)}`).
- **Drags**: inside a frame, `const drag = useDrags()` (`@chalk/player`), then `<circle {...shows("marker", x)} {...drag({ axis: "x", at: { x, y: 0 }, move: line.actions.moveMarker, step: 0.1, release: { signal: line.signals.released } })} />`. The player wires pointer (against the frame's transform as it was when the drag began), arrow keys, focus and the slider's words; the drag says its action like any input.
- **Frames**: a child of a group's frame layout draws with `useFrame()` (`px.toPx`, `px.fromPx`) and hands its labels to the frame's one placing pass with `useFrameLabels` (a label with a `part` is something read).

`checkProp(module, starts)` (`@chalk/player`) explores a prop from some starting states by pressing what its view offers, and reports any input that doesn't say what it does and any learner action no input offers; `describeView` reads one state's description. `library/props/primes/src/seen.test.ts` is the example. In the dev preview, a press that runs a student action from an input not tagged for it is reported (`look` shows page errors).

Draw with `@chalk/draw`'s pieces inside a `Stage` (read [drawing.md](./drawing.md) first, including the list of d3 modules to check before writing geometry by hand); draw your own SVG inside the stage only for what no piece covers. For anything on a coordinate plane use Mafs instead (see Libraries below). Styles go in the prop's own `src/styles.css`, exported as `@chalk/prop-<folder>/styles.css`; class names start with the prop's short prefix (`.nl-`, `.ns-`). Draw only with the look's tokens (`var(--color-on-surface)`, `var(--font-display)`, `var(--text-note)`; see `platform/packages/look`), never a raw colour: a test checks. A colour the content picks (a `colorSchema` field) reaches the view as a role or a hex; set it as `--tone` with `cssColor` and mix tints from it. The player wraps each prop in `class="piece-prop prop-<type>"`, so don't reuse `prop-<type>` for an inner element.

**Sizing is the player's, not the view's.** Draw for a phone: the `width` you get is about 390 (never under 200), and nothing in a view knows the device. The player sizes each prop by a rule (`size` in `@chalk/prop`), with defaults a prop type can change and a board can change again where it places the prop (`b.prop(def, name, given, { size })`):

- **`fit: "scale"`** (the default): drawn for a phone and zoomed as one picture with the column, 1× on a phone up to `maxZoom` (1.2) on a 640px column, in step with the text. If that would take more than `maxHeight` of the screen's height (0.6), it is zoomed down to fit, never below `minZoom` (0.75). SVG and HTML props alike. The width a prop lays out at depends on the column alone, so its height is a fact about the column and the zoom is decided once, when the column or the window changes (a prop whose height follows its width can't feed back on itself; a row of controls appearing doesn't rescale the picture).
- **`fit: "fill"`**: no zoom; the view gets the column's whole width and uses it. For words and controls (they reflow, and text sizes grow on their own), and for props that should show more rather than grow (a number line showing more axis).

Use the look's text tokens for words (they grow with the column), no fixed widths or max-widths in px, and lay out to the `width` given.

## Libraries: use the toolkit, don't add to it

Use what already exists before writing your own, but only from this list. One tool per kind of job keeps props consistent and the app small.

| Job | Use | Notes |
|---|---|---|
| Pictures: apparatus, beads, trees, characters | `@chalk/draw` | Already in. Read [drawing.md](./drawing.md). |
| Scales, ticks, curve paths | `d3-scale`, `d3-shape` | Already in, through `@chalk/draw`. |
| Typeset maths | KaTeX | Already in, through rich text. |
| Anything on a coordinate plane: function graphs, draggable points on an axis, lines, circles, polygons, vectors, ray diagrams, motion graphs | [Mafs](https://mafs.dev) (MIT) | React components run through `@preact/compat`, set up once per prop package. Pass `point` and `onMove` (the prop's state, our action); never `useMovablePoint`, whose state lives in Mafs. `constrain` on `MovablePoint` takes a function, `([x]) => [x, 0]`. Set its `--mafs-*` colours to look tokens in the prop's `styles.css`. Its points take no tags of their own: wrap each in a `<g {...shows(…)} {...says(…)}>`. |
| Algebra: expand, factorise, divide polynomials, exact roots (fractions and surds), read off coefficients | [nerdamer](https://github.com/jiggzson/nerdamer) (Apache-2.0) | Pin the version. It writes terms in its own order (−6+x+x²); print the textbook's order from `coeffs`. |
| Exact fractions in a prop's own arithmetic (cells, remainders) | [fraction.js](https://github.com/rawify/Fraction.js) (MIT) | Small and stateless. `library/props/polynomials` keeps the box's coefficients as fractions with it. |
| A scene to watch, many bodies, nothing measured | matter.js (MIT) | Last resort. Its numbers are approximate and its world holds state: step it with a fixed time step in a `repeat` tick and copy positions into stored state. Never use it for anything a question checks; use closed-form laws, as `library/props/collision` and `library/props/gas` do. |

A library joins this list only if it passes all four:

1. **It holds no state of ours.** It draws from the prop's view or computes from its stored state; every change still goes through an action. Anything that keeps its own copy (a GeoGebra or Desmos board, a JSXGraph point) breaks the description, witnesses and `studentOnly`.
2. **It imports cleanly in Node.** The content build, publish and the Jugnu eval load every prop's view in Node; importing the prop must not throw there.
3. **Its licence allows commercial use.** MIT, Apache-2.0, ISC or similar. GeoGebra's free licence does not.
4. **It is small enough for a phone.** Check what it adds to the learner app's gzipped bundle.

Add a library to the prop's own `package.json`, not the root, so only props that use it pay for it.

## 5. Wire it in

- `package.json` named `@chalk/prop-<folder>`, `tsconfig.json`, `src/defs.ts` exporting the definitions (read without drawing code: the build, the server), `src/index.ts` the modules, `propModule(def, View)` (the view typed `PropViewProps<typeof def>`). Copy `library/props/primes/`.
- `library/registry/package.json`: add the dependency; `library/registry/src/index.ts`: add the package (its defs, and its modules to load); `modules.ts`: its modules, for Node; `library/registry/src/styles.css`: add its `@import`.
- `pnpm install`.
- `library/README.md`: add it to the list.
- If a lesson uses it, `library/registry/src/lessons.test.ts` can play that lesson with fake time.

## 6. Done means

`pnpm check` passes (typecheck, tests, lesson validation, Biome), and a lesson using the prop plays in the app.
