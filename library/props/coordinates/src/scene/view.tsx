import { groupView } from "@chalk/player";
import { cluesDrawing } from "../clues-view";
import { diceDrawing } from "../dice-view";
import { placesDrawing } from "../places-view";
import { plottingDrawing } from "../plotting-view";
import { readingDrawing } from "../reading-view";
import { planeDrawing } from "../view";
import { walkerDrawing } from "../walker-view";
import { coordinatePlane } from "./coordinate-plane";

/**
 * The coordinate plane on the event model, drawn by the same drawings as today's: each part keeps
 * its variables', facts' and actions' names, so every drawing reads and does what it did.
 */
export const SceneCoordinatePlaneView = groupView(
  coordinatePlane,
  {
    plane: planeDrawing,
    reading: readingDrawing,
    places: placesDrawing,
    walker: walkerDrawing,
    clues: cluesDrawing,
    plotting: plottingDrawing,
    dice: diceDrawing,
  },
  { look: () => "cp-frame" },
);
