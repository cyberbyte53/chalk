import { SymbolButton } from "@chalk/draw";
import { groupView, useDrags } from "@chalk/player";
import { type FramePixels, does, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { drawing } from "./layer-view";
import { plane } from "./plane";
import {
  AxesDraw,
  GridDraw,
  NamedPointsDraw,
  PART_WORDS,
  PartTaps,
  type PlaneView,
  SceneDraw,
  canNameParts,
} from "./plane-view";
import { WORDS, pair, word } from "./words";

import { cluesDrawing } from "./clues-view";
import { coordinatePlane } from "./coordinate-plane";
import { diceDrawing } from "./dice-view";
import { placesDrawing } from "./places-view";
import { plottingDrawing } from "./plotting-view";
import { readingDrawing } from "./reading-view";
import { walkerDrawing } from "./walker-view";

/**
 * The vertical number line's zero, a handle the learner slides; let go where the two zeroes meet
 * and the lines are the axes.
 */
function ApartHandle({ s, px }: { s: PlaneView; px: FramePixels }): JSX.Element | null {
  const drag = useDrags();
  if (s.axes !== "both" || s.isCrossed === true) return null;
  const [x, y] = px.toPx(s.apart.x, s.apart.y);
  const w = s.window;
  return (
    <circle
      class="cp-apart"
      {...drag({
        axis: "xy",
        at: s.apart,
        place: (to) => ({
          x: Math.min(w.xMax, Math.max(w.xMin, Math.round(to.x))),
          y: Math.min(w.yMax, Math.max(w.yMin, Math.round(to.y))),
        }),
        move: plane.actions.moveApart,
        step: 1,
        words: pair(s.apart),
      })}
      cx={x}
      cy={y}
      r={9}
    />
  );
}

/** The plane's own drawing: its scene and grid behind, its lines and numbers, its named points. */
export const planeDrawing = drawing(plane, {
  back: ({ s, px, locale }) => (
    <>
      <SceneDraw s={s} px={px} locale={locale} />
      <GridDraw s={s} px={px} />
    </>
  ),
  on: ({ s, px, locale }) => (
    <>
      {canNameParts(s) && s.isAlone && <PartTaps s={s} px={px} />}
      <AxesDraw s={s} px={px} locale={locale} canLight={s.canTapNumbers} />
      <ApartHandle s={s} px={px} />
    </>
  ),
  // Over Riya, so the mark she has just made stays in view.
  front: ({ s, px }) => <NamedPointsDraw s={s} px={px} />,
  below: ({ s, locale }) =>
    s.named === null || !(canNameParts(s) && s.isAlone) ? null : (
      <p class="cp-line" {...shows("named", s.named, PART_WORDS[s.named][locale])}>
        {PART_WORDS[s.named][locale]}
      </p>
    ),
  controls: ({ s, locale }) => {
    const isNaming = canNameParts(s) && s.isAlone;
    const unshown = s.canShowPoints && s.points.some((pt) => !pt.isShown);
    return (
      <>
        {!(s.isCrossed === true) && s.axes === "both" && (
          <SymbolButton
            symbol={word(WORDS.bringTogether, locale)}
            label={word(WORDS.bringTogether, locale)}
            isWide
            {...does(plane.actions.bringTogether)}
          />
        )}
        {isNaming && s.showDirections && s.quadrantsNamed < 4 && (
          <SymbolButton
            symbol={word(WORDS.nameQuadrants, locale)}
            label={word(WORDS.nameQuadrants, locale)}
            isWide
            {...does(plane.actions.numberQuadrants)}
          />
        )}
        {unshown && (
          <SymbolButton
            symbol={word(WORDS.nextPoint, locale)}
            label={word(WORDS.nextPoint, locale)}
            isWide
            {...does(plane.actions.showPoint)}
          />
        )}
      </>
    );
  },
});

/**
 * The coordinate plane: the plane and every part on it, each drawn in its places.
 */
export const CoordinatePlaneView = groupView(
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
