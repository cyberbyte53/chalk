import { type PropPack, lazyRegistry } from "@chalk/player";
import { type AnyPropDef, BOARD, asAnyProp, boardProp } from "@chalk/prop";
import { defs as apDefs } from "@chalk/prop-ap/defs";
import { basicProps } from "@chalk/prop-basics";
import { defs as basicsDefs } from "@chalk/prop-basics/defs";
import { defs as carbonDefs } from "@chalk/prop-carbon/defs";
import { defs as chanceDefs } from "@chalk/prop-chance/defs";
import { defs as chemistryDefs } from "@chalk/prop-chemistry/defs";
import { defs as circlesDefs } from "@chalk/prop-circles/defs";
import { defs as circuitDefs } from "@chalk/prop-circuit/defs";
import { defs as collisionDefs } from "@chalk/prop-collision/defs";
import { defs as controlDefs } from "@chalk/prop-control/defs";
import { defs as coordinatesDefs } from "@chalk/prop-coordinates/defs";
import { defs as dataDefs } from "@chalk/prop-data/defs";
import { defs as decimalDefs } from "@chalk/prop-decimal/defs";
import { defs as electricityDefs } from "@chalk/prop-electricity/defs";
import { defs as energyDefs } from "@chalk/prop-energy/defs";
import { defs as environmentDefs } from "@chalk/prop-environment/defs";
import { defs as exponentsDefs } from "@chalk/prop-exponents/defs";
import { defs as eyeDefs } from "@chalk/prop-eye/defs";
import { defs as gasDefs } from "@chalk/prop-gas/defs";
import { defs as heredityDefs } from "@chalk/prop-heredity/defs";
import { defs as lifeDefs } from "@chalk/prop-life/defs";
import { defs as lightDefs } from "@chalk/prop-light/defs";
import { defs as linearEquationsDefs } from "@chalk/prop-linear-equations/defs";
import { defs as magnetismDefs } from "@chalk/prop-magnetism/defs";
import { defs as numberLineDefs } from "@chalk/prop-number-line/defs";
import { defs as numberSetsDefs } from "@chalk/prop-number-sets/defs";
import { defs as periodicDefs } from "@chalk/prop-periodic/defs";
import { defs as plotDefs } from "@chalk/prop-plot/defs";
import { defs as polynomialsDefs } from "@chalk/prop-polynomials/defs";
import { defs as primesDefs } from "@chalk/prop-primes/defs";
import { defs as quadraticsDefs } from "@chalk/prop-quadratics/defs";
import { defs as reproductionDefs } from "@chalk/prop-reproduction/defs";
import { defs as resourcesDefs } from "@chalk/prop-resources/defs";
import { defs as rootsDefs } from "@chalk/prop-roots/defs";
import { defs as solidsDefs } from "@chalk/prop-solids/defs";
import { defs as surdsDefs } from "@chalk/prop-surds/defs";
import { defs as trianglesDefs } from "@chalk/prop-triangles/defs";
import { defs as trigonometryDefs } from "@chalk/prop-trigonometry/defs";

/**
 * Every prop package, by what the app needs when: its definitions up front (small; boards, checks
 * and Jugnu run on them), its drawing code when a chapter that uses it opens. The basics (text,
 * choices, buttons, goals) are on every page, so they come with the app. Adding a prop package =
 * one line here, its `defs.ts`, and its styles.
 */
const packs: readonly (PropPack & { name: string })[] = [
  { name: "coordinates", defs: coordinatesDefs, load: () => import("@chalk/prop-coordinates") },
  { name: "solids", defs: solidsDefs, load: () => import("@chalk/prop-solids") },
  { name: "data", defs: dataDefs, load: () => import("@chalk/prop-data") },
  { name: "circles", defs: circlesDefs, load: () => import("@chalk/prop-circles") },
  { name: "trigonometry", defs: trigonometryDefs, load: () => import("@chalk/prop-trigonometry") },
  { name: "resources", defs: resourcesDefs, load: () => import("@chalk/prop-resources") },
  { name: "triangles", defs: trianglesDefs, load: () => import("@chalk/prop-triangles") },
  { name: "energy", defs: energyDefs, load: () => import("@chalk/prop-energy") },
  { name: "environment", defs: environmentDefs, load: () => import("@chalk/prop-environment") },
  { name: "periodic", defs: periodicDefs, load: () => import("@chalk/prop-periodic") },
  { name: "reproduction", defs: reproductionDefs, load: () => import("@chalk/prop-reproduction") },
  { name: "magnetism", defs: magnetismDefs, load: () => import("@chalk/prop-magnetism") },
  { name: "carbon", defs: carbonDefs, load: () => import("@chalk/prop-carbon") },
  { name: "ap", defs: apDefs, load: () => import("@chalk/prop-ap") },
  { name: "chance", defs: chanceDefs, load: () => import("@chalk/prop-chance") },
  { name: "chemistry", defs: chemistryDefs, load: () => import("@chalk/prop-chemistry") },
  { name: "circuit", defs: circuitDefs, load: () => import("@chalk/prop-circuit") },
  { name: "collision", defs: collisionDefs, load: () => import("@chalk/prop-collision") },
  { name: "control", defs: controlDefs, load: () => import("@chalk/prop-control") },
  { name: "decimal", defs: decimalDefs, load: () => import("@chalk/prop-decimal") },
  { name: "electricity", defs: electricityDefs, load: () => import("@chalk/prop-electricity") },
  { name: "exponents", defs: exponentsDefs, load: () => import("@chalk/prop-exponents") },
  { name: "eye", defs: eyeDefs, load: () => import("@chalk/prop-eye") },
  { name: "gas", defs: gasDefs, load: () => import("@chalk/prop-gas") },
  { name: "heredity", defs: heredityDefs, load: () => import("@chalk/prop-heredity") },
  { name: "life", defs: lifeDefs, load: () => import("@chalk/prop-life") },
  { name: "light", defs: lightDefs, load: () => import("@chalk/prop-light") },
  {
    name: "linear-equations",
    defs: linearEquationsDefs,
    load: () => import("@chalk/prop-linear-equations"),
  },
  { name: "number-line", defs: numberLineDefs, load: () => import("@chalk/prop-number-line") },
  { name: "number-sets", defs: numberSetsDefs, load: () => import("@chalk/prop-number-sets") },
  { name: "plot", defs: plotDefs, load: () => import("@chalk/prop-plot") },
  { name: "polynomials", defs: polynomialsDefs, load: () => import("@chalk/prop-polynomials") },
  { name: "primes", defs: primesDefs, load: () => import("@chalk/prop-primes") },
  { name: "quadratics", defs: quadraticsDefs, load: () => import("@chalk/prop-quadratics") },
  { name: "roots", defs: rootsDefs, load: () => import("@chalk/prop-roots") },
  { name: "surds", defs: surdsDefs, load: () => import("@chalk/prop-surds") },
];

const lazy = lazyRegistry(packs, basicProps);

/** Every prop type a lesson can place, by type; a prop's view loads with its package. */
export const propLibrary = lazy.registry;

/** Load the drawing code for these prop types now (a chapter's, while its lessons download). */
export const preloadProps = lazy.preload;

/** Every prop package by folder name under library/props, with its definitions (for the catalogue). */
export const propPackages: ReadonlyMap<string, readonly AnyPropDef[]> = new Map([
  ["basics", basicsDefs],
  ...packs.map((pack) => [pack.name, pack.defs] as const),
]);

/** Just the definitions, plus the board itself, for tools that only need the contract (validator, Jugnu). */
export const propDefs: Readonly<Record<string, AnyPropDef>> = {
  ...Object.fromEntries(basicProps.map((module) => [module.def.type, module.def])),
  ...Object.fromEntries(packs.flatMap((pack) => pack.defs.map((def) => [def.type, def]))),
  [BOARD]: asAnyProp(boardProp),
};
