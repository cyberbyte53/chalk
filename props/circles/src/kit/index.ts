/**
 * The geometry kit: drawing pieces, tools, controls and label placement for geometry props, in
 * model units inside a @chalk/draw <Stage>. Import from "@chalk/prop-circles/kit" and load
 * "@chalk/prop-circles/kit.css" (the package's styles.css already includes it).
 *
 * - geometry: pure plane geometry (points, lines, circles, tangents, triangles) and number text.
 * - frame: the Stage window that fits a figure (`frameOf`), model ↔ pixel helpers, line clipping.
 * - pieces: Seg, InfiniteLine, CircleShape, ArcShape, Region, SectorShape, CircleSegmentShape,
 *   PointDot, AngleMark, RightMark, EqualTicks, ParallelMarks, Labels, DragHandle.
 * - path: PathShape and `shapes` — regions made of sides and arcs, with holes (evenodd).
 * - tools: Compass and Ruler, for constructions.
 * - controls: Button, Nudger, StepBar.
 * - labels: `placeLabels`, the overlap-avoiding placer behind <Labels>.
 */
export * from "./controls";
export * from "./frame";
export * from "./geometry";
export * from "./labels";
export * from "./path";
export * from "./pieces";
export * from "./tools";
