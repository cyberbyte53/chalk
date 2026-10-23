import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { asexualModes } from "./asexual";
import { AsexualModesView } from "./asexual-view";
import { contraceptionChart } from "./contraception";
import { ContraceptionChartView } from "./contraception-view";
import { menstrualCycle } from "./cycle";
import { MenstrualCycleView } from "./cycle-view";
import { dnaCopy } from "./dna-copy";
import { DnaCopyView } from "./dna-copy-view";
import { flower } from "./flower";
import { FlowerView } from "./flower-view";
import { germCells } from "./germ-cells";
import { GermCellsView } from "./germ-cells-view";
import { seedGermination } from "./germination";
import { SeedGerminationView } from "./germination-view";
import { humanSystems } from "./human";
import { HumanSystemsView } from "./human-view";
import { plantPropagation } from "./propagation";
import { PlantPropagationView } from "./propagation-view";
import { reproductionScene } from "./scene";
import { ReproductionSceneView } from "./scene-view";

export {
  BACTERIA,
  DNA_STEPS,
  DnaAction,
  DnaDerived,
  DnaMode,
  DnaPart,
  DnaSignal,
  type DnaState,
  GENERATIONS,
  type Lineage,
  RESISTANT,
  SEGMENTS,
  cellsAt,
  describeDna,
  dnaCopy as dnaCopyDef,
  survivorsAt,
} from "./dna-copy";

export {
  AsexualAction,
  AsexualDerived,
  AsexualPart,
  AsexualSignal,
  type AsexualState,
  MAX_ASEXUAL_STEPS,
  Mode as AsexualMode,
  ORGANISMS,
  Organism,
  asexualModes as asexualModesDef,
  describeAsexual,
  stepsOf as asexualStepsOf,
} from "./asexual";

export {
  MAX_PROPAGATION_STEPS,
  METHOD_STEPS,
  Method as PropagationMethod,
  PropagationAction,
  PropagationDerived,
  PropagationPart,
  PropagationSignal,
  type PropagationState,
  describePropagation,
  grewOf,
  plantPropagation as plantPropagationDef,
  stepsOfMethod,
} from "./propagation";

export {
  BODY_CHROMOSOMES,
  GERM_STEPS,
  GermAction,
  GermDerived,
  GermMode,
  GermPart,
  GermSignal,
  type GermState,
  chromosomesAt,
  describeGerm,
  germCells as germCellsDef,
} from "./germ-cells";

export {
  Agent,
  FLOWER_STEPS,
  FlowerAction,
  FlowerDerived,
  FlowerMode,
  FlowerPart,
  FlowerPartId,
  FlowerSignal,
  type FlowerState,
  FlowerType,
  ORGAN as FLOWER_ORGAN,
  PART_JOBS,
  Pollination,
  describeFlower,
  flower as flowerDef,
} from "./flower";

export {
  GERMINATION_STEPS,
  GerminationAction,
  GerminationDerived,
  GerminationPart,
  GerminationSignal,
  type GerminationState,
  describeGermination,
  seedGermination as seedGerminationDef,
} from "./germination";

export {
  FEMALE_ORGANS,
  FemaleOrgan,
  HumanAction,
  HumanDerived,
  HumanMode,
  HumanPart,
  HumanSignal,
  type HumanState,
  JOURNEY_STEPS,
  MALE_ORGANS,
  MaleOrgan,
  ORGAN_JOBS,
  Organ,
  describeHuman,
  humanSystems as humanSystemsDef,
  systemOf,
} from "./human";

export {
  CYCLE_STEPS,
  CycleAction,
  CycleDerived,
  CyclePart,
  CycleSignal,
  type CycleState,
  LINING,
  describeCycle,
  menstrualCycle as menstrualCycleDef,
} from "./cycle";

export {
  Category as ContraceptionCategory,
  ContraceptionAction,
  ContraceptionDerived,
  ContraceptionMethod,
  ContraceptionPart,
  ContraceptionSignal,
  type ContraceptionState,
  type ContraceptiveMethod,
  METHODS as CONTRACEPTIVE_METHODS,
  contraceptionChart as contraceptionChartDef,
  describeContraception,
} from "./contraception";

export {
  REPRODUCTION_PICTURE,
  ReproductionScene,
  ReproductionScenePart,
  type ReproductionSceneState,
  describeReproductionScene,
  reproductionScene as reproductionSceneDef,
} from "./scene";

export const dnaCopyProp: PropModule = { def: asAnyProp(dnaCopy), View: DnaCopyView };
export const asexualModesProp: PropModule = {
  def: asAnyProp(asexualModes),
  View: AsexualModesView,
};
export const plantPropagationProp: PropModule = {
  def: asAnyProp(plantPropagation),
  View: PlantPropagationView,
};
export const germCellsProp: PropModule = { def: asAnyProp(germCells), View: GermCellsView };
export const flowerProp: PropModule = { def: asAnyProp(flower), View: FlowerView };
export const seedGerminationProp: PropModule = {
  def: asAnyProp(seedGermination),
  View: SeedGerminationView,
};
export const humanSystemsProp: PropModule = {
  def: asAnyProp(humanSystems),
  View: HumanSystemsView,
};
export const menstrualCycleProp: PropModule = {
  def: asAnyProp(menstrualCycle),
  View: MenstrualCycleView,
};
export const contraceptionChartProp: PropModule = {
  def: asAnyProp(contraceptionChart),
  View: ContraceptionChartView,
};
export const reproductionSceneProp: PropModule = {
  def: asAnyProp(reproductionScene),
  View: ReproductionSceneView,
};

/** Every reproduction prop, for the library. */
export const reproductionProps: readonly PropModule[] = [
  dnaCopyProp,
  asexualModesProp,
  plantPropagationProp,
  germCellsProp,
  flowerProp,
  seedGerminationProp,
  humanSystemsProp,
  menstrualCycleProp,
  contraceptionChartProp,
  reproductionSceneProp,
];
