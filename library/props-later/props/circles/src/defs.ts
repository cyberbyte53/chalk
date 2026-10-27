import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { circleArea } from "./circle-area";
import { combinedFigures } from "./combined";
import { construction } from "./construction";
import { geoFigure } from "./figure";
import { lineAndCircle } from "./line-circle";
import { circlesScene } from "./scene";
import { sectorSegment } from "./sector";
import { tangentsFromPoint } from "./tangents";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-circles")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(lineAndCircle),
  asAnyProp(tangentsFromPoint),
  asAnyProp(construction),
  asAnyProp(circleArea),
  asAnyProp(sectorSegment),
  asAnyProp(combinedFigures),
  asAnyProp(circlesScene),
  asAnyProp(geoFigure),
];
