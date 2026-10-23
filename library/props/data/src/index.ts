import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { chanceRun } from "./chance-run";
import { ChanceRunView } from "./chance-run-view";
import { chanceScale } from "./chance-scale";
import { ChanceScaleView } from "./chance-scale-view";
import { meanTable } from "./mean-table";
import { MeanTableView } from "./mean-table-view";
import { medianTable } from "./median-table";
import { MedianTableView } from "./median-table-view";
import { modeChart } from "./mode-chart";
import { ModeChartView } from "./mode-chart-view";
import { ogive } from "./ogive";
import { OgiveView } from "./ogive-view";
import { outcomeSpace } from "./outcome-space";
import { OutcomeSpaceView } from "./outcome-space-view";
import { regionChance } from "./region-chance";
import { RegionChanceView } from "./region-chance-view";
import { dataScene } from "./scene";
import { DataSceneView } from "./scene-view";

export * from "./numbers";
export * from "./stats";
export * from "./chance";
export * from "./mean-table";
export * from "./mode-chart";
export * from "./median-table";
export * from "./ogive";
export * from "./chance-run";
export * from "./outcome-space";
export * from "./chance-scale";
export * from "./region-chance";
export * from "./scene";
export { MARBLE_FILL } from "./chance-pictures";
export {
  chanceRun as chanceRunDef,
  chanceScale as chanceScaleDef,
  dataScene as dataSceneDef,
  meanTable as meanTableDef,
  medianTable as medianTableDef,
  modeChart as modeChartDef,
  ogive as ogiveDef,
  outcomeSpace as outcomeSpaceDef,
  regionChance as regionChanceDef,
};

export const meanTableProp: PropModule = { def: asAnyProp(meanTable), View: MeanTableView };
export const modeChartProp: PropModule = { def: asAnyProp(modeChart), View: ModeChartView };
export const medianTableProp: PropModule = { def: asAnyProp(medianTable), View: MedianTableView };
export const ogiveProp: PropModule = { def: asAnyProp(ogive), View: OgiveView };
export const chanceRunProp: PropModule = { def: asAnyProp(chanceRun), View: ChanceRunView };
export const outcomeSpaceProp: PropModule = {
  def: asAnyProp(outcomeSpace),
  View: OutcomeSpaceView,
};
export const chanceScaleProp: PropModule = { def: asAnyProp(chanceScale), View: ChanceScaleView };
export const regionChanceProp: PropModule = {
  def: asAnyProp(regionChance),
  View: RegionChanceView,
};
export const dataSceneProp: PropModule = { def: asAnyProp(dataScene), View: DataSceneView };

/** Every prop in this package. */
export const dataProps: readonly PropModule[] = [
  meanTableProp,
  modeChartProp,
  medianTableProp,
  ogiveProp,
  chanceRunProp,
  outcomeSpaceProp,
  chanceScaleProp,
  regionChanceProp,
  dataSceneProp,
];
