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

/**
 * Whether the point's pair is written under the plane rather than beside the point: a point that
 * stays while the axes move under it, and a board filling in the quadrants' signs, whose names and
 * patterns the pair would cover wherever the point is dragged.
 */
const isPairBelow = (s: ReadingView) => !s.canMovePoint || s.showsVisitedSigns;

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
  const isAcrossShort = Math.abs(x - vx) - 2 * DOT < wide(xWords);
  const isUpShort = Math.abs(base - y) - 2 * DOT < LINE;
  // Each length beside its own line, on the side away from the axes and their numbers: x's along
  // the line to the y-axis, above it (below it under the x-axis); y's beside the line to the
  // x-axis, on its side away from the y-axis. A line too short to hold its words has them past
  // the point, away from the axes. Kept inside the frame.
  const isBelow = q.y < 0;
  const isLeft = q.x < 0;
  const inside = (cx: number, w: number, anchor: string) =>
    anchor === "start"
      ? Math.min(cx, px.width - w)
      : anchor === "end"
        ? Math.max(cx, w)
        : Math.min(Math.max(cx, w / 2), px.width - w / 2);
  const xAnchor = isAcrossShort ? (isLeft ? "end" : "start") : "middle";
  const xAt = {
    x: inside(
      isAcrossShort ? x + (isLeft ? -1 : 1) * (DOT + GAP) : (x + vx) / 2,
      wide(xWords),
      xAnchor,
    ),
    y: isAcrossShort ? y : isBelow ? ay + 8 : ay - 8,
    anchor: xAnchor,
    baseline: isAcrossShort ? "central" : isBelow ? "hanging" : "auto",
  };
  // Near the y-axis, on the side away from it (off its numbers); far from it, on the side toward
  // it, the open middle of the plane (off the frame's edge and the axes' end names). Either way,
  // the other side if this one has no room.
  const isNearYAxis = Math.abs(ax - vx) < (3 * wide(yWords)) / 2;
  const leftOfLine = isNearYAxis === isLeft;
  const yLeft = leftOfLine ? ax - GAP - wide(yWords) >= 0 : !(ax + GAP + wide(yWords) <= px.width);
  const yAnchor = isUpShort ? "middle" : yLeft ? "end" : "start";
  // Below the x-axis, under its numbers' row (they are drawn just under the axis).
  const NUMBERS_ROW = 28;
  const yAt = {
    x: inside(isUpShort ? x : ax + (yLeft ? -GAP : GAP), wide(yWords), yAnchor),
    y: isUpShort
      ? y + (isBelow ? 1 : -1) * (DOT + LINE / 2)
      : isBelow
        ? Math.min(Math.max((y + base) / 2, base + NUMBERS_ROW), y - DOT)
        : (y + base) / 2,
    anchor: yAnchor,
  };
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
          x={yAt.x}
          y={yAt.y}
          dominant-baseline="central"
          text-anchor={yAt.anchor}
        >
          {yWords}
        </text>
      )}
      {hasLengths && q.x !== 0 && (
        <text
          class="cp-length"
          x={xAt.x}
          y={xAt.y}
          dominant-baseline={xAt.baseline}
          text-anchor={xAt.anchor}
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
      </g>
      {/* Beside the point, not part of it: the point (its part, what is pressed and dragged) is
          the dot alone. A point that stays has its pair written under the plane instead. */}
      {(stage === Reading.Pair || isHidden) && !isPairBelow(s) && (
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
  );
}

/** The reading layer's drawing: the point read off the axes, and Show when it is hidden. */
export const readingDrawing = drawing(reading, {
  front: ({ s, px }) => <ReadingDraw s={s} px={px} />,
  // The pair in one place, under the plane (isPairBelow), not beside the point.
  below: ({ s, locale }) => {
    if (s.point === null || !isPairBelow(s) || s.reading !== Reading.Pair || s.isReadingHidden)
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
