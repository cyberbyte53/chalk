import type { Locale } from "@chalk/content";
import type { PropView } from "@chalk/player";
import { type FramePixels, does, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { useLayoutEffect, useRef } from "preact/hooks";
import { usePlaneLabel } from "./place-labels";
import { Axes, Marks, PlanePart, QUADRANTS, type Quadrant, Scene } from "./plane";
import { plane } from "./plane";
import { WORDS, num, word } from "./words";

export type PlaneView = PropView<typeof plane>;

/** Px across one unit of the plane. */
export const unitOf = (px: FramePixels): number => px.toPx(1, 0)[0] - px.toPx(0, 0)[0];

/** The marks along one line: whole multiples of the step inside [lo, hi], counts from the step. */
export function marksOn(marks: Marks, lo: number, hi: number, step: number): number[] {
  if (marks === Marks.None) return [];
  const first = marks === Marks.Counts ? step : Math.ceil(lo / step - 1e-9) * step;
  const out: number[] = [];
  for (let v = first; v <= hi + 1e-9 && out.length < 400; v += step) out.push(Number(v.toFixed(6)));
  return out;
}

/** Whether a line rises from x on the horizontal line (every one does, unless the lesson raises them). */
export const isRisen = (s: Pick<PlaneView, "upLines">, x: number): boolean =>
  s.upLines === null || s.upLines.includes(x);

/** Whether the plane has an up direction yet: both lines drawn, and some line risen or rising. */
export const hasUp = (s: PlaneView): boolean =>
  s.axes === Axes.Both && (s.upLines === null || s.upLines.length > 0 || s.rising !== null);

/** Each quadrant's corner sign pattern, as the book writes it. */
export const SIGNS: Record<Quadrant, string> = {
  I: "(+, +)",
  II: "(−, +)",
  III: "(−, −)",
  IV: "(+, −)",
};

/** What each part of the plane is, in words, when a tap names it. */
export const PART_WORDS: Record<PlanePart, { en: string; hi: string }> = {
  O: { en: "O: the origin", hi: "O: मूल बिंदु" },
  OX: { en: "OX: the positive direction of the x-axis", hi: "OX: x-अक्ष की धनात्मक दिशा" },
  "OX′": { en: "OX′: the negative direction of the x-axis", hi: "OX′: x-अक्ष की ऋणात्मक दिशा" },
  OY: { en: "OY: the positive direction of the y-axis", hi: "OY: y-अक्ष की धनात्मक दिशा" },
  "OY′": { en: "OY′: the negative direction of the y-axis", hi: "OY′: y-अक्ष की ऋणात्मक दिशा" },
  // In Devanagari a Roman I reads as a danda (।): the ordinal comes first, the numeral after it.
  I: { en: "Quadrant I", hi: "पहला चतुर्थांश (I)" },
  II: { en: "Quadrant II", hi: "दूसरा चतुर्थांश (II)" },
  III: { en: "Quadrant III", hi: "तीसरा चतुर्थांश (III)" },
  IV: { en: "Quadrant IV", hi: "चौथा चतुर्थांश (IV)" },
};

/** A tapped part's words: its name, and a quadrant's signs once they are defined. */
export function partWords(s: PlaneView, part: PlanePart, locale: "en" | "hi"): string {
  const name = PART_WORDS[part][locale];
  // A quadrant's signs, once the lesson shows them in the quadrants (showQuadrantSigns).
  return s.showQuadrantSigns && part in SIGNS ? `${name}: ${SIGNS[part as Quadrant]}` : name;
}

/** Each numbered quadrant tinted its own colour (tintsQuadrants), behind everything else. */
export function QuadrantTints({ s, px }: { s: PlaneView; px: FramePixels }): JSX.Element | null {
  if (!s.tintsQuadrants || s.axes !== Axes.Both) return null;
  return (
    <g class="cp-quadrant-tints">
      {QUADRANTS.slice(0, s.quadrantsNamed).map((q, i) => {
        const b = quadrantBox(s, q);
        const [x0, y0] = px.toPx(b.x0, b.y1);
        const [x1, y1] = px.toPx(b.x1, b.y0);
        return (
          <rect
            key={q}
            class={`cp-quadrant-tint is-${i + 1}`}
            x={x0}
            y={y0}
            width={x1 - x0}
            height={y1 - y0}
          />
        );
      })}
    </g>
  );
}

/** A quadrant's corner of the window, in units: where it is drawn and tapped. */
export function quadrantBox(s: { window: PlaneView["window"] }, q: Quadrant) {
  const w = s.window;
  const right = q === "I" || q === "IV";
  const top = q === "I" || q === "II";
  return {
    x0: right ? Math.max(0, w.xMin) : w.xMin,
    x1: right ? w.xMax : Math.min(0, w.xMax),
    y0: top ? Math.max(0, w.yMin) : w.yMin,
    y1: top ? w.yMax : Math.min(0, w.yMax),
  };
}

const isNumbersOf = (s: PlaneView) => s.marks === Marks.Numbers;

/** Whether the plane is set up to name its parts: the axes crossing at O, with directions or quadrants. */
export const canNameParts = (s: PlaneView): boolean =>
  s.axes === Axes.Both &&
  s.marks === Marks.Numbers &&
  s.isCrossed === true &&
  (s.showDirections || s.quadrantsNamed > 0);

/** What is drawn behind the plane: the paper, the town's roads, the classroom floor, the ground. */
export function SceneDraw({
  s,
  px,
  locale,
}: { s: PlaneView; px: FramePixels; locale: Locale }): JSX.Element | null {
  const w = s.window;
  const [x0, y0] = px.toPx(w.xMin, w.yMax);
  const [x1, y1] = px.toPx(w.xMax, w.yMin);
  const box = { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
  if (s.scene === Scene.None) return null;
  if (s.scene === Scene.Classroom) {
    // The blackboard, named, in the room just above the front wall (the bottom edge): the front,
    // which row 1 is nearest. Clear of the Column line, which it isn't part of.
    const tall = 13;
    const wide = Math.min(box.width * 0.4, 140);
    const top = box.y + box.height - tall - 4;
    return (
      <g class="cp-classroom">
        <rect class="cp-scene is-classroom" {...box} rx={6} />
        <rect
          class="cp-blackboard"
          x={box.x + (box.width - wide) / 2}
          y={top}
          width={wide}
          height={tall}
          rx={2}
        />
        <text
          class="cp-blackboard-name"
          x={box.x + box.width / 2}
          y={top + tall / 2}
          text-anchor="middle"
          dominant-baseline="central"
        >
          {word(WORDS.blackboard, locale)}
        </text>
      </g>
    );
  }
  if (s.scene !== Scene.Town) return <rect class={`cp-scene is-${s.scene}`} {...box} rx={6} />;
  // The town: the main road, a street up from it at every count. Grown past Riya's corner (its
  // window reaching west of 0, or south of the road), its streets are at every whole number, the
  // corner's own included, and run south of the road as well.
  const unit = unitOf(px);
  const road = Math.max(6, Math.min(16, unit * 0.32));
  const growsWest = w.xMin < 0;
  const streets = marksOn(growsWest ? Marks.Numbers : Marks.Counts, w.xMin, w.xMax, 1).filter((x) =>
    isRisen(s, x),
  );
  const [, base] = px.toPx(0, 0);
  const foot = w.yMin < 0 ? y1 : base;
  const rise = s.rising;
  return (
    <g class="cp-town">
      <rect class="cp-scene is-town" {...box} rx={6} />
      {streets.map((x) => {
        const [sx] = px.toPx(x, 0);
        return (
          <line
            key={x}
            class="cp-street"
            x1={sx}
            y1={foot}
            x2={sx}
            y2={y0}
            stroke-width={road * 0.7}
          />
        );
      })}
      {rise !== null && (
        <line
          class="cp-street is-rising"
          x1={px.toPx(rise.at, 0)[0]}
          y1={base}
          x2={px.toPx(rise.at, 0)[0]}
          y2={base + (y0 - base) * rise.height}
          stroke-width={road * 0.7}
        />
      )}
      <line class="cp-main-road" x1={x0} y1={base} x2={x1} y2={base} stroke-width={road} />
    </g>
  );
}

/** Graph paper: a faint line at every mark. */
export function GridDraw({ s, px }: { s: PlaneView; px: FramePixels }): JSX.Element | null {
  if (!s.hasGrid) return null;
  const w = s.window;
  const xs = marksOn(Marks.Numbers, w.xMin, w.xMax, s.tickEvery);
  const ys = marksOn(Marks.Numbers, w.yMin, w.yMax, s.tickEvery);
  return (
    <g class="cp-grid">
      {xs.map((x) => {
        const [a, top] = px.toPx(x, w.yMax);
        const [, bottom] = px.toPx(x, w.yMin);
        return <line key={`x${x}`} x1={a} y1={top} x2={a} y2={bottom} />;
      })}
      {ys.map((y) => {
        const [left, b] = px.toPx(w.xMin, y);
        const [right] = px.toPx(w.xMax, y);
        return <line key={`y${y}`} x1={left} y1={b} x2={right} y2={b} />;
      })}
    </g>
  );
}

/**
 * A number on lines drawn turned stays upright: turned back about where it is written by as much
 * as the lines are turned (they are drawn in a group turned the other way).
 */
const upright = (s: PlaneView, x: number, y: number): string | undefined =>
  s.turn === 0 ? undefined : `rotate(${s.turn} ${x} ${y})`;

/**
 * The two lines with only the marks defined so far: plain, counted from 1, or numbered with 0 and
 * negatives; their names; O, the directions, and the quadrants as the lesson names them. In the town,
 * a street's number is a button that lights every house on it.
 */
export function AxesDraw({
  s,
  px,
  locale,
  canLight,
  layer,
  isMarkShown = () => true,
}: {
  s: PlaneView;
  px: FramePixels;
  locale: Locale;
  /** Which marks are drawn, by line and value: on axes the learner moves, those on the sheet. */
  isMarkShown?: (axis: "x" | "y", v: number) => boolean;
  /** Whether a number on a line lights every place with it (the places layer is on). */
  canLight: boolean;
  /**
   * Which half: the lines and their marks (under what is placed on the plane), or their numbers and
   * names (over it, so a town's houses never cover a number).
   */
  layer: "lines" | "labels";
}): JSX.Element {
  const isLines = layer === "lines";
  // How far under the horizontal line its numbers sit: on a lone number line a little further,
  // clear of the point dragged along it (it sits on the line, over its marks).
  const numbersBelow = s.axes === Axes.Horizontal ? 22 : 16;
  const w = s.window;
  const unit = unitOf(px);
  // Numbers every mark when there's room, else every other.
  const every = unit * s.tickEvery >= 18 ? 1 : 2;
  // Only the lines numbered so far carry their marks (a page's edge, once a distance along it is given).
  const xMarks = s.numbered.includes("x")
    ? marksOn(s.marks, w.xMin, w.xMax, s.tickEvery).filter((v) => isMarkShown("x", v))
    : [];
  // The vertical line's zero is `apart` from the horizontal one's: it reads y − apart.y.
  const yMarks = s.numbered.includes("y")
    ? marksOn(s.marks, w.yMin - s.apart.y, w.yMax - s.apart.y, s.tickEvery).filter((v) =>
        isMarkShown("y", v),
      )
    : [];
  const [left, base] = px.toPx(w.xMin, 0);
  const [right] = px.toPx(w.xMax, 0);
  const [vx, top] = px.toPx(s.apart.x, w.yMax);
  const [, bottom] = px.toPx(s.apart.x, w.yMin);
  const isNumbers = s.marks === Marks.Numbers;
  const hasZeroMark = (v: number) => Math.abs(v) < 1e-9;
  const isCounted = s.marks === Marks.Counts;
  const named = s.named;
  // Two number lines crossing at their zeroes: the crossing is written once, not as each line's 0:
  // O once the lesson has named it, 0 before.
  const hasO =
    isNumbersOf(s) &&
    s.isCrossed === true &&
    hasUp(s) &&
    s.numbered.includes("x") &&
    s.numbered.includes("y");
  // Where a unit is too short for O between the two −1s, O goes above the horizontal line, in the
  // corner no number uses, low, clear of the y-axis's 1; the y-axis's −1 isn't written (below).
  const isCrowded = hasO && unit * s.tickEvery < 30;
  const label = (v: number, i: number) =>
    i % every === 0 && !(hasZeroMark(v) && hasO) ? num(v) : "";
  return (
    <g class="cp-axes">
      {isLines && (
        <line
          class={`cp-axis${named === PlanePart.OX || named === PlanePart.OXDash ? " is-named" : ""}`}
          x1={left}
          y1={base}
          x2={right}
          y2={base}
        />
      )}
      {isLines && hasUp(s) && <line class="cp-axis" x1={vx} y1={top} x2={vx} y2={bottom} />}
      {isLines && named?.startsWith("O") && named !== "O" && (
        <NamedHalf s={s} px={px} part={named} />
      )}
      {xMarks.map((v, i) => {
        const [x] = px.toPx(v, 0);
        const text = label(v, i);
        const isButton = canLight && isCounted && text !== "";
        return (
          <g key={`x${v}`} class="cp-mark">
            {isLines ? (
              <line x1={x} y1={base - 4} x2={x} y2={base + 4} />
            ) : isButton ? (
              <g
                class={`cp-mark-button${s.lit?.axis === "x" && s.lit.value === v ? " is-lit" : ""}`}
                {...does(plane.actions.tapNumber, { axis: "x", value: v }, `x${v}`)}
                transform={`translate(${x}, ${base + numbersBelow})`}
              >
                <circle r={11} />
                <text text-anchor="middle" dominant-baseline="central">
                  {text}
                </text>
              </g>
            ) : (
              <text
                x={x}
                y={base + numbersBelow}
                transform={upright(s, x, base + numbersBelow)}
                text-anchor="middle"
                dominant-baseline="central"
              >
                {text}
              </text>
            )}
          </g>
        );
      })}
      {hasUp(s) &&
        yMarks.map((v, i) => {
          const [, y] = px.toPx(s.apart.x, v + s.apart.y);
          // While the lines are apart, a number of the vertical line on the horizontal line, or on
          // its row of numbers, isn't written: its mark stays.
          const isApart = s.apart.x !== 0 || s.apart.y !== 0;
          const isOnRow = isApart && y > base - 8 && y < base + 30;
          // Where marks are close, the y-axis's first mark below O is on the x-axis's −1 and its
          // numbers' row: its mark stays, its number isn't written.
          const isOnXNumbers = isCrowded && !isApart && Math.abs(v + s.tickEvery) < 1e-9;
          const text = isOnRow || isOnXNumbers ? "" : label(v, i);
          const isButton = canLight && isCounted && text !== "";
          return (
            <g key={`y${v}`} class="cp-mark">
              {isLines ? (
                <line x1={vx - 4} y1={y} x2={vx + 4} y2={y} />
              ) : isButton ? (
                <g
                  class={`cp-mark-button${s.lit?.axis === "y" && s.lit.value === v ? " is-lit" : ""}`}
                  {...does(plane.actions.tapNumber, { axis: "y", value: v }, `y${v}`)}
                  transform={`translate(${vx - 16}, ${y})`}
                >
                  <circle r={11} />
                  <text text-anchor="middle" dominant-baseline="central">
                    {text}
                  </text>
                </g>
              ) : (
                // The zero, under the ring that slides it while apart, is written clear of it.
                <text
                  x={vx - (isApart && hasZeroMark(v) ? 14 : 8)}
                  y={y}
                  transform={upright(s, vx - (isApart && hasZeroMark(v) ? 14 : 8), y)}
                  text-anchor="end"
                  dominant-baseline="central"
                >
                  {text}
                </text>
              )}
            </g>
          );
        })}
      {!isLines && hasO && <OriginName s={s} x={vx - 7} y={isCrowded ? base - 4 : base + 14} />}
      {!isLines && s.showAxisNames && (
        <>
          <text
            class={nameClass(s.axisNames[0][locale])}
            {...shows("xName", s.axisNames[0][locale])}
            x={right}
            // Along the bottom, under the numbers; through the middle, just above its right end.
            // Along the bottom: under its numbers, or just under the line when it has none.
            y={w.yMin < 0 ? base - 8 : s.marks === Marks.None ? base + 16 : base + 36}
            text-anchor="end"
          >
            {s.axisNames[0][locale]}
          </text>
          {hasUp(s) && (
            <text
              class={nameClass(s.axisNames[1][locale])}
              {...shows("yName", s.axisNames[1][locale])}
              x={vx + 8}
              y={top - 8}
            >
              {s.axisNames[1][locale]}
            </text>
          )}
        </>
      )}
      {!isLines && s.showDirections && s.axes === Axes.Both && (
        <g class="cp-directions">
          {/* At the line's ends, a row below its numbers, clear of them. */}
          <text x={right - 2} y={base + 42} text-anchor="end">
            X
          </text>
          <text x={left + 2} y={base + 42}>
            X′
          </text>
          <text x={vx + 10} y={top + 14}>
            Y
          </text>
          <text x={vx + 10} y={bottom - 4}>
            Y′
          </text>
        </g>
      )}
    </g>
  );
}

/** The quadrants' numerals, I to IV, as many as are numbered: over everything, so a town behind leaves them whole. */
export function QuadrantNumerals({ s, px }: { s: PlaneView; px: FramePixels }): JSX.Element | null {
  if (s.axes !== Axes.Both) return null;
  const named = s.named;
  return (
    <g class="cp-axes">
      {QUADRANTS.slice(0, s.quadrantsNamed).map((q) => {
        const b = quadrantBox(s, q);
        if (b.x1 - b.x0 < 1 || b.y1 - b.y0 < 1) return null;
        const [cx, cy] = px.toPx((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2);
        return (
          <g key={q} class={`cp-quadrant${named === q ? " is-named" : ""}`}>
            <text x={cx} y={cy} text-anchor="middle" dominant-baseline="central">
              {q}
            </text>
            {s.showQuadrantSigns && (
              <text class="cp-signs" x={cx} y={cy + 24} text-anchor="middle">
                {SIGNS[q]}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** One half of an axis, drawn thick when a tap named it. */
function NamedHalf({ s, px, part }: { s: PlaneView; px: FramePixels; part: PlanePart }) {
  const w = s.window;
  const ends: Record<string, [number, number, number, number]> = {
    OX: [0, 0, w.xMax, 0],
    "OX′": [w.xMin, 0, 0, 0],
    OY: [0, 0, 0, w.yMax],
    "OY′": [0, w.yMin, 0, 0],
  };
  const e = ends[part];
  if (e === undefined) return null;
  const [a, b] = px.toPx(e[0], e[1]);
  const [c, d] = px.toPx(e[2], e[3]);
  return <line class="cp-axis-half" x1={a} y1={b} x2={c} y2={d} />;
}

/**
 * Taps that name the parts of the plane: each quadrant, each half of an axis, O. Drawn under
 * everything else, so a place or a point on top takes its own tap.
 */
export function PartTaps({ s, px }: { s: PlaneView; px: FramePixels }): JSX.Element {
  const halves: [PlanePart, number, number, number, number][] = [
    [PlanePart.OX, 0, 0, s.window.xMax, 0],
    [PlanePart.OXDash, s.window.xMin, 0, 0, 0],
    [PlanePart.OY, 0, 0, 0, s.window.yMax],
    [PlanePart.OYDash, 0, s.window.yMin, 0, 0],
  ];
  const [ox, oy] = px.toPx(0, 0);
  // A quadrant is tapped once the lesson has numbered them, or where it says they can be.
  const canTapQuadrant = s.canTapQuadrants || s.quadrantsNamed === 4;
  return (
    <g class="cp-part-taps">
      {QUADRANTS.map((q) => {
        if (!canTapQuadrant) return null;
        const b = quadrantBox(s, q);
        if (b.x1 - b.x0 < 0.5 || b.y1 - b.y0 < 0.5) return null;
        const [x0, y0] = px.toPx(b.x0, b.y1);
        const [x1, y1] = px.toPx(b.x1, b.y0);
        return (
          <rect
            key={q}
            class={`cp-part-tap${s.named === q ? " is-named" : ""}`}
            {...does(plane.actions.namePart, { part: q }, q)}
            x={x0}
            y={y0}
            width={x1 - x0}
            height={y1 - y0}
          />
        );
      })}
      {halves.map(([part, a, b, c, d]) => {
        const [x0, y0] = px.toPx(a, b);
        const [x1, y1] = px.toPx(c, d);
        if (Math.hypot(x1 - x0, y1 - y0) < 12) return null;
        return (
          <line
            key={part}
            class="cp-part-tap-line"
            {...does(plane.actions.namePart, { part }, part)}
            x1={x0}
            y1={y0}
            x2={x1}
            y2={y1}
          />
        );
      })}
      <circle
        class="cp-part-tap-o"
        {...does(plane.actions.namePart, { part: PlanePart.O }, "O")}
        cx={ox}
        cy={oy}
        r={12}
      />
    </g>
  );
}

/** A figure's named points, as many as are shown, with their dashed perpendiculars when asked. */
export function NamedPointsDraw({ s, px }: { s: PlaneView; px: FramePixels }): JSX.Element {
  return (
    <g class="cp-named-points">
      {s.points
        .filter((p) => p.isShown)
        .map((p) => {
          const [x, y] = px.toPx(p.x, p.y);
          const [ax] = px.toPx(p.x, 0);
          const [, ay] = px.toPx(0, p.y);
          const [, base] = px.toPx(0, 0);
          const [vx] = px.toPx(0, 0);
          return (
            <g
              key={p.name}
              class={`cp-named-point is-${p.tone}`}
              {...shows(`point${p.name}`, { x: p.x, y: p.y }, p.name)}
            >
              {p.hasDropLines && (
                <>
                  <line class="cp-drop" x1={x} y1={y} x2={ax} y2={base} />
                  <line class="cp-drop" x1={x} y1={y} x2={vx} y2={ay} />
                </>
              )}
              <circle cx={x} cy={y} r={5} />
              <text x={x + 8} y={y - 8}>
                {p.name}
              </text>
            </g>
          );
        })}
    </g>
  );
}

/**
 * O (or 0) at the crossing, below and left of it; when a game's counter or a point to drag stands on
 * the crossing, it moves clear of it (below, or left), so it is never half under one.
 */
function OriginName({ s, x, y }: { s: Parameters<typeof upright>[0]; x: number; y: number }) {
  const ref = useRef<SVGTextElement>(null);
  // Where it always is, unless something that stays on it (a plotted dot, a game's counters) is
  // really on it, not merely near (a gap of 0); Riya and a dot waiting to be dragged pass over it.
  // Elsewhere, it keeps clear of those and of every other word (the axes' numbers beside it).
  const onIt = ".cp-counters circle, .cp-counters text, .cp-dot > circle";
  usePlaneLabel(ref, () => ({
    spots: [
      [x, y, "end"],
      [x, y + 12, "end"],
      [x - 12, y, "end"],
      [x - 12, y + 12, "end"],
      [x - 12, y - 14, "end"],
      [x + 16, y + 12, "start"],
      [x - 24, y, "end"],
      [x - 24, y - 14, "end"],
      [x - 24, y + 12, "end"],
    ],
    avoid: (spot) => (spot === 0 ? { what: onIt, gap: 0 } : { what: `${onIt}, text`, gap: 4 }),
    gap: 4,
    transform: (at, to) => upright(s, at, to),
  }));
  return (
    <text
      ref={ref}
      class={s.showOrigin ? "cp-origin" : "cp-origin is-zero"}
      x={x}
      y={y}
      transform={upright(s, x, y)}
      text-anchor="end"
    >
      {s.showOrigin ? "O" : "0"}
    </text>
  );
}

/** An axis's name: a word (Street number), or one letter (t, d), drawn as a variable is. */
const nameClass = (name: string) => (name.length === 1 ? "cp-axis-name is-letter" : "cp-axis-name");
