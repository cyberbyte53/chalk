# Building blocks

Small props other props are built from, and usable on a board alone:

- `plane`: graph paper (a window, grid lines, axes, O) with layers: plotted dots, a handle on the x-axis, a drop line from the axis to a point. Other packages add their own plane layers (`coordinatePlane` in `@chalk/prop-coordinates`).
- `stepper`: − value +, for a number the learner nudges.
- `mathLine`: one line of typeset maths.
- `iconButton`: a round button with a symbol, no words.

See `platform/packages/prop/src/compose.ts` for hosts, layers and composites.
