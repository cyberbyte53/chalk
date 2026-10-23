import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { acidBench } from "./acid-bench";
import { AcidBenchView } from "./acid-bench-view";
import { conductivityTester } from "./acid-conduct";
import { ConductivityView } from "./acid-conduct-view";
import { acidIndicator } from "./acid-indicator";
import { AcidIndicatorView } from "./acid-indicator-view";
import { neutraliser } from "./acid-neutralise";
import { NeutraliserView } from "./acid-neutralise-view";
import { acidsScene } from "./acid-scene";
import { AcidSceneView } from "./acid-scene-view";
import { phScale } from "./ph-scale";
import { PhScaleView } from "./ph-scale-view";
import { saltFactory } from "./salt-factory";
import { SaltFactoryView } from "./salt-factory-view";
import { saltFamily } from "./salt-family";
import { SaltFamilyView } from "./salt-family-view";

/** The acids, bases and salts chapter's props (NCERT Class 10 Chapter 2). */

export {
  HUE_WORDS,
  Hue,
  INDICATORS,
  type Indicator,
  IndicatorId,
  NATURE_WORDS,
  Nature,
  type Response,
  SUBSTANCES,
  type Substance,
  SubstanceId,
  UNIVERSAL_HUES,
  natureOf,
  natureOfPh,
  responseOf,
  responseWords,
  strengthOfPh,
  subscripted,
  universalBand,
} from "./acid-data";
export {
  IndicatorAction,
  IndicatorDerived,
  IndicatorPart,
  IndicatorSignal,
  type IndicatorState,
  acidIndicator as acidIndicatorDef,
  describeIndicator,
  isSampleDone,
  latestTest,
  wasTested,
} from "./acid-indicator";
export {
  LIFE_BANDS,
  LifeBand,
  PhAction,
  PhDerived,
  PhPart,
  PhSignal,
  type PhState,
  describePh,
  hydrogenVsWater,
  hydrogenWords,
  phScale as phScaleDef,
  readingOf,
} from "./ph-scale";
export {
  FLASK_INDICATORS,
  NeutraliseAction,
  NeutraliseDerived,
  NeutralisePart,
  NeutraliseSignal,
  type NeutraliseState,
  colourOf as neutraliseColourOf,
  describeNeutralise,
  excessAcidMl,
  isNeutral,
  neutraliser as neutraliserDef,
  phOf as neutralisePhOf,
} from "./acid-neutralise";
export {
  ACID_BENCH,
  AcidBenchAction,
  AcidBenchDerived,
  AcidBenchKind,
  AcidBenchPart,
  AcidBenchSignal,
  type AcidBenchState,
  acidBench as acidBenchDef,
  describeAcidBench,
  seenSoFar,
  stepsOf,
} from "./acid-bench";
export {
  CONDUCT_SOLUTIONS,
  ConductAction,
  ConductDerived,
  ConductPart,
  ConductSignal,
  type ConductSolution,
  type ConductState,
  PARTICLES,
  brightnessOf,
  conductivityTester as conductivityTesterDef,
  describeConduct,
  hasIons,
} from "./acid-conduct";
export {
  ANIONS,
  Anion,
  CATIONS,
  Cation,
  SALTS as SALT_FAMILY,
  SaltFamilyAction,
  SaltFamilyDerived,
  SaltFamilyPart,
  SaltFamilySignal,
  type SaltFamilyState,
  SaltId,
  describeSaltFamily,
  familyOf,
  saltFamily as saltFamilyDef,
  saltName,
  saltNature,
} from "./salt-family";
export {
  PRODUCTS,
  Product,
  Route,
  SaltFactoryAction,
  SaltFactoryDerived,
  SaltFactoryPart,
  SaltFactorySignal,
  type SaltFactoryState,
  describeSaltFactory,
  saltFactory as saltFactoryDef,
  shownProducts,
} from "./salt-factory";
export {
  ACID_PICTURE,
  AcidSceneKind,
  AcidScenePart,
  type AcidSceneState,
  acidsScene as acidsSceneDef,
  describeAcidScene,
} from "./acid-scene";

export const acidIndicatorProp: PropModule = {
  def: asAnyProp(acidIndicator),
  View: AcidIndicatorView,
};
export const phScaleProp: PropModule = { def: asAnyProp(phScale), View: PhScaleView };
export const neutraliserProp: PropModule = { def: asAnyProp(neutraliser), View: NeutraliserView };
export const acidBenchProp: PropModule = { def: asAnyProp(acidBench), View: AcidBenchView };
export const conductivityTesterProp: PropModule = {
  def: asAnyProp(conductivityTester),
  View: ConductivityView,
};
export const saltFamilyProp: PropModule = { def: asAnyProp(saltFamily), View: SaltFamilyView };
export const saltFactoryProp: PropModule = { def: asAnyProp(saltFactory), View: SaltFactoryView };
export const acidsSceneProp: PropModule = { def: asAnyProp(acidsScene), View: AcidSceneView };

/** Every prop of the acids, bases and salts chapter. */
export const acidProps: readonly PropModule[] = [
  acidIndicatorProp,
  phScaleProp,
  neutraliserProp,
  acidBenchProp,
  conductivityTesterProp,
  saltFamilyProp,
  saltFactoryProp,
  acidsSceneProp,
];
