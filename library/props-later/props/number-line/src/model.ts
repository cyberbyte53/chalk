import { FrameKind, defineHost } from "@chalk/prop";
import { AxisAction, AxisDerived, AxisPart, AxisSignal, axis, axisPixels } from "./axis";
import {
  DotsAction,
  DotsDerived,
  DotsPart,
  MarkerAction,
  MarkerDerived,
  MarkerPart,
  MarkerSignal,
  MarksAction,
  MarksPart,
  PanAction,
  PanPart,
  PanSignal,
  SplitAction,
  SplitDerived,
  SplitPart,
  SplitSignal,
  ZoomAction,
  ZoomPart,
  dots,
  marker,
  marks,
  pan,
  split,
  zoom,
} from "./layers";

export { MAX, MAX_SPAN, MIN, MIN_SPAN, MAGNIFY_SECONDS } from "./axis";
export {
  MAX_DOTS,
  MAX_MARKS,
  MAX_PARTS,
  type Dot,
  type Mark,
  type Pan,
  type Split,
  panned,
  splitPoints,
} from "./layers";

export const NumberLinePart = {
  ...AxisPart,
  ...MarkerPart,
  ...MarksPart,
  ...DotsPart,
  ...SplitPart,
  ...ZoomPart,
  ...PanPart,
} as const;
export const NumberLineAction = {
  ...AxisAction,
  ...MarkerAction,
  ...MarksAction,
  ...DotsAction,
  ...SplitAction,
  ...ZoomAction,
  ...PanAction,
} as const;
export const NumberLineDerived = {
  ...AxisDerived,
  ...MarkerDerived,
  ...DotsDerived,
  ...SplitDerived,
} as const;
export const NumberLineSignal = {
  ...AxisSignal,
  ...MarkerSignal,
  ...SplitSignal,
  ...PanSignal,
} as const;

/**
 * A number line you can magnify, mark and cut into equal parts. It knows numbers on a line,
 * nothing more. The axis is its core; everything else is a layer (./layers.ts), on when a board
 * uses it.
 */
export const numberLine = defineHost({
  type: "numberLine",
  describe:
    "A number line showing the window from `from` to `to`. It can show labelled points (marks), a stretch cut into equal parts (split), and a draggable marker. Magnifying picks the tenth of the window that holds a number and zooms into it, one decimal place per step (successive magnification).",
  frame: FrameKind.Axis,
  core: axis,
  layers: [marker, marks, dots, split, zoom, pan],
  window: (s) => ({ from: s.from, to: s.to }),
  pixels: (s, width) => axisPixels(s, width),
});

export type NumberLineState = typeof numberLine.defaults;
