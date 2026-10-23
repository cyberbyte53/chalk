import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { magneticField } from "./field-prop";
import { generator } from "./generator";
import { induction } from "./induction";
import { motor } from "./motor";
import { forceOnRod } from "./rod";
import { handRule } from "./rule";
import { magnetismScene } from "./scene";
import { homeWiring } from "./wiring";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-magnetism")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(magneticField),
  asAnyProp(handRule),
  asAnyProp(forceOnRod),
  asAnyProp(motor),
  asAnyProp(induction),
  asAnyProp(generator),
  asAnyProp(homeWiring),
  asAnyProp(magnetismScene),
];
