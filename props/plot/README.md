# @chalk/prop-plot

Graphs. It plots what it's given; it knows nothing about where the numbers come from.

- `src/graph.ts`: a line graph. Stored `points` (`[x, y]`; only the newest 1,000 are kept), `xMax` (grows to fit), `yMin`, `yMax`, `guide` (an optional dashed line) with `guideLabel`, `xLabel`, `yLabel`; derived `count`, `lastY`; actions `addPoint`, `clear`, `setGuide`.
- `src/view.tsx`: draws it in SVG at the width it's given.
- `src/graph.test.ts`: adding points, the x axis growing, only the newest points kept, and no upside-down y axis.

May import: `@chalk/prop`, `@chalk/player` (types), `preact`, `zod`. Exports: `graphProp` (the module), `graphDef`, `GraphState`, `MAX_POINTS`.
