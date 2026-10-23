import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { mendeleevTable } from "./mendeleev";
import { MendeleevView } from "./mendeleev-view";
import { periodicTable } from "./modern";
import { ModernView } from "./modern-view";
import { octaveTable } from "./octaves";
import { OctavesView } from "./octaves-view";
import { periodicScene } from "./scene";
import { PeriodicSceneView } from "./scene-view";
import { triadChecker } from "./triads";
import { TriadsView } from "./triads-view";

export {
  BY_SYMBOL,
  ELEMENTS,
  type Element,
  Kind,
  NOTES,
  PERIOD_LENGTHS,
  RADII,
  bySymbol,
  configOf,
  element,
  groupOf,
  isInnerRow,
  periodOf,
  shellCapacity,
  shellsOf,
  trendOf,
  valenceOf,
  valencyOf,
} from "./elements";

export {
  TRIADS,
  TRIAD_STEPS,
  TRIAD_TOLERANCE,
  TriadAction,
  TriadDerived,
  TriadPart,
  TriadSet,
  TriadSignal,
  type TriadState,
  averageOf,
  describeTriad,
  isTriad,
  middleOf,
  triadChecker as triadCheckerDef,
} from "./triads";

export {
  DOUBLE_SLOTS,
  GOOD_PAIRS,
  OCTAVE_ROWS,
  OctaveAction,
  OctaveDerived,
  OctavePart,
  OctaveSignal,
  type OctaveState,
  breakCount,
  columnOf,
  describeOctaves,
  isPastCalcium,
  octaveTable as octaveTableDef,
} from "./octaves";

export {
  Anomaly,
  EKA_ALUMINIUM_TABLE,
  GAPS,
  GROUP_NAMES,
  Gap,
  HYDRIDES,
  MENDELEEV_ROWS,
  MendeleevAction,
  MendeleevDerived,
  MendeleevMode,
  MendeleevPart,
  MendeleevSignal,
  type MendeleevState,
  NOBLE,
  OXIDES,
  describeMendeleev,
  fill,
  hydrideOf,
  mendeleevGroupOf,
  mendeleevTable as mendeleevTableDef,
  oxideOf,
} from "./mendeleev";

export {
  Layout,
  ModernAction,
  ModernDerived,
  ModernPart,
  ModernSignal,
  type ModernState,
  SHORT_GROUPS,
  SHORT_MAX_Z,
  Trend,
  describeModern,
  elementsIn,
  periodicTable as periodicTableDef,
  sameGroup,
  samePeriod,
} from "./modern";

export {
  PERIODIC_PICTURE,
  PeriodicScene,
  PeriodicScenePart,
  type PeriodicSceneState,
  describePeriodicScene,
  periodicScene as periodicSceneDef,
} from "./scene";

export const triadCheckerProp: PropModule = { def: asAnyProp(triadChecker), View: TriadsView };
export const octaveTableProp: PropModule = { def: asAnyProp(octaveTable), View: OctavesView };
export const mendeleevTableProp: PropModule = {
  def: asAnyProp(mendeleevTable),
  View: MendeleevView,
};
export const periodicTableProp: PropModule = { def: asAnyProp(periodicTable), View: ModernView };
export const periodicSceneProp: PropModule = {
  def: asAnyProp(periodicScene),
  View: PeriodicSceneView,
};

/** Every prop in this package, for the library. */
export const periodicProps: readonly PropModule[] = [
  triadCheckerProp,
  octaveTableProp,
  mendeleevTableProp,
  periodicTableProp,
  periodicSceneProp,
];
