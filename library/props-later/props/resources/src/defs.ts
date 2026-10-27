import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { fiveRs } from "./five-rs";
import { fossilClock } from "./fossil";
import { riverHealth } from "./river";
import { resourcesScene } from "./scene";
import { stakeholders } from "./stakeholders";
import { waterHarvest } from "./water";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-resources")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(fiveRs),
  asAnyProp(riverHealth),
  asAnyProp(stakeholders),
  asAnyProp(waterHarvest),
  asAnyProp(fossilClock),
  asAnyProp(resourcesScene),
];
