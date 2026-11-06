# @chalk/draw

The shapes every prop and all art are drawn with: d3's maths (`d3-scale`, `d3-shape`) plus the look's tokens plus the optimisations in [docs/drawing.md](../../docs/drawing.md). The only package that imports d3.

- `stage.tsx`: `Stage`, an SVG with a layer above it for crowds, and its `Space` (d3 scales from the stage's numbers to px; `y` is px on a one-dimensional stage). `useSpace`, `toPixels`.
- `basics.tsx`: `Axis` (line, chevron ends, ticks and labels), `Dot`, `Mark` (dot, stem, label), `Curve` (a function's graph, smoothed by d3), `Line`, `Label`, `Trail` (a smooth road through points, d3's Catmull–Rom curve). `Range` (in `stage.tsx`) measures the same stretch of screen in other numbers. Each takes positions in the stage's numbers and colours as a look role or a hex, moves by `transform`, and is memoised.
- `dots.tsx`: `Dots`, many dots: SVG up to `CROWD_THRESHOLD` (200), a crowd above it, painted with WebGL (canvas 2D when WebGL is missing, lost, or `MAX_WEBGL_CONTEXTS` are in use). `chooseMode` is the rule.
- `shapes.ts`: our own shapes as d3-shape symbol types (`arrowhead`, `chevron`), so they draw to SVG or canvas.
- The drawing kit: stateless shapes in px (the caller converts with its own frame), coloured only by `kit-*` classes, each taking `part` (→ `data-part`) and `class`:
  - `lab.tsx`: `TestTube`, `Beaker`, `ConicalFlask` (fill `level` + `liquid` class, `children` slot under the glass), `SpiritLamp`, `Burner` + `Flame`, `Tripod`, `Bubbles`; `tubePath`, `tubeFillPath`, `tubeLevel`.
  - `marks.tsx`: `AngleArc`, `RightAngle`, `EqualTicks`, `ParallelArrows`, `SideLabel`, `Arrowhead` (`HEAD_TIP`, `HEAD_MIDDLE`).
  - `optics.tsx`: `OpticArrow`, `Ray`, `PrincipalAxis`, `OpticPoint`.
  - `circuit.tsx`: `Wire`, `Cell`, `Battery`, `Resistor`, `Rheostat`, `Bulb`, `Switch`, `PlugKey`, `Meter`, `Dial`.
- `styles.css` (`@chalk/draw/styles.css`): the shapes' styles, from the look's tokens; a shape's own colour arrives as `--shape-color`.
- Re-exports `scaleLinear`, so a prop needing a scale of its own (a bar's length) doesn't import d3.

May import: `@chalk/look`, `preact`, the d3 modules listed in docs/drawing.md.
