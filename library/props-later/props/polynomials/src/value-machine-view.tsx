import { groupView } from "@chalk/player";
import { DotPlaneView, IconButtonView, MathLineView, StepperView } from "@chalk/prop-blocks";
import { valueMachine } from "./value-machine";

/**
 * The machine is drawn by its blocks, one under another: p(x), the x stepper, the working, the
 * plane (dots, the drop line, the x handle) and ↺. Each block's own view, from its own state.
 */
export const ValueMachineView = groupView(
  valueMachine,
  {
    rule: MathLineView,
    stepper: StepperView,
    substitution: MathLineView,
    plane: DotPlaneView,
    clear: IconButtonView,
  },
  { wide: ["plane"] },
);
