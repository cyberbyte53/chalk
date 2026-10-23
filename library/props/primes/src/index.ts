import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { bagCompare } from "./bag-compare";
import { BagCompareView } from "./bag-compare-view";
import { beadPair } from "./bead-pair";
import { BeadPairView } from "./bead-pair-view";
import { billSplit } from "./bill-split";
import { BillSplitView } from "./bill-split-view";
import { divisionRows } from "./division-rows";
import { DivisionRowsView } from "./division-rows-view";
import { factorTree } from "./factor-tree";
import { FactorTreeView } from "./factor-tree-view";
import { gearPair } from "./gear-pair";
import { GearPairView } from "./gear-pair-view";
import { lapRace } from "./lap-race";
import { LapRaceView } from "./lap-race-view";
import { primeBag } from "./prime-bag";
import { PrimeBagView } from "./prime-bag-view";
import { primeTowers } from "./prime-towers";
import { PrimeTowersView } from "./prime-towers-view";
import { remainderShelves } from "./remainder-shelves";
import { RemainderShelvesView } from "./remainder-shelves-view";
import { squareBalance } from "./square-balance";
import { SquareBalanceView } from "./square-balance-view";
import { squareCutter } from "./square-cutter";
import { SquareCutterView } from "./square-cutter-view";
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
  BagCompareAction,
  BagCompareDerived,
  BagCompareSignal,
  type BagCompareState,
  BagShow,
  bagCompare as bagCompareDef,
} from "./bag-compare";
export {
  BeadPairAction,
  BeadPairDerived,
  BeadPairSignal,
  type BeadPairState,
  beadPair as beadPairDef,
} from "./bead-pair";
export {
  DivisionRowsAction,
  DivisionRowsDerived,
  DivisionRowsSignal,
  type DivisionRowsState,
  divisionRows as divisionRowsDef,
} from "./division-rows";
export {
  FactorTreeAction,
  FactorTreeDerived,
  FactorTreeSignal,
  type FactorTreeState,
  factorTree as factorTreeDef,
} from "./factor-tree";
export {
  GearPairAction,
  GearPairDerived,
  GearPairSignal,
  type GearPairState,
  gearPair as gearPairDef,
} from "./gear-pair";
export {
  LapRaceAction,
  LapRaceDerived,
  LapRaceSignal,
  type LapRaceState,
  lapRace as lapRaceDef,
} from "./lap-race";
export {
  PrimeBagAction,
  PrimeBagDerived,
  type PrimeBagState,
  primeBag as primeBagDef,
} from "./prime-bag";
export {
  PrimeTowersAction,
  PrimeTowersDerived,
  PrimeTowersSignal,
  type PrimeTowersState,
  TowerShow,
  primeTowers as primeTowersDef,
} from "./prime-towers";
export {
  RemainderShelvesAction,
  RemainderShelvesDerived,
  RemainderShelvesSignal,
  type RemainderShelvesState,
  remainderShelves as remainderShelvesDef,
} from "./remainder-shelves";
export {
  SquareBalanceAction,
  SquareBalanceDerived,
  type SquareBalanceState,
  squareBalance as squareBalanceDef,
} from "./square-balance";
export {
  SquareCutterAction,
  SquareCutterDerived,
  SquareCutterSignal,
  type SquareCutterState,
  squareCutter as squareCutterDef,
} from "./square-cutter";
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
export const divisionRowsProp: PropModule = {
  def: asAnyProp(divisionRows),
  View: DivisionRowsView,
};
export const squareCutterProp: PropModule = {
  def: asAnyProp(squareCutter),
  View: SquareCutterView,
};
export const remainderShelvesProp: PropModule = {
  def: asAnyProp(remainderShelves),
  View: RemainderShelvesView,
};
export const factorTreeProp: PropModule = { def: asAnyProp(factorTree), View: FactorTreeView };
export const primeBagProp: PropModule = { def: asAnyProp(primeBag), View: PrimeBagView };
export const bagCompareProp: PropModule = { def: asAnyProp(bagCompare), View: BagCompareView };
export const gearPairProp: PropModule = { def: asAnyProp(gearPair), View: GearPairView };
export const squareBalanceProp: PropModule = {
  def: asAnyProp(squareBalance),
  View: SquareBalanceView,
};
export const stickMeasureProp: PropModule = {
  def: asAnyProp(stickMeasure),
  View: StickMeasureView,
};
export const lapRaceProp: PropModule = { def: asAnyProp(lapRace), View: LapRaceView };
export const beadPairProp: PropModule = { def: asAnyProp(beadPair), View: BeadPairView };
export const primeTowersProp: PropModule = { def: asAnyProp(primeTowers), View: PrimeTowersView };
export const tenMakerProp: PropModule = { def: asAnyProp(tenMaker), View: TenMakerView };
export const billSplitProp: PropModule = { def: asAnyProp(billSplit), View: BillSplitView };

/** Every prop in this package, for the library. */
export const primeProps: readonly PropModule[] = [
  sweetShareProp,
  divisionRowsProp,
  squareCutterProp,
  stickMeasureProp,
  lapRaceProp,
  beadPairProp,
  primeTowersProp,
  remainderShelvesProp,
  factorTreeProp,
  primeBagProp,
  bagCompareProp,
  gearPairProp,
  squareBalanceProp,
  tenMakerProp,
  billSplitProp,
];
