import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { biogasPlant } from "./biogas";
import { BiogasView } from "./biogas-view";
import { fission } from "./fission";
import { FissionView } from "./fission-view";
import { fuelCompare } from "./fuel";
import { FuelView } from "./fuel-view";
import { oceanEnergy } from "./ocean";
import { OceanView } from "./ocean-view";
import { powerPlant } from "./plant";
import { PlantView } from "./plant-view";
import { energyScene } from "./scene";
import { EnergySceneView } from "./scene-view";
import { solarLab } from "./solar";
import { SolarView } from "./solar-view";
import { energySorter } from "./sorter";
import { SorterView } from "./sorter-view";
import { windFarm } from "./wind";
import { WindView } from "./wind-view";

export {
  CHECKS,
  Check,
  FUELS,
  FUEL_FACTS,
  Fuel,
  FuelAction,
  FuelDerived,
  FuelPart,
  FuelSignal,
  type FuelState,
  HIGH_HEAT,
  Place,
  Smoke,
  checksOf,
  describeFuels,
  fuelCompare as fuelCompareDef,
  hottestOf,
  passedOf,
} from "./fuel";
export {
  MAX_LEVEL,
  PlantAction,
  PlantDerived,
  PlantKind,
  PlantPart,
  PlantSignal,
  type PlantState,
  RENEWABLE,
  STAGES,
  type Stage,
  describePlant,
  formsOf,
  outputOf as plantOutputOf,
  powerPlant as powerPlantDef,
} from "./plant";
export {
  BIOGAS_STEPS,
  BiogasAction,
  BiogasDerived,
  BiogasPart,
  BiogasSignal,
  type BiogasState,
  GASES,
  LAST_STEP as BIOGAS_LAST_STEP,
  biogasPlant as biogasPlantDef,
  describeBiogas,
  gasOf,
} from "./biogas";
export {
  CUT_IN,
  FULL_SPEED,
  HECTARES_PER_MW,
  MAX_MILLS,
  MAX_SPEED,
  MW_PER_MILL,
  SPEED_STEP,
  Supply,
  WindAction,
  WindDerived,
  WindPart,
  WindSignal,
  type WindState,
  describeWind,
  isTurningAt,
  landOf,
  outputOf as windOutputOf,
  perMillOf,
  supplyOf,
  windFarm as windFarmDef,
} from "./wind";
export {
  COOKS_AT,
  CookerPart,
  MAX_CELLS,
  MAX_MINUTES,
  MINUTES_STEP,
  START_C,
  SUN,
  Sky,
  SolarAction,
  SolarDerived,
  SolarMode,
  SolarPart,
  SolarSignal,
  type SolarState,
  VOLTS_PER_CELL,
  WATTS_PER_CELL,
  ceilingOf,
  cookerTempOf,
  describeSolar,
  flaskTemps,
  solarLab as solarLabDef,
  voltsOf,
  warmTo,
  wattsOf,
} from "./solar";
export {
  Flow,
  Level,
  MAX_WAVE,
  MIN_DIFFERENCE,
  OceanAction,
  OceanDerived,
  OceanKind,
  OceanPart,
  OceanSignal,
  type OceanState,
  describeOcean,
  differenceOf,
  flowOf,
  oceanEnergy as oceanEnergyDef,
  oceanOutputOf,
  worksOf,
} from "./ocean";
export {
  FissionAction,
  FissionDerived,
  FissionPart,
  FissionSignal,
  type FissionState,
  JOULES_PER_EV,
  MAX_GENERATION,
  MEV_PER_U,
  NEUTRONS_PER_FISSION,
  describeFission,
  fission as fissionDef,
  fissionsIn,
  mevOf,
  neutronsOut,
  totalFissions,
} from "./fission";
export {
  BIN_NAMES,
  Bin,
  RIGHT_BIN,
  SOURCES,
  SOURCE_NAMES,
  SortBy,
  SorterAction,
  SorterDerived,
  SorterPart,
  SorterSignal,
  type SorterState,
  Source,
  binOf,
  describeSorter,
  energySorter as energySorterDef,
  isAllPlacedOf,
  isAllRightOf,
  isRightPlace,
  rightOf,
  wrongOf,
} from "./sorter";
export {
  EnergyScene,
  EnergyScenePart,
  type EnergySceneState,
  SCENE_PICTURE as ENERGY_SCENE_PICTURE,
  describeEnergyScene,
  energyScene as energySceneDef,
} from "./scene";

export const fuelCompareProp: PropModule = { def: asAnyProp(fuelCompare), View: FuelView };
export const powerPlantProp: PropModule = { def: asAnyProp(powerPlant), View: PlantView };
export const biogasPlantProp: PropModule = { def: asAnyProp(biogasPlant), View: BiogasView };
export const windFarmProp: PropModule = { def: asAnyProp(windFarm), View: WindView };
export const solarLabProp: PropModule = { def: asAnyProp(solarLab), View: SolarView };
export const oceanEnergyProp: PropModule = { def: asAnyProp(oceanEnergy), View: OceanView };
export const fissionProp: PropModule = { def: asAnyProp(fission), View: FissionView };
export const energySorterProp: PropModule = { def: asAnyProp(energySorter), View: SorterView };
export const energySceneProp: PropModule = { def: asAnyProp(energyScene), View: EnergySceneView };

/** Every prop in this package. */
export const energyProps: readonly PropModule[] = [
  fuelCompareProp,
  powerPlantProp,
  biogasPlantProp,
  windFarmProp,
  solarLabProp,
  oceanEnergyProp,
  fissionProp,
  energySorterProp,
  energySceneProp,
];
