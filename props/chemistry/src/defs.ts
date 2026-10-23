import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { acidBench } from "./acid-bench";
import { conductivityTester } from "./acid-conduct";
import { acidIndicator } from "./acid-indicator";
import { neutraliser } from "./acid-neutralise";
import { acidsScene } from "./acid-scene";
import { equationBalancer } from "./balancer";
import { reactionBench } from "./bench";
import { electrolysisCell } from "./electrolysis";
import { extractionFlow } from "./extraction-flow";
import { refiningCell } from "./extraction-refining";
import { thermitWeld } from "./extraction-thermit";
import { ionicBond } from "./ionic-bond";
import { ionicTester } from "./ionic-tester";
import { goldCarat } from "./metal-carat";
import { propertyTester } from "./metal-properties";
import { reactivityLab } from "./metal-reactivity";
import { rustLab } from "./metal-rust";
import { metalScene } from "./metal-scene";
import { particleSwap } from "./particles";
import { phScale } from "./ph-scale";
import { saltFactory } from "./salt-factory";
import { saltFamily } from "./salt-family";
import { chemistryScene } from "./scene";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-chemistry")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(acidIndicator),
  asAnyProp(phScale),
  asAnyProp(neutraliser),
  asAnyProp(acidBench),
  asAnyProp(conductivityTester),
  asAnyProp(saltFamily),
  asAnyProp(saltFactory),
  asAnyProp(acidsScene),
  asAnyProp(equationBalancer),
  asAnyProp(reactionBench),
  asAnyProp(electrolysisCell),
  asAnyProp(particleSwap),
  asAnyProp(chemistryScene),
  asAnyProp(propertyTester),
  asAnyProp(reactivityLab),
  asAnyProp(ionicBond),
  asAnyProp(ionicTester),
  asAnyProp(extractionFlow),
  asAnyProp(thermitWeld),
  asAnyProp(refiningCell),
  asAnyProp(rustLab),
  asAnyProp(goldCarat),
  asAnyProp(metalScene),
];
