import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { clinometer } from "./clinometer";
import { heightFinder } from "./heights";
import { unitIdentity } from "./identity";
import { trigRatios } from "./ratios";
import { trigScene } from "./scene";
import { specialAngles } from "./special";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-trigonometry")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(trigRatios),
  asAnyProp(specialAngles),
  asAnyProp(unitIdentity),
  asAnyProp(heightFinder),
  asAnyProp(clinometer),
  asAnyProp(trigScene),
];
