import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { allotropes } from "./allotropes";
import { carbonChain } from "./chain";
import { covalentBond } from "./covalent";
import { carbonLab } from "./lab";
import { carbonScene } from "./scene";
import { homologousSeries } from "./series";
import { soapAction } from "./soap";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-carbon")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(covalentBond),
  asAnyProp(carbonChain),
  asAnyProp(homologousSeries),
  asAnyProp(allotropes),
  asAnyProp(carbonLab),
  asAnyProp(soapAction),
  asAnyProp(carbonScene),
];
