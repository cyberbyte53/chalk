import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { billSplit } from "./bill-split";
import { BillSplitView } from "./bill-split-view";
import { factorTree } from "./factor-tree";
import { FactorTreeView } from "./factor-tree-view";
import { lapRace } from "./lap-race";
import { LapRaceView } from "./lap-race-view";
import { primeTowers } from "./prime-towers";
import { PrimeTowersView } from "./prime-towers-view";
import { stickMeasure } from "./stick-measure";
import { StickMeasureView } from "./stick-measure-view";
import { sweetShare } from "./sweet-share";
import { SweetShareView } from "./sweet-share-view";
import { tenMaker } from "./ten-maker";
import { TenMakerView } from "./ten-maker-view";

export {
  type Bag,
  bagOf,
  bagText,
  divide,
  euclidSteps,
  gcd,
  isPrime,
  lcm,
} from "./arithmetic";
export {
  FactorTreeAction,
  FactorTreeDerived,
  FactorTreeSignal,
  type FactorTreeState,
  factorTree as factorTreeDef,
} from "./factor-tree";
export {
  LapRaceAction,
  LapRaceDerived,
  LapRaceSignal,
  type LapRaceState,
  lapRace as lapRaceDef,
} from "./lap-race";
export {
  PrimeTowersAction,
  PrimeTowersDerived,
  PrimeTowersSignal,
  type PrimeTowersState,
  TowerShow,
  primeTowers as primeTowersDef,
} from "./prime-towers";
export {
  StickMeasureAction,
  StickMeasureDerived,
  StickMeasureSignal,
  type StickMeasureState,
  stickMeasure as stickMeasureDef,
} from "./stick-measure";
export {
  MAX_FRIENDS,
  MAX_SWEETS,
  SweetShareAction,
  SweetShareDerived,
  SweetShareSignal,
  type SweetShareState,
  sweetShare as sweetShareDef,
  sweetSum,
} from "./sweet-share";
export {
  BillSplitAction,
  BillSplitSignal,
  type BillSplitState,
  billSplit as billSplitDef,
  shareOf,
} from "./bill-split";
export {
  TenMakerAction,
  TenMakerDerived,
  TenMakerSignal,
  type TenMakerState,
  TenStage,
  tenMaker as tenMakerDef,
  terminatingDecimal,
} from "./ten-maker";

export const sweetShareProp: PropModule = { def: asAnyProp(sweetShare), View: SweetShareView };
export const factorTreeProp: PropModule = { def: asAnyProp(factorTree), View: FactorTreeView };
export const stickMeasureProp: PropModule = {
  def: asAnyProp(stickMeasure),
  View: StickMeasureView,
};
export const lapRaceProp: PropModule = { def: asAnyProp(lapRace), View: LapRaceView };
export const primeTowersProp: PropModule = { def: asAnyProp(primeTowers), View: PrimeTowersView };
export const tenMakerProp: PropModule = { def: asAnyProp(tenMaker), View: TenMakerView };
export const billSplitProp: PropModule = { def: asAnyProp(billSplit), View: BillSplitView };

/** Every prop in this package, for the library. */
export const primeProps: readonly PropModule[] = [
  sweetShareProp,
  stickMeasureProp,
  lapRaceProp,
  primeTowersProp,
  factorTreeProp,
  tenMakerProp,
  billSplitProp,
];
