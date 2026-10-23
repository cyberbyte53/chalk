import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { allotropes } from "./allotropes";
import { AllotropesView } from "./allotropes-view";
import { carbonChain } from "./chain";
import { CarbonChainView } from "./chain-view";
import { covalentBond } from "./covalent";
import { CovalentBondView } from "./covalent-view";
import { carbonLab } from "./lab";
import { CarbonLabView } from "./lab-view";
import { carbonScene } from "./scene";
import { CarbonSceneView } from "./scene-view";
import { homologousSeries } from "./series";
import { HomologousSeriesView } from "./series-view";
import { soapAction } from "./soap";
import { SoapActionView } from "./soap-view";

export { ELEMENTS, Element, type Counts, massOf, subscript } from "./chem";

export {
  COVALENT_STEPS,
  CovalentAction,
  CovalentDerived,
  CovalentPart,
  CovalentSignal,
  type CovalentState,
  MOLECULES,
  Molecule,
  covalentBond as covalentBondDef,
  describeCovalent,
  isComplete,
  outerCount,
  sharedPairsOf,
} from "./covalent";

export {
  CLASS_WORDS,
  ChainAction,
  ChainDerived,
  ChainPart,
  ChainSignal,
  type ChainState,
  CompoundClass,
  Group,
  MAX_CARBONS,
  Shape,
  bookFormula,
  carbonChain as carbonChainDef,
  chainOf,
  classOf,
  countsOf as chainCountsOf,
  describeChain,
  hydrogensOf,
  isSaturated,
  molecularFormula,
  nameOf,
  problemOf,
} from "./chain";

export {
  GENERAL,
  Series,
  SeriesAction,
  SeriesDerived,
  SeriesPart,
  SeriesSignal,
  type SeriesState,
  describeSeries,
  homologousSeries as homologousSeriesDef,
  rowsOf,
} from "./series";

export {
  Allotrope,
  AllotropeAction,
  AllotropeDerived,
  AllotropePart,
  AllotropeSignal,
  type AllotropeState,
  FACTS as ALLOTROPE_FACTS,
  allotropes as allotropesDef,
  describeAllotrope,
  diamondLattice,
  fullereneAtoms,
  fullereneBonds,
} from "./allotropes";

export {
  DROPS_USED_UP,
  EQUATIONS as LAB_EQUATIONS,
  Flame,
  Fuel,
  LAB_STEPS,
  LabAction,
  LabDerived,
  LabKind,
  LabPart,
  LabSignal,
  type LabState,
  MAX_DROPS,
  carbonLab as carbonLabDef,
  describeLab,
  flameOf,
  labOf,
} from "./lab";

export {
  Cleaner,
  MICELLE_STEPS,
  SoapAction,
  SoapDerived,
  SoapMode,
  SoapPart,
  SoapSignal,
  type SoapState,
  Water,
  describeSoap,
  resultOf as soapResultOf,
  soapAction as soapActionDef,
} from "./soap";

export {
  CARBON_PICTURE,
  CarbonScene,
  CarbonScenePart,
  type CarbonSceneState,
  carbonScene as carbonSceneDef,
  describeCarbonScene,
} from "./scene";

export const covalentBondProp: PropModule = {
  def: asAnyProp(covalentBond),
  View: CovalentBondView,
};
export const carbonChainProp: PropModule = { def: asAnyProp(carbonChain), View: CarbonChainView };
export const homologousSeriesProp: PropModule = {
  def: asAnyProp(homologousSeries),
  View: HomologousSeriesView,
};
export const allotropesProp: PropModule = { def: asAnyProp(allotropes), View: AllotropesView };
export const carbonLabProp: PropModule = { def: asAnyProp(carbonLab), View: CarbonLabView };
export const soapActionProp: PropModule = { def: asAnyProp(soapAction), View: SoapActionView };
export const carbonSceneProp: PropModule = { def: asAnyProp(carbonScene), View: CarbonSceneView };

/** Every carbon-chapter prop, for the library. */
export const carbonProps: readonly PropModule[] = [
  covalentBondProp,
  carbonChainProp,
  homologousSeriesProp,
  allotropesProp,
  carbonLabProp,
  soapActionProp,
  carbonSceneProp,
];
