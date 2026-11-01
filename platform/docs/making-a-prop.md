# Making a prop

How to add a prop, step by step. Written so a person or an AI agent can follow it without help. Read [board-model.md](board-model.md) first; the conventions are in [code-conventions.md](code-conventions.md).

## 0. Build from what exists first

Before writing a new prop, `show` `library/props/` (a line per prop: its address, role, what it is for, how many boards use it), then the address of any that might fit (everything about it, and every board that uses it), or open `?dev&at=library/props/` in the preview to see them all and play with each. Then check whether it is:

- **one more part on a prop that exists** (a walker on the coordinate plane): write the part as a prop of its own and add it to that prop's `children`;
- **existing props together**, each with its own laws (a stepper, a line of maths and a plane showing one polynomial): write a prop that holds them;
- **truly new**: a prop of its own, as below.

**One rule for every part:** it owns its variables and only its rules change them; it knows nothing of the other parts. Where parts meet is the holder's:

- **needs** pass data down: a part says what it needs; the holder gives it by name (a variable or fact of the same name), or with a line where a name differs (`give: { walker: { target: (me) => me.places.target } }`);
- **`hear`** answers one part's signal with another's action: `hear: { "places.targetChosen": (_, p, t) => p.isAnother && t.to.walker.backToStart() }`.

So a part is read, tested and changed on its own, and every link between parts is written in one place. The coordinate plane (`library/props/coordinates`) is the example: `coordinate-plane.ts` holds `plane`, `places`, `walker`, `clues`, … and gives each the plane's window as a fact of the same name.

**Its layout** (`layout`) is a column, a row, or a **frame**: one part provides the picture (its `frame`: kind, pixels at a width, a label), the others draw on it, some go `below`. **Its view** is `groupView(def, { part: View, … })`. Round a frame a part may draw in several places (`Place`: above the picture, behind, on the lines, in front, below it, among the controls), as a `PartDrawing` (`{ on: Walker, below: WhereSheIs, controls: Arrows }`); the layout's `order` says who draws first in each place. A part's elements are named under it (`walker/step:up`) and its inputs do its action by path (`walker.step`). Content places it part by part: `place(coordinatePlane, { plane: { window }, walker: { walkFrom } })`.

## 1. Write the contract before any code

Write the prop's `README.md` first. It answers:

- **What world is this?** One sentence. A prop knows the laws of its own world and nothing about any lesson ("a number line", not "a √2 finder"). That sentence opens the prop's `describe`: it is what the prop is for wherever props are listed (`purposeOf`).
- **Variables:** the fewest independent quantities, each with its `start`. If one can be worked out from others, it is a **fact**.
- **Facts:** what follows from its variables and needs by the prop's laws (a bulb's brightness, the fraction of heads).
- **Needs:** what it must be given by whatever holds it (the plane's window, where Riya is headed).
- **Actions:** every way it can be asked to change. For each: what it does, and what it refuses. If a lesson will ask the inverse question ("where must the object be for the image to be here?"), give that its own named action. Mark `from: "screen"` the ones the student does with a finger.
- **Signals:** what it tells (stepped, landed, switched), and what each carries: `signal({ x: z.number(), y: z.number() })`. Payloads are typed and checked when told.
- **What the student sees:** each part the student can tell apart, as the view will tag it: an input and what it does, or something read and its value, **typed** (a number as a number, a point as `{ x, y }`), with the words the screen writes when that isn't just the value printed ("1.40"); the one-line `summary`; and under `offScreen`, variables the prop knows but the screen doesn't show (see [board-model.md](board-model.md#what-the-student-sees)).

Names: camelCase, the textbook's own words, booleans start with `is`/`has`/`can`.

## 2. Write the laws as tests

Before the rules. Play the prop on a `Board` (`@chalk/prop`), as a board plays it: `new Board(def, given)`, then `input(path, action, payload)` for a student's tap, `send(…)` for a lesson's, `runUntilIdle()` or `advanceTo(t)` to move the clock, `read()` for what it is now, `listen(…)` for what it told. Test against cases you know by hand, not the code's own output:

- known answers (two equal bulbs in series each get half the voltage);
- laws that must always hold (current in = current out at every junction), over many generated cases;
- every action: what it changes, and what it refuses;
- states the variables' schema or `invariant` must reject;
- moves: where it is mid-move, and what is told at the end;
- what the student sees, and that every input says what it does (`checkProp`, `describeView`).

`library/props/coordinates/src/town.test.ts` (a part played inside its holder, with its timing), `parts.test.ts` (parts held alone by a tiny holder that gives their needs) and `seen.test.ts` (what the student sees) are the examples.

## 3. Write the definition

`prop({ … })` from `@chalk/prop`, no type arguments: every type comes from what you write. Copy `library/props/coordinates/src/walker.ts`.

```ts
export const walker = prop({
  type: "walker",
  role: PropRole.Explainer,
  describe: "Riya: she walks one block per tap, on roads only. …",
  variables: z.object({ at: pointSchema, trail: z.array(pointSchema), walkFrom: pointSchema.nullable() }).strict(),
  start: { at: { x: 0, y: 0 }, trail: [], walkFrom: null },
  needs: z.object({ window: windowSchema, upLines: z.array(z.number()).nullable() }).strict(),
  facts: { isHome: (me) => me.trail.length === 0 },
  actions: {
    step: action({ direction: z.nativeEnum(Direction) }, { from: "screen", describe: "One block" }),
    backToStart: action({}, { from: "screen", describe: "Back to the corner" }),
  },
  signals: { stepped: signal(pointSchema.shape), blocked: signal({ why: z.string() }) },
  on: {
    step: (me, { direction }, t) => { … },
    backToStart: (_, __, t) => [t.stop(), t.set({ at: { x: 0, y: 0 }, trail: [] })],
  },
});
```

- `role`: `PropRole.Explainer` (a world the student works in), `Question`, or `Page` (words). Required.
- A rule returns what happens, through its tools: `t.set`, `t.tell`, `t.self`, `t.to`, `t.later`, `t.move`, `t.stop` ([board-model.md](board-model.md#a-rule)). Anything over time is the queue: `t.later(s, …)` for a wait, `t.move(…)` for a planned move, a rule that queues itself for a tick. No timers, no `setTimeout`, no timing in CSS that anything waits on.
- **Actions and signals are passed as themselves, never as strings.** Their names are their keys, noted when the prop is defined: a view does `does(choice.actions.check)`, a holder hears `"places.targetChosen"` (typed), content asks `t.to.town.plane.raiseUpLine({ at: 4 })`.
- `invariant` for rules across variables the schema can't say.
- No `Math.random`: chance is seeded, and the seed is a variable.
- Helper maths (a solver, geometry) lives in its own functions, tested on their own (`stepFrom`, `throwOf`).
- A prop is checked when it is defined: a part's need nothing gives, a layout naming a part it doesn't draw, are refused.

## 4. Write the view

`src/<part>-view.tsx`: draws `view` (its variables, needs and facts, and each part's, as the board reads them now) at the `width` it's given, typed `PropViewProps<typeof def>`. It owns nothing: what the student does goes through `call(def.actions.x, args)`. Words come from the lesson (`{ en, hi }`), not the prop.

**What's on screen is written once, in the view.** Each part the student can tell apart is tagged on the element that draws it (`@chalk/prop`'s tags.ts), and the prop's description (for `show`, agents, tests) is read from those tags in what the view draws: there is no second copy.

```tsx
<button {...does(choice.actions.check)} />                                      // a button
<SymbolButton {...does(walker.actions.step, { direction: "up" }, "up")} />     // with its values, and its key
<Stepper {...says(dial.actions.setValue)} onChange={(value) => call(dial.actions.setValue, { value })} />
<div {...shows("box", s.box, "17 sweets")}>…</div>                              // something read
```

- **Everything a student can press or drag has a name**, its address under the piece (`ask/check`, `room/places/chooseTarget:5,3`), and is pointed at by that name only, never by its words: `show`'s steps tap by name, comments point by name. The type checker keeps it while you write: a prop package's views use `@chalk/prop`'s element types (`jsxImportSource` in its tsconfig), where an element with an event handler must also carry `does(…)` or `says(…)`. The framework's own files (`@chalk/draw`, `@chalk/player`) start with `/** @jsxImportSource preact */`.
- `does(action, args, key)`: the player presses it, by click, or by Enter or Space for an element the browser doesn't press itself. Named by the action and its key; an input that sends arguments must give a key (a type error otherwise), so its name never changes with what it sends.
- `says(action, key?)`: an input whose own handler works the arguments out when it's used (a stepper, a typed number).
- `shows(name, value, words?)`: anything else the student reads. A part inside something `disabled` is off.
- A component passes the tags on to the element that is pressed (`{...tagsOf(props)}`).
- **Drags**: inside a frame, `const drag = useDrags()` (`@chalk/player`), then `<circle {...shows("marker", x)} {...drag({ axis: "x", at: { x, y: 0 }, move: line.actions.moveMarker, step: 0.1, release: { action: line.actions.letGo } })} />`. The player wires pointer, arrow keys, focus and the slider's words; the drag says its action like any input. Letting go is an action from the screen, never a signal from the drawing. A drag turns the finger's pixels into the prop's units, so it is drawn inside a frame; drawn outside one it is refused as the view draws, so `checkProp` reports it.
- **Frames**: a part drawn on a frame draws with `useFrame()` (`px.toPx`, `px.fromPx`) and hands its labels to the frame's one placing pass with `useFrameLabels` (a label with a `part` is something read).

`checkProp(module, starts)` (`@chalk/player`) plays a prop from some starting states (part by part, as a board places it), presses what its view offers, and reports any input that doesn't say what it does and any student action no input offers; `describeView` reads one state's description. In the dev preview, a press that runs a student action from an input not tagged for it is reported (`show` shows page errors).

Draw with `@chalk/draw`'s pieces inside a `Stage` (read [drawing.md](./drawing.md) first, including the list of d3 modules to check before writing geometry by hand); draw your own SVG inside the stage only for what no piece covers. Styles go in the prop's own `src/styles.css`, exported as `@chalk/prop-<folder>/styles.css`; class names start with the prop's short prefix (`.cp-`). Draw only with the look's tokens (`var(--color-on-surface)`, `var(--font-display)`, `var(--text-note)`; see `platform/packages/look`), never a raw colour: a test checks. A colour the content picks (a `colorSchema` field) reaches the view as a role or a hex; set it as `--tone` with `cssColor` and mix tints from it. The player wraps each prop in `class="piece-prop prop-<type>"`, so don't reuse `prop-<type>` for an inner element.

**Sizing is the player's, not the view's.** Draw for a phone: the `width` you get is about 390 (never under 200), and nothing in a view knows the device. The player sizes each prop by a rule (`size` in `@chalk/prop`), with defaults a prop type can change and a board can change again where it places the prop:

- **`fit: "scale"`** (the default): drawn for a phone and zoomed as one picture with the column, 1× on a phone up to `maxZoom` (1.2) on a 640px column, in step with the text. If that would take more than `maxHeight` of the screen's height (0.6), it is zoomed down to fit, never below `minZoom` (0.75). The zoom is decided once, when the column or the window changes.
- **`fit: "fill"`**: no zoom; the view gets the column's whole width and uses it. For words and controls (they reflow), and for props that should show more rather than grow.

Use the look's text tokens for words (they grow with the column), no fixed widths or max-widths in px, and lay out to the `width` given.

**Its sound**, if it makes one (a step, a click): a `SoundView` beside its definition (`src/sound.ts`), the cues it plays at its own signals ([sound.md](sound.md)).

## Libraries: use the toolkit, don't add to it

Use what already exists before writing your own, but only from this list. One tool per kind of job keeps props consistent and the app small.

| Job | Use | Notes |
|---|---|---|
| Pictures: apparatus, beads, trees, characters | `@chalk/draw` | Already in. Read [drawing.md](./drawing.md). |
| Scales, ticks, curve paths | `d3-scale`, `d3-shape` | Already in, through `@chalk/draw`. |
| Typeset maths | KaTeX | Already in, through rich text. |
| Anything on a coordinate plane: function graphs, draggable points, lines, circles, polygons, vectors, ray diagrams | [Mafs](https://mafs.dev) (MIT) | React components run through `@preact/compat`, set up once per prop package. Pass `point` and `onMove` (the prop's variables, its action); never `useMovablePoint`, whose state lives in Mafs. Set its `--mafs-*` colours to look tokens. Its points take no tags of their own: wrap each in a `<g {...shows(…)} {...says(…)}>`. |
| Algebra: expand, factorise, divide polynomials, exact roots, coefficients | [nerdamer](https://github.com/jiggzson/nerdamer) (Apache-2.0) | Pin the version. It writes terms in its own order; print the textbook's order from `coeffs`. |
| Exact fractions in a prop's own arithmetic | [fraction.js](https://github.com/rawify/Fraction.js) (MIT) | Small and stateless. |
| A scene to watch, many bodies, nothing measured | matter.js (MIT) | Last resort. Its numbers are approximate and its world holds state: step it with a fixed time step in a tick and copy positions into the prop's variables. Never for anything a question checks; use closed-form laws. |

A library joins this list only if it passes all four:

1. **It holds no state of ours.** It draws from the prop's view or computes from its variables; every change still goes through an action. Anything that keeps its own copy (a GeoGebra or Desmos board, a JSXGraph point) breaks the description and the witnesses.
2. **It imports cleanly in Node.** The content build loads every prop's view in Node; importing the prop must not throw there.
3. **Its licence allows commercial use.** MIT, Apache-2.0, ISC or similar. GeoGebra's free licence does not.
4. **It is small enough for a phone.** Check what it adds to the learner app's gzipped bundle.

Add a library to the prop's own `package.json`, not the root, so only props that use it pay for it.

## 5. Wire it in

- A package `library/props/<folder>`: `package.json` named `@chalk/prop-<folder>`, `tsconfig.json`, `src/defs.ts` exporting its definitions and sounds (read without drawing code: the app up front, the build, the server), `src/index.ts` its modules, `propModule(def, View, sound)`. Copy `library/props/coordinates/`.
- `library/registry/package.json`: add the dependency; `library/registry/src/index.ts`: add the package (its defs and sounds, and its modules to load); `modules.ts`: its modules, for Node; `library/registry/src/styles.css`: its `@import`.
- `pnpm install`, then `pnpm catalogue` (library/catalogue.md is generated from the definitions).

## 6. Done means

`pnpm check` passes (typecheck, tests, the content build, Biome); its own page (`?dev&at=library/props/<folder>/<type>`) draws, and its panel sets every variable and runs every action; and a lesson using it plays in the app.
