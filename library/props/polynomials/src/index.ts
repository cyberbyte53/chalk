import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { longDivision } from "./long-division";
import { LongDivisionView } from "./long-division-view";
import { polyBox } from "./poly-box";
import { PolyBoxView } from "./poly-box-view";
import { valueMachine } from "./value-machine";
import { ValueMachineView } from "./value-machine-view";
import { zeroPlane } from "./zero-plane";
import { ZeroPlaneView } from "./zero-plane-view";

export {
  type Poly,
  degreeOf,
  factoredTex,
  fromZeroes,
  niceNumber,
  polyTex,
  polyText,
  realZeroes,
  times,
  valueAt,
  zeroesWithRepeats,
} from "./poly";
export { divisionSteps, termsOf, termsTex } from "./box-algebra";
export {
  BoxMode,
  PolyBoxAction,
  PolyBoxDerived,
  PolyBoxSignal,
  type PolyBoxState,
  polyBox as polyBoxDef,
} from "./poly-box";
export {
  DivisionMove,
  LongDivisionAction,
  LongDivisionDerived,
  LongDivisionSignal,
  type LongDivisionState,
  longDivision as longDivisionDef,
} from "./long-division";
export {
  ValueMachineAction,
  ValueMachineDerived,
  ValueMachineSignal,
  type ValueMachineState,
  valueMachine as valueMachineDef,
  workingTex,
} from "./value-machine";
export {
  PlaneForm,
  ZeroPlaneAction,
  ZeroPlaneDerived,
  ZeroPlaneSignal,
  type ZeroPlaneState,
  zeroPlane as zeroPlaneDef,
} from "./zero-plane";

export const zeroPlaneProp: PropModule = { def: asAnyProp(zeroPlane), View: ZeroPlaneView };
export const polyBoxProp: PropModule = { def: asAnyProp(polyBox), View: PolyBoxView };
export const valueMachineProp: PropModule = {
  def: asAnyProp(valueMachine),
  View: ValueMachineView,
};

export const longDivisionProp: PropModule = {
  def: asAnyProp(longDivision),
  View: LongDivisionView,
};

/** Every prop in this package, for the library. */
export const polynomialProps: readonly PropModule[] = [
  zeroPlaneProp,
  polyBoxProp,
  valueMachineProp,
  longDivisionProp,
];
