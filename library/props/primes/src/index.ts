import { type PropModule, propModule } from "@chalk/player";
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
  type FactorTreeState,
  factorTree as factorTreeDef,
} from "./factor-tree";
export {
  type LapRaceState,
  lapRace as lapRaceDef,
} from "./lap-race";
export {
  type PrimeTowersState,
  TowerShow,
  primeTowers as primeTowersDef,
} from "./prime-towers";
export {
  type StickMeasureState,
  stickMeasure as stickMeasureDef,
} from "./stick-measure";
export {
  MAX_FRIENDS,
  MAX_SWEETS,
  type SweetShareState,
  sweetShare as sweetShareDef,
  sweetSum,
} from "./sweet-share";
export {
  type BillSplitState,
  billSplit as billSplitDef,
  shareOf,
} from "./bill-split";
export {
  type TenMakerState,
  TenStage,
  tenMaker as tenMakerDef,
  terminatingDecimal,
} from "./ten-maker";

export const sweetShareProp = propModule(sweetShare, SweetShareView);
export const factorTreeProp = propModule(factorTree, FactorTreeView);
export const stickMeasureProp = propModule(stickMeasure, StickMeasureView);
export const lapRaceProp = propModule(lapRace, LapRaceView);
export const primeTowersProp = propModule(primeTowers, PrimeTowersView);
export const tenMakerProp = propModule(tenMaker, TenMakerView);
export const billSplitProp = propModule(billSplit, BillSplitView);

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
