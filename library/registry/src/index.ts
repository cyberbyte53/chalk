import { type PropPack, lazyRegistry } from "@chalk/player";
import { type AnyPropDef, BOARD, asAnyProp, boardProp } from "@chalk/prop";
import { basicProps } from "@chalk/prop-basics";
import { defs as basicsDefs } from "@chalk/prop-basics/defs";
import { defs as coordinatesDefs, sounds as coordinatesSounds } from "@chalk/prop-coordinates/defs";
import { defs as decimalDefs } from "@chalk/prop-decimal/defs";
import { defs as primesDefs } from "@chalk/prop-primes/defs";

/**
 * Every prop package, by what the app needs when: its definitions up front (small; boards, checks
 * and Jugnu run on them), its drawing code when a chapter that uses it opens. The basics (text and
 * questions) are on every page, so they come with the app. Adding a prop package =
 * one line here, its `defs.ts`, and its styles.
 */
const packs: readonly (PropPack & { name: string })[] = [
  {
    name: "coordinates",
    defs: coordinatesDefs,
    sounds: coordinatesSounds,
    load: () => import("@chalk/prop-coordinates"),
  },
  { name: "decimal", defs: decimalDefs, load: () => import("@chalk/prop-decimal") },
  { name: "primes", defs: primesDefs, load: () => import("@chalk/prop-primes") },
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
