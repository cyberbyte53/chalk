import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { coordinatePlane } from "./coordinate-plane";
import { coordinatesScene } from "./scene";
import { sectionDivider } from "./section-divider";
import { triangleArea } from "./triangle-area";

/** The package's prop definitions, loaded up front; the views load with the chapter. */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(coordinatePlane),
  asAnyProp(sectionDivider),
  asAnyProp(triangleArea),
  asAnyProp(coordinatesScene),
];
