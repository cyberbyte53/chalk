# Drawing

How props and art put things on screen. Read before drawing anything new.

## Layers

```text
@chalk/look   tokens: colours, fonts, sizes. The only place a raw value lives.
d3            the maths of drawing: scales, shapes, interpolation, arrays. Never touches the page.
@chalk/draw   the pieces (Dot, Line, Curve, Dots…): d3 geometry + the look's tokens + the optimisations below.
props, art    built from pieces. Preact puts them on the page; the board model moves them (planned moves on its clock).
```

`@chalk/draw` is the only package that imports d3 (a lint rule enforces it). Props and art use its pieces; a prop may still draw its own SVG inside a `Stage` for what no piece covers (the number line's lens and cuts), and a piece is added once a second prop wants the same thing.

## The pieces today

- `Stage`: an SVG with a crowd layer and a top layer above it. Its `x` (and `y`) ranges become d3 scales; pieces take positions in those numbers. On a stage without `y`, `y` is in px (a number line). Every stage has a `label` for screen readers.
- `Axis` (line, chevron ends, ticks and labels), `Dot`, `Mark` (dot, stem, label), `Curve` (a function's graph), `Line`, `Label`, `Range` (the same stretch of screen measuring other numbers), `Trail` (a smooth road through points: a chapter's path), `Dots` (many dots), `OnTop` (pieces above the crowd).
- `arrowhead`, `chevron`: our shapes as d3 symbol types. `scaleLinear` is re-exported for a prop's own scales.

## Check d3 before writing your own

Before writing geometry, a shape, a scale, a statistic or a layout by hand, check this list. If d3 has it, use it (through `@chalk/draw`, adding a piece if needed). If d3 has something close, extend it (below) rather than starting over.

**In use**

| Module | Gives you |
|---|---|
| `d3-scale` | Value ↔ pixel (`scaleLinear`, `invert`), tidy `ticks`; `scaleLog` (exponents), `scaleBand` (bars), `scalePow`/`scaleSqrt` |
| `d3-shape` | `line`, `area`, `arc` (angles, sectors, rings), `pie`, `symbol`, `link`; curves (`curveNatural`, `curveCatmullRom`, `curveStep`, …) |
| `d3-path` | The context every shape draws through: an SVG path string or a canvas, same code |
| `d3-interpolate` | Blending numbers, colours, strings with numbers, whole paths: the in-between frames of a tween or morph |
| `d3-array` | `bisect` (snap to the nearest value), `extent`, `bin` (histogram classes), `mean`, `median`, `quantile`, `deviation`, `range`, `ticks` |

**Ready when a prop needs one**

| Module | Gives you |
|---|---|
| `d3-hierarchy` | Trees and their layouts: factor trees, probability trees |
| `d3-polygon` | A polygon's area, centroid, hull, whether a point is inside |
| `d3-random` | Normal, binomial, uniform, … draws. Always with a seeded `.source(…)`, so chance repeats |
| `d3-delaunay` | The nearest of many points to a finger; Voronoi cells |
| `d3-ease` | Easing curves for tweens, plugged into the runtime |
| `d3-force` | Springs, collisions, attraction between many bodies. Driven by our clock (`simulation.stop()`, then `.tick()` each frame) and seeded (`randomSource`), so pausing, replays and witnesses still work |
| `d3-contour` | Contour lines of a 2D function |
| `d3-geo` | Map projections, if maps come |

**Never** (a lint rule blocks them): `d3-selection`, `d3-transition`, `d3-timer`, `d3-drag`, `d3-zoom`, `d3-brush`, `d3-axis`, `d3-dispatch`, `d3-color`, `d3-fetch`, and the `d3` bundle. They change the page directly, keep their own clock or handle touches themselves, which bypasses Preact and the board's clock. Preact draws; our runtime moves things; prop actions handle touches; `@chalk/look` has the colours.

## Extending d3

d3 extends through small interfaces, not subclasses: any object with the right methods fits.

- A new mark (arrowhead, cross, check): a symbol type, `{ draw(context, size) }`, used as `symbol().type(arrowhead)`.
- A new way to join points (the number-line jump): a curve, `{ lineStart, lineEnd, point(x, y) }`.
- A new scale rule (exactly tenths for successive magnification): a function with `domain`, `range`, `invert`, `ticks`, wrapping a d3 scale.
- A new blend (fractions that stay fractions in a tween): an interpolator `(a, b) => (t) => value`.

Shapes draw through `context`, so they work in SVG and on a canvas with the same code.

## Physics and motion

Prefer an exact formula over stepping a simulation. Store the setup and the time; work out everything else (position, velocity, momentum, energy) from them, as `library/props/collision` does. Any moment can then be shown, replayed or checked. Step a simulation (d3-force, or a small engine on the board's clock) only when no formula exists.

## Optimisations (always on)

From the draw bench (one number line, 41 ticks, N moving dots, CPU slowed 4× like a cheap phone; frames a second):

| Way of drawing | 100 | 1,000 | 3,000 |
|---|---|---|---|
| Whole face re-runs, dots move by `cx`/`cy` (before) | 60 | 27 | 10 |
| Static parts memoised | 60 | 28 | 10 |
| Moving things by `transform` | 55 | 40 | 10 |
| A signal bound to each moving attribute | 60 | 45 | 12 |
| Canvas 2D | 60 | 40 | 15 |
| WebGL | 59 | 51 | 19 |

(A server with no graphics chip; real phones do better on canvas and WebGL.)

The pieces apply these themselves, so a prop gets them by using pieces:

1. **Static parts never re-run.** Axes, ticks, labels and frames are memoised; they redraw only when what they show changes (the range, the size).
2. **Moving things move by `transform`.** A piece places its shape at the origin and moves it with `translate(…)`; the shape itself is not redrawn.
3. **Things that change every frame bind a signal to the attribute.** A dragged marker or a tweened dot updates one attribute directly: no component re-run, no diff. *Not yet:* a prop's view is handed its state as plain values, so today the view re-runs and the memoised pieces skip everything but what moved. Binding needs the player to hand views their state as signals; do it when a drag measures slow.
4. **Many of the same thing go in a collection piece** (`Dots`, `Marks`, `Arrows`), which picks how to draw by itself:
   - fewer than the threshold (about 200, one constant in `@chalk/draw`, set from the bench on phones): SVG, one element each;
   - more, and the items are plain: WebGL, falling back to canvas 2D when WebGL is missing or lost;
   - more, but items carry labels or are tapped one by one: SVG, with a warning in development.
   Each crowd has its own WebGL context, at most 8 on a page (browsers allow 8–16); a crowd beyond that, or one whose context is lost, paints with canvas 2D. A crowd sits above the SVG; what must stay on top of it (the particle to follow) goes in `OnTop`.
5. **Nothing animates unseen.** Motion runs on the board's clock, which stops when the board is paused or gone.
6. **Measure on a phone, don't guess.** The dev frame meter shows frames a second for a board; tune only what drops below 55.

A single thing a learner reads, taps or drags is always its own piece (`Dot`, `Label`), so it stays SVG: crisp, tappable, readable by a screen reader.
