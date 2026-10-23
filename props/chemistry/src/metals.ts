import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { extractionFlow } from "./extraction-flow";
import { ExtractionFlowView } from "./extraction-flow-view";
import { refiningCell } from "./extraction-refining";
import { RefiningCellView } from "./extraction-refining-view";
import { thermitWeld } from "./extraction-thermit";
import { ThermitWeldView } from "./extraction-thermit-view";
import { ionicBond } from "./ionic-bond";
import { IonicBondView } from "./ionic-bond-view";
import { ionicTester } from "./ionic-tester";
import { IonicTesterView } from "./ionic-tester-view";
import { goldCarat } from "./metal-carat";
import { GoldCaratView } from "./metal-carat-view";
import { propertyTester } from "./metal-properties";
import { PropertyTesterView } from "./metal-properties-view";
import { reactivityLab } from "./metal-reactivity";
import { ReactivityLabView } from "./metal-reactivity-view";
import { rustLab } from "./metal-rust";
import { RustLabView } from "./metal-rust-view";
import { metalScene } from "./metal-scene";
import { MetalSceneView } from "./metal-scene-view";

/** The props of the metals and non-metals chapter (NCERT Class 10, Ch 3). */

export {
  HYDROGEN_SLOT,
  METAL_NAMES,
  MetalElement,
  REACTIVITY_SERIES,
  isAboveHydrogen,
  isMoreReactive,
  reactivityOf,
} from "./metal-data";
export {
  Mark,
  OUTCOMES,
  PropertyAction,
  PropertyDerived,
  PropertyPart,
  PropertySample,
  PropertySignal,
  type PropertyState,
  PropertyTest,
  SAMPLES,
  SAMPLE_ORDER,
  TESTS,
  TEST_ORDER,
  describeProperty,
  outcomeOf,
  propertyTester as propertyTesterDef,
  tableOf,
} from "./metal-properties";
export {
  Intensity,
  LAB_METALS,
  LabMetal,
  REAGENTS,
  REAGENT_NAMES,
  ReactivityAction,
  ReactivityDerived,
  ReactivityPart,
  ReactivitySignal,
  type ReactivityState,
  Reagent,
  SALTS,
  SolutionColour,
  describeReactivity,
  reactionOf,
  reactivityLab as reactivityLabDef,
} from "./metal-reactivity";
export {
  BOND_STEPS,
  BondAction,
  BondDerived,
  BondPart,
  BondSignal,
  type BondState,
  BondStep,
  COMPOUNDS as IONIC_COMPOUNDS,
  IONIC_ELEMENTS,
  IonicCompound,
  type IonicElement,
  chargeOf,
  describeBond,
  electronChange,
  ionShellsOf,
  ionText,
  ionicBond as ionicBondDef,
  isChargeBalanced,
  shellsOf,
  valenceOf,
} from "./ionic-bond";
export {
  FORM_WORDS,
  IonicSalt,
  SALT_FORMS,
  SALT_POINTS,
  SaltForm,
  TesterAction,
  TesterDerived,
  TesterPart,
  TesterSignal,
  type TesterState,
  describeTester,
  dissolves,
  ionicTester as ionicTesterDef,
  ionsFree,
} from "./ionic-tester";
export {
  EXTRACT_METALS,
  ExtractMetal,
  FlowAction,
  FlowDerived,
  FlowPart,
  FlowSignal,
  type FlowState,
  type FlowStep,
  METHOD_WORDS,
  Method,
  OreKind,
  describeFlow,
  extractionFlow as extractionFlowDef,
  methodOf,
  pathOf,
} from "./extraction-flow";
export {
  THERMIT_EQUATION,
  ThermitAction,
  ThermitDerived,
  ThermitPart,
  ThermitSignal,
  type ThermitState,
  describeThermit,
  thermitWeld as thermitWeldDef,
} from "./extraction-thermit";
export {
  COPPER_SHARE,
  REFINE_SECONDS,
  RefiningAction,
  RefiningDerived,
  RefiningPart,
  RefiningSignal,
  type RefiningState,
  anodeLeft,
  cathodeGained,
  describeRefining,
  refiningCell as refiningCellDef,
} from "./extraction-refining";
export {
  COATINGS,
  COATING_WORDS,
  Coating,
  MAX_DAYS as RUST_MAX_DAYS,
  RUST_FULL,
  RUST_STARTS,
  RustAction,
  RustDerived,
  RustMode,
  RustPart,
  RustSignal,
  type RustState,
  RustTube,
  RustWhere,
  describeRust,
  rustAmount,
  rustLab as rustLabDef,
  rustWhere,
  tubeRusts,
} from "./metal-rust";
export {
  ALLOY_WORDS,
  AlloyMetal,
  CARATS,
  type Carat,
  CaratAction,
  CaratDerived,
  CaratPart,
  CaratSignal,
  type CaratState,
  describeCarat,
  goldCarat as goldCaratDef,
  goldPercent,
  hardnessOf,
} from "./metal-carat";
export {
  METAL_PICTURE,
  MetalSceneKind,
  MetalScenePart,
  type MetalSceneState,
  describeMetalScene,
  metalScene as metalSceneDef,
} from "./metal-scene";

export const propertyTesterProp: PropModule = {
  def: asAnyProp(propertyTester),
  View: PropertyTesterView,
};
export const reactivityLabProp: PropModule = {
  def: asAnyProp(reactivityLab),
  View: ReactivityLabView,
};
export const ionicBondProp: PropModule = { def: asAnyProp(ionicBond), View: IonicBondView };
export const ionicTesterProp: PropModule = { def: asAnyProp(ionicTester), View: IonicTesterView };
export const extractionFlowProp: PropModule = {
  def: asAnyProp(extractionFlow),
  View: ExtractionFlowView,
};
export const thermitWeldProp: PropModule = { def: asAnyProp(thermitWeld), View: ThermitWeldView };
export const refiningCellProp: PropModule = {
  def: asAnyProp(refiningCell),
  View: RefiningCellView,
};
export const rustLabProp: PropModule = { def: asAnyProp(rustLab), View: RustLabView };
export const goldCaratProp: PropModule = { def: asAnyProp(goldCarat), View: GoldCaratView };
export const metalSceneProp: PropModule = { def: asAnyProp(metalScene), View: MetalSceneView };

/** Every metals-and-non-metals prop. */
export const metalsProps: readonly PropModule[] = [
  propertyTesterProp,
  reactivityLabProp,
  ionicBondProp,
  ionicTesterProp,
  extractionFlowProp,
  thermitWeldProp,
  refiningCellProp,
  rustLabProp,
  goldCaratProp,
  metalSceneProp,
];
