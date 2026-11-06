import { type PropPack, lazyRegistry } from "@chalk/player";
import type { AnyProp } from "@chalk/prop";
import { basicProps } from "@chalk/prop-basics";
import { defs as basicsDefs } from "@chalk/prop-basics/defs";
import { defs as chemistryDefs, sounds as chemistrySounds } from "@chalk/prop-chemistry/defs";
import { defs as classroomDefs, sounds as classroomSounds } from "@chalk/prop-classroom/defs";
import { defs as coordinatesDefs, sounds as coordinatesSounds } from "@chalk/prop-coordinates/defs";
import { defs as heredityDefs, sounds as hereditySounds } from "@chalk/prop-heredity/defs";
import { defs as lightDefs, sounds as lightSounds } from "@chalk/prop-light/defs";

/**
 * Every prop package, by what the app needs when: its definitions up front (small; boards and
 * checks run on them), its drawing code when a chapter that uses it opens. The basics (text and
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
  {
    name: "light",
    defs: lightDefs,
    sounds: lightSounds,
    load: () => import("@chalk/prop-light"),
  },
  {
    name: "chemistry",
    defs: chemistryDefs,
    sounds: chemistrySounds,
    load: () => import("@chalk/prop-chemistry"),
  },
  {
    name: "heredity",
    defs: heredityDefs,
    sounds: hereditySounds,
    load: () => import("@chalk/prop-heredity"),
  },
  {
    name: "classroom",
    defs: classroomDefs,
    sounds: classroomSounds,
    load: () => import("@chalk/prop-classroom"),
  },
];

const lazy = lazyRegistry(packs, basicProps);

/** Every prop type a lesson can place, by type; a prop's view loads with its package. */
export const propLibrary = lazy.registry;

/** Load the drawing code for these prop types now (a chapter's, while its lessons download). */
export const preloadProps = lazy.preload;

/** Every prop package by folder name under library/props, with its definitions (for the catalogue). */
export const propPackages: ReadonlyMap<string, readonly AnyProp[]> = new Map([
  ["basics", basicsDefs],
  ...packs.map((pack) => [pack.name, pack.defs] as const),
]);

/** Just the definitions, for tools that only need the contract. */
export const propDefs: Readonly<Record<string, AnyProp>> = {
  ...Object.fromEntries(basicProps.map((module) => [module.def.type, module.def])),
  ...Object.fromEntries(packs.flatMap((pack) => pack.defs.map((def) => [def.type, def]))),
};
