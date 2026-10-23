import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { biogasPlant } from "./biogas";
import { fission } from "./fission";
import { fuelCompare } from "./fuel";
import { oceanEnergy } from "./ocean";
import { powerPlant } from "./plant";
import { energyScene } from "./scene";
import { solarLab } from "./solar";
import { energySorter } from "./sorter";
import { windFarm } from "./wind";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-energy")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(fuelCompare),
  asAnyProp(powerPlant),
  asAnyProp(biogasPlant),
  asAnyProp(windFarm),
  asAnyProp(solarLab),
  asAnyProp(oceanEnergy),
  asAnyProp(fission),
  asAnyProp(energySorter),
  asAnyProp(energyScene),
];
