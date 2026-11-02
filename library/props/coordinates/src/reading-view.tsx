import { SymbolButton } from "@chalk/draw";
import { type PropView, useDrags } from "@chalk/player";
import { type FramePixels, does, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { drawing } from "./layer-view";
import { QUADRANTS } from "./plane";
import { SIGNS, quadrantBox } from "./plane-view";
import { Reading, readIn, snapped } from "./reading";
import { reading } from "./reading";
import { WORDS, numTo, pairTo, word } from "./words";

type ReadingView = PropView<typeof reading>;
const actions = reading.actions;

/** A length's words: how far from its line, the dot's radius, and an estimate of a letter's width. */
const GAP = 6;
const DOT = 10;
const CHAR = 9;
/** A line of a length's words, high. */
const LINE = 18;

/**
 * Each quadrant the point has been in, its sign pattern under its name, (+, +) in I: filled in as
 * the point goes round, not given.
 */
function VisitedSigns({ s, px }: { s: ReadingView; px: FramePixels }): JSX.Element {
  return (
    <g class="cp-axes">
      {QUADRANTS.filter((q) => s.visited.includes(q)).map((q) => {
        const b = quadrantBox(s, q);
        const [cx, cy] = px.toPx((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2);
        return (
          <g key={q} class="cp-quadrant" {...shows(`signs${q}`, SIGNS[q], SIGNS[q])}>
            <text class="cp-signs" x={cx} y={cy + 20} text-anchor="middle">
              {SIGNS[q]}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** The point the learner drags, read off the axes as far as the board writes it. */
function ReadingDraw({ s, px }: { s: ReadingView; px: FramePixels }): JSX.Element | null {
  const drag = useDrags();
  const p = s.point;
  if (p === null) return null;
  // The point stays where it is on the sheet; what is read off is read in the axes as they are
  // (moved and turned on a board where the learner moves them): q, and the feet of its
  // perpendiculars, on each axis.
  const q = readIn(s, p);
  const a = (s.turn * Math.PI) / 180;
  const [c, sn] = [Math.cos(a), Math.sin(a)];
  const [x, y] = px.toPx(p.x, p.y);
  const [ax, base] = px.toPx(s.shift.x + q.x * c, s.shift.y + q.x * sn);
  const [vx, ay] = px.toPx(s.shift.x - q.y * sn, s.shift.y + q.y * c);
  const num = (v: number) => numTo(v, s.decimals);
  const stage = s.reading;
  const isHidden = s.isReadingHidden;
  const hasLines = stage !== Reading.None && !isHidden;
  const hasLengths = (stage === Reading.Distances || stage === Reading.Abscissa) && !isHidden;
  const signed = stage === Reading.Abscissa;
  const unit = s.unit === "" ? "" : `\u00a0${s.unit}`;
  const xWords = signed ? `x = ${num(q.x)}${unit}` : `${num(Math.abs(q.x))}${unit}`;
  const yWords = signed ? `y = ${num(q.y)}${unit}` : `${num(Math.abs(q.y))}${unit}`;
  // Where a length's words go so nothing is cut off by the frame or sits under the dot (the words'
  // width estimated from their letters: the frame is drawn before any text can be measured).
  const wide = (text: string) => text.length * CHAR;
  const isRightTight = ax + GAP + wide(yWords) > px.width;
  const isAcrossShort = Math.abs(x - vx) - 2 * DOT < wide(xWords);
  const isUpShort = Math.abs(base - y) - 2 * DOT < LINE;
  // Below the x-axis, words go below the point: the x-axis's numbers are drawn under the axis, so
  // words between the point and the axis would sit on them.
  const isBelow = q.y < 0;
  const away = isBelow ? 1 : -1;
  // Across words past the dot, when their line can't hold them: to its right, or its left by the
  // frame's right edge. Up words too short for their line go over the dot, where nothing is
  // drawn: clear of both lines and the edges' numbers, inside the frame.
  const pastX = isRightTight ? x - DOT - GAP : x + DOT + GAP;
  const pastAnchor = isRightTight ? "end" : "start";
  const upWide = wide(yWords);
  const upAt =
    isUpShort || isBelow
      ? {
          x: Math.min(Math.max(x, upWide / 2 + DOT), px.width - upWide / 2 - DOT),
          y: y + away * (DOT + LINE / 2 + (isAcrossShort ? LINE : 0)),
          anchor: "middle",
        }
      : { x: isRightTight ? ax - GAP : ax + GAP, y: (y + base) / 2, anchor: pastAnchor };
  // The pair goes on the side of the point away from both axes, along the axes' own directions
  // (up and right in quadrant I, turned with them when they are turned): clear of their lines and
  // numbers. Mirrored across the point where the frame's edge would cut it.
  const pairWide = wide(pairTo(q, s.decimals));
  const pairAt = (() => {
    const [sx, sy] = [q.x < 0 ? -1 : 1, q.y < 0 ? -1 : 1];
    const [dx, dy] = [sx * 0.6 * c - sy * sn, sx * 0.6 * sn + sy * c];
    const len = Math.hypot(dx, dy);
    let [ux, uy] = [dx / len, -dy / len];
    const reach = 18;
    const overRight = ux > 0.3 && x + ux * reach + pairWide > px.width;
    const overLeft = ux < -0.3 && x + ux * reach - pairWide < 0;
    if (overRight || overLeft) ux = -ux;
    return {
      x: x + ux * reach,
      y: y + uy * reach,
      anchor: ux > 0.3 ? "start" : ux < -0.3 ? "end" : "middle",
      baseline: uy > 0.3 ? "hanging" : uy < -0.3 ? "auto" : "central",
    };
  })();
  const words = isHidden
    ? "?"
    : stage === Reading.Pair
      ? pairTo(q, s.decimals)
      : hasLengths
        ? `${xWords}, ${yWords}`
        : "";
  return (
    <g class="cp-reading">
      {s.showsVisitedSigns && <VisitedSigns s={s} px={px} />}
      {hasLines && (
        <>
          <line class="cp-drop" x1={x} y1={y} x2={ax} y2={base} />
          <line class="cp-drop" x1={x} y1={y} x2={vx} y2={ay} />
        </>
      )}
      {hasLengths && q.y !== 0 && (
        <text
          class="cp-length"
          // Beside the line, on the side with room for it inside the frame; over the dot when the
          // line is too short to hold it.
          x={upAt.x}
          y={upAt.y}
          dominant-baseline="central"
          text-anchor={upAt.anchor}
        >
          {yWords}
        </text>
      )}
      {hasLengths && q.x !== 0 && (
        <text
          class="cp-length"
          // Over the line's middle; past the dot when the line is too short to hold it.
          x={isAcrossShort ? pastX : (x + vx) / 2}
          y={isBelow ? ay + 8 : ay - 8}
          dominant-baseline={isBelow ? "hanging" : "auto"}
          text-anchor={isAcrossShort ? pastAnchor : "middle"}
        >
          {xWords}
        </text>
      )}
      <g {...shows("point", isHidden ? null : q, words === "" ? undefined : words)}>
        <circle
          class="cp-point"
          {...drag({
            axis: "xy",
            at: p,
            place: (to) => snapped(s, to),
            move: actions.movePoint,
            step: s.pointStep,
            words: isHidden ? "?" : pairTo(q, s.decimals),
          })}
          cx={x}
          cy={y}
          r={DOT}
        />
        {/* A point that stays has its pair written under the plane instead (below). */}
        {(stage === Reading.Pair || isHidden) && s.canMovePoint && (
          <text
            class="cp-pair"
            x={pairAt.x}
            text-anchor={pairAt.anchor}
            y={pairAt.y}
            dominant-baseline={pairAt.baseline}
          >
            {words}
          </text>
        )}
      </g>
    </g>
  );
}

/** The reading layer's drawing: the point read off the axes, and Show when it is hidden. */
export const readingDrawing = drawing(reading, {
  front: ({ s, px }) => <ReadingDraw s={s} px={px} />,
  // A point that stays while the axes move under it: its pair in one place, under the plane, not
  // beside the point, where the moving axes would keep crossing it.
  below: ({ s, locale }) => {
    if (s.point === null || s.canMovePoint || s.reading !== Reading.Pair || s.isReadingHidden)
      return null;
    const words = `${word(WORDS.thePoint, locale)}: ${pairTo(readIn(s, s.point), s.decimals)}`;
    return (
      <p class="cp-line" {...shows("pair", pairTo(readIn(s, s.point), s.decimals), words)}>
        <strong>{word(WORDS.thePoint, locale)}</strong>: {pairTo(readIn(s, s.point), s.decimals)}
      </p>
    );
  },
  controls: ({ s, locale }) =>
    !s.isReadingHidden ? null : (
      <SymbolButton
        symbol={word(WORDS.show, locale)}
        label={word(WORDS.show, locale)}
        isWide
        {...does(actions.showReading)}
      />
    ),
});
