import { compositeView } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { IconButtonView, MathLineView, PlaneView, StepperView } from "@chalk/prop-blocks";
import { valueMachine } from "./value-machine";

/**
 * The machine is drawn by its blocks, one under another: p(x), the x stepper, the working, the
 * plane (dots, the drop line, the x handle) and ↺. Each block's own view, from the machine's state.
 */
export const ValueMachineView = compositeView(
  asAnyProp(valueMachine),
  {
    rule: MathLineView,
    input: StepperView,
    working: MathLineView,
    plane: PlaneView,
    clear: IconButtonView,
  },
  ["plane"],
);
