import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { plane } from "./plane";
import { PlaneView } from "./plane-view";
import { iconButton, mathLine, stepper } from "./small";
import { IconButtonView, MathLineView, StepperView } from "./small-view";

export {
  type AxisHandle,
  DotTone,
  GridPart,
  type GridState,
  GuidePart,
  HandleAction,
  HandlePart,
  HandleSignal,
  type Plotted,
  PlottedAction,
  PlottedPart,
  type PlaneState,
  type PlaneWindowTuple,
  axisHandle,
  guide,
  plane as planeDef,
  planeCore,
  planePixels,
  planeWindowSchema,
  plotted,
  windowOf,
} from "./plane";
export {
  GuideDraw,
  HandleDraw,
  type PlaneLayerProps,
  PlaneStage,
  PlaneView,
  PlottedDraw,
  useDial,
} from "./plane-view";
export { Grid, isInside, planeFrame } from "./grid";
export {
  type Dot,
  DotsAction,
  DotsPart,
  type DotPlaneState,
  DropLinePart,
  GraphPaperPart,
  XHandleAction,
  XHandlePart,
  XHandleSignal,
  dotPlane,
  dots,
  dropLine,
  graphPaper,
  paperPixels,
  xHandle,
} from "./paper";
export { DotPlaneView, DotsView, DropLineView, GraphPaperView, XHandleView } from "./paper-view";
export {
  IconButtonAction,
  IconButtonSignal,
  MathLinePart,
  StepperAction,
  StepperPart,
  StepperSignal,
  iconButton as iconButtonDef,
  mathLine as mathLineDef,
  stepper as stepperDef,
} from "./small";
export { IconButtonView, MathLineView, StepperView } from "./small-view";

export const planeProp: PropModule = { def: asAnyProp(plane), View: PlaneView };
export const stepperProp: PropModule = { def: asAnyProp(stepper), View: StepperView };
export const mathLineProp: PropModule = { def: asAnyProp(mathLine), View: MathLineView };
export const iconButtonProp: PropModule = { def: asAnyProp(iconButton), View: IconButtonView };

/** Every prop in this package. */
export const blocksProps: readonly PropModule[] = [
  planeProp,
  stepperProp,
  mathLineProp,
  iconButtonProp,
];
