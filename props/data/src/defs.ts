import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { chanceRun } from "./chance-run";
import { chanceScale } from "./chance-scale";
import { meanTable } from "./mean-table";
import { medianTable } from "./median-table";
import { modeChart } from "./mode-chart";
import { ogive } from "./ogive";
import { outcomeSpace } from "./outcome-space";
import { regionChance } from "./region-chance";
import { dataScene } from "./scene";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-data")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(meanTable),
  asAnyProp(modeChart),
  asAnyProp(medianTable),
  asAnyProp(ogive),
  asAnyProp(chanceRun),
  asAnyProp(outcomeSpace),
  asAnyProp(chanceScale),
  asAnyProp(regionChance),
  asAnyProp(dataScene),
];
