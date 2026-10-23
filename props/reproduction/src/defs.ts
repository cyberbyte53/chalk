import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { asexualModes } from "./asexual";
import { contraceptionChart } from "./contraception";
import { menstrualCycle } from "./cycle";
import { dnaCopy } from "./dna-copy";
import { flower } from "./flower";
import { germCells } from "./germ-cells";
import { seedGermination } from "./germination";
import { humanSystems } from "./human";
import { plantPropagation } from "./propagation";
import { reproductionScene } from "./scene";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter
 * (`import("@chalk/prop-reproduction")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(dnaCopy),
  asAnyProp(asexualModes),
  asAnyProp(plantPropagation),
  asAnyProp(germCells),
  asAnyProp(flower),
  asAnyProp(seedGermination),
  asAnyProp(humanSystems),
  asAnyProp(menstrualCycle),
  asAnyProp(contraceptionChart),
  asAnyProp(reproductionScene),
];
