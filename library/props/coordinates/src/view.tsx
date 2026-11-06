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
  PartTaps,
  type PlaneView,
  QuadrantNumerals,
  QuadrantTints,
  SceneDraw,
  canNameParts,
  partWords,
} from "./plane-view";
import { WORDS, pair, word } from "./words";

import { cluesDrawing } from "./clues-view";
import { coordinatePlane } from "./coordinate-plane";
import { crowdDrawing } from "./crowd-view";
import { diceDrawing } from "./dice-view";
import { parabolaDrawing } from "./parabola-view";
import { placesDrawing } from "./places-view";
import { plottingDrawing } from "./plotting-view";
import { readingDrawing } from "./reading-view";
import { walkerDrawing } from "./walker-view";

/**
 * The lines turned about the horizontal line's zero (a pair at right angles, any way round), and
 * moved so they cross at `shift` on the sheet: the axes, moved over a sheet that stays.
 */
const turned = (s: PlaneView, px: FramePixels): string | undefined => {
  if (s.turn === 0 && s.shift.x === 0 && s.shift.y === 0) return undefined;
  const [ox, oy] = px.toPx(0, 0);
  const [sx, sy] = px.toPx(s.shift.x, s.shift.y);
  return `translate(${sx - ox} ${sy - oy}) rotate(${-s.turn} ${ox} ${oy})`;
};

/**
 * The axes a learner moves are drawn long enough to cross the whole sheet wherever O is and
 * however they are turned (the frame cuts them at its edges): the window, grown by its diagonal.
 */
const axesOf = (s: PlaneView): PlaneView => {
  if (!s.canMoveAxes) return s;
  const w = s.window;
  const d = Math.ceil(Math.hypot(w.xMax - w.xMin, w.yMax - w.yMin));
  return {
    ...s,
    window: { xMin: w.xMin - d, xMax: w.xMax + d, yMin: w.yMin - d, yMax: w.yMax + d },
  };
};

/**
 * On axes the learner moves, a mark is drawn only where it lands on the sheet (a half unit in from
 * its edge): the lines run on past it, their numbers don't.
 */
const onSheet =
  (s: PlaneView) =>
  (axis: "x" | "y", v: number): boolean => {
    if (!s.canMoveAxes) return true;
    const a = (s.turn * Math.PI) / 180;
    const [c, sn] = [Math.cos(a), Math.sin(a)];
    const [dx, dy] = axis === "x" ? [v * c, v * sn] : [-v * sn, v * c];
    const w = s.window;
    const [x, y] = [s.shift.x + dx, s.shift.y + dy];
    return x >= w.xMin + 0.5 && x <= w.xMax - 0.5 && y >= w.yMin + 0.5 && y <= w.yMax - 0.5;
  };

/**
 * How far along OX the turning handle sits from O, in units: between marks, and nearer O than a
 * board's point usually is, so turning sweeps it clear of the point and its name.
 */
const HANDLE_AT = 2.5;

/**
 * The learner moves the axes: O, dragged anywhere on the sheet (to the half unit); and a handle
 * along OX, dragged round O to turn them.
 */
function AxesHandles({ s, px }: { s: PlaneView; px: FramePixels }): JSX.Element | null {
  const drag = useDrags();
  if (!s.canMoveAxes) return null;
  const w = s.window;
  const a = (s.turn * Math.PI) / 180;
  const handle = { x: s.shift.x + HANDLE_AT * Math.cos(a), y: s.shift.y + HANDLE_AT * Math.sin(a) };
  const [ox, oy] = px.toPx(s.shift.x, s.shift.y);
  const [hx, hy] = px.toPx(handle.x, handle.y);
  const half = (v: number, lo: number, hi: number) =>
    Math.min(hi, Math.max(lo, Math.round(v * 2) / 2));
  return (
    <g class="cp-axes-handles">
      <line class="cp-turn-arm" x1={ox} y1={oy} x2={hx} y2={hy} />
      <circle
        class="cp-apart"
        {...drag({
          axis: "xy",
          at: s.shift,
          place: (to) => ({ x: half(to.x, w.xMin, w.xMax), y: half(to.y, w.yMin, w.yMax) }),
          move: plane.actions.moveAxes,
          step: 0.5,
          words: pair(s.shift),
        })}
        cx={ox}
        cy={oy}
        r={10}
      />
      <circle
        class="cp-turn-handle"
        {...drag({
          axis: "xy",
          at: handle,
          move: plane.actions.turnAxes,
          step: 0.5,
          words: `${s.turn}°`,
        })}
        cx={hx}
        cy={hy}
        r={12}
      />
      {/* Turning, not a point: a ring with a turning arrow. */}
      <text class="cp-turn-glyph" x={hx} y={hy} text-anchor="middle" dominant-baseline="central">
        ↻
      </text>
      {/* Which line is which, however they are turned: x by the handle on OX, y as far along OY. */}
      {(
        [
          [
            "x",
            HANDLE_AT * Math.cos(a) - 0.7 * Math.sin(a),
            HANDLE_AT * Math.sin(a) + 0.7 * Math.cos(a),
          ],
          [
            "y",
            -HANDLE_AT * Math.sin(a) + 0.5 * Math.cos(a),
            HANDLE_AT * Math.cos(a) + 0.5 * Math.sin(a),
          ],
        ] as const
      ).map(([name, dx, dy]) => {
        const [nx, ny] = px.toPx(s.shift.x + dx, s.shift.y + dy);
        return (
          <text
            key={name}
            class="cp-axis-name"
            x={nx}
            y={ny}
            text-anchor="middle"
            dominant-baseline="central"
          >
            {name}
          </text>
        );
      })}
    </g>
  );
}

/**
 * Where the zero may rest while apart: halfway between marks, so no number of one line lies on the
 * other or on its row of numbers; or 0, where the lines become the axes.
 */
const offMarks = (v: number): number => (Math.abs(v) < 0.5 ? 0 : Math.round(v - 0.5) + 0.5);

/**
 * The vertical number line's zero, a handle the learner slides; let go where the two zeroes meet
 * and the lines are the axes.
 */
function ApartHandle({ s, px }: { s: PlaneView; px: FramePixels }): JSX.Element | null {
  const drag = useDrags();
  // Not while the pair is still turning upright: the zeroes are brought together upright.
  if (s.axes !== "both" || s.isCrossed === true || s.turn !== 0) return null;
  const [x, y] = px.toPx(s.apart.x, s.apart.y);
  const w = s.window;
  return (
    <circle
      class="cp-apart"
      {...drag({
        axis: "xy",
        at: s.apart,
        place: (to) => ({
          x: Math.min(w.xMax, Math.max(w.xMin, offMarks(to.x))),
          y: Math.min(w.yMax, Math.max(w.yMin, offMarks(to.y))),
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
      <QuadrantTints s={s} px={px} />
      {/* The scene shows as strongly as the lesson has faded it in. */}
      <g opacity={s.backdrop}>
        <SceneDraw s={s} px={px} locale={locale} />
      </g>
      <GridDraw s={s} px={px} />
    </>
  ),
  on: ({ s, px, locale }) => {
    return (
      <>
        {canNameParts(s) && s.isAlone && <PartTaps s={s} px={px} />}
        <g transform={turned(s, px)}>
          <AxesDraw
            s={axesOf(s)}
            px={px}
            locale={locale}
            canLight={s.canTapNumbers}
            layer="lines"
            isMarkShown={onSheet(s)}
          />
          <ApartHandle s={s} px={px} />
        </g>
        <AxesHandles s={s} px={px} />
      </>
    );
  },
  // Over Riya, so the mark she has just made stays in view.
  // The lines' numbers and names over everything placed on the plane (a town's houses, Riya).
  front: ({ s, px, locale }) => (
    <>
      <g transform={turned(s, px)}>
        <AxesDraw
          s={axesOf(s)}
          px={px}
          locale={locale}
          canLight={s.canTapNumbers}
          layer="labels"
          isMarkShown={onSheet(s)}
        />
      </g>
      <QuadrantNumerals s={s} px={px} />
      <NamedPointsDraw s={s} px={px} />
    </>
  ),
  below: ({ s, locale }) =>
    s.named === null || !s.namesTapped || !(canNameParts(s) && s.isAlone) ? null : (
      <p class="cp-line" {...shows("named", s.named, partWords(s, s.named, locale))}>
        {partWords(s, s.named, locale)}
      </p>
    ),
  controls: ({ s, locale }) => {
    const isNaming = canNameParts(s) && s.isAlone;
    const unshown = s.canShowPoints && s.points.some((pt) => !pt.isShown);
    return (
      <>
        {!(s.isCrossed === true) && s.axes === "both" && s.turn === 0 && (
          <SymbolButton
            symbol={word(WORDS.bringTogether, locale)}
            label={word(WORDS.bringTogether, locale)}
            isWide
            {...does(plane.actions.bringTogether)}
          />
        )}
        {isNaming && s.canNumberQuadrants && s.quadrantsNamed < 4 && (
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
    crowd: crowdDrawing,
    parabola: parabolaDrawing,
  },
  { look: () => "cp-frame" },
);
