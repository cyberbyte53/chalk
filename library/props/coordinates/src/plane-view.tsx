import type { Locale } from "@chalk/content";
import type { ViewOf } from "@chalk/prop";
import { type FramePixels, does, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { Axes, Marks, PlanePart, QUADRANTS, type Quadrant, Scene, plane } from "./plane";
import { num } from "./words";

export type PlaneView = ViewOf<typeof plane>;

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
const SIGNS: Record<Quadrant, string> = {
  I: "(+, +)",
  II: "(−, +)",
  III: "(−, −)",
  IV: "(+, −)",
};

/** What each part of the plane is, in words, when a tap names it. */
export const PART_WORDS: Record<PlanePart, { en: string; hi: string }> = {
  O: { en: "O, the origin: (0, 0)", hi: "O, मूल बिंदु: (0, 0)" },
  OX: { en: "OX: the positive x-axis", hi: "OX: धनात्मक x-अक्ष" },
  "OX′": { en: "OX′: the negative x-axis", hi: "OX′: ऋणात्मक x-अक्ष" },
  OY: { en: "OY: the positive y-axis", hi: "OY: धनात्मक y-अक्ष" },
  "OY′": { en: "OY′: the negative y-axis", hi: "OY′: ऋणात्मक y-अक्ष" },
  I: { en: "Quadrant I: (+, +)", hi: "चतुर्थांश I: (+, +)" },
  II: { en: "Quadrant II: (−, +)", hi: "चतुर्थांश II: (−, +)" },
  III: { en: "Quadrant III: (−, −)", hi: "चतुर्थांश III: (−, −)" },
  IV: { en: "Quadrant IV: (+, −)", hi: "चतुर्थांश IV: (+, −)" },
};

/** A quadrant's corner of the window, in units: where it is drawn and tapped. */
function quadrantBox(s: PlaneView, q: Quadrant) {
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

/** Whether the plane is set up to name its parts: the axes crossing at O, with directions or quadrants. */
export const canNameParts = (s: PlaneView): boolean =>
  s.axes === Axes.Both &&
  s.marks === Marks.Numbers &&
  s.isCrossed === true &&
  (s.showDirections || s.quadrantsNamed > 0);

/** What is drawn behind the plane: the paper, the town's roads, the classroom floor, the ground. */
export function SceneDraw({ s, px }: { s: PlaneView; px: FramePixels }): JSX.Element | null {
  const w = s.window;
  const [x0, y0] = px.toPx(w.xMin, w.yMax);
  const [x1, y1] = px.toPx(w.xMax, w.yMin);
  const box = { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
  if (s.scene === Scene.None) return null;
  if (s.scene !== Scene.Town) return <rect class={`cp-scene is-${s.scene}`} {...box} rx={6} />;
  // The town: the main road along the bottom, a street up from it at every count.
  const unit = unitOf(px);
  const road = Math.max(6, Math.min(16, unit * 0.32));
  const streets = marksOn(Marks.Counts, w.xMin, w.xMax, 1).filter((x) => isRisen(s, x));
  const [, base] = px.toPx(0, 0);
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
            y1={base}
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
 * The two lines with only the marks defined so far: plain, counted from 1, or numbered with 0 and
 * negatives; their names; O, the directions, and the quadrants as the lesson names them. In the town,
 * a street's number is a button that lights every house on it.
 */
export function AxesDraw({
  s,
  px,
  locale,
  canLight,
}: {
  s: PlaneView;
  px: FramePixels;
  locale: Locale;
  /** Whether a number on a line lights every place with it (the places layer is on). */
  canLight: boolean;
}): JSX.Element {
  const w = s.window;
  const unit = unitOf(px);
  // Numbers every mark when there's room, else every other.
  const every = unit * s.tickEvery >= 18 ? 1 : 2;
  // Only the lines numbered so far carry their marks (a page's edge, once a distance along it is given).
  const xMarks = s.numbered.includes("x") ? marksOn(s.marks, w.xMin, w.xMax, s.tickEvery) : [];
  // The vertical line's zero is `apart` from the horizontal one's: it reads y − apart.y.
  const yMarks = s.numbered.includes("y")
    ? marksOn(s.marks, w.yMin - s.apart.y, w.yMax - s.apart.y, s.tickEvery)
    : [];
  const [left, base] = px.toPx(w.xMin, 0);
  const [right] = px.toPx(w.xMax, 0);
  const [vx, top] = px.toPx(s.apart.x, w.yMax);
  const [, bottom] = px.toPx(s.apart.x, w.yMin);
  const isNumbers = s.marks === Marks.Numbers;
  const hasZeroMark = (v: number) => Math.abs(v) < 1e-9;
  const isCounted = s.marks === Marks.Counts;
  const named = s.named;
  const label = (v: number, i: number) =>
    i % every === 0 && !(hasZeroMark(v) && s.showOrigin && s.isCrossed === true) ? num(v) : "";
  return (
    <g class="cp-axes">
      <line
        class={`cp-axis${named === PlanePart.OX || named === PlanePart.OXDash ? " is-named" : ""}`}
        x1={left}
        y1={base}
        x2={right}
        y2={base}
      />
      {hasUp(s) && <line class="cp-axis" x1={vx} y1={top} x2={vx} y2={bottom} />}
      {named?.startsWith("O") && named !== "O" && <NamedHalf s={s} px={px} part={named} />}
      {xMarks.map((v, i) => {
        const [x] = px.toPx(v, 0);
        const text = label(v, i);
        const isButton = canLight && isCounted && text !== "";
        return (
          <g key={`x${v}`} class="cp-mark">
            <line x1={x} y1={base - 4} x2={x} y2={base + 4} />
            {isButton ? (
              <g
                class={`cp-mark-button${s.lit?.axis === "x" && s.lit.value === v ? " is-lit" : ""}`}
                {...does(plane.actions.tapNumber, { axis: "x", value: v }, `x${v}`)}
                transform={`translate(${x}, ${base + 16})`}
              >
                <circle r={11} />
                <text text-anchor="middle" dominant-baseline="central">
                  {text}
                </text>
              </g>
            ) : (
              <text x={x} y={base + 16} text-anchor="middle" dominant-baseline="central">
                {text}
              </text>
            )}
          </g>
        );
      })}
      {hasUp(s) &&
        yMarks.map((v, i) => {
          const [, y] = px.toPx(s.apart.x, v + s.apart.y);
          const text = label(v, i);
          const isButton = canLight && isCounted && text !== "";
          return (
            <g key={`y${v}`} class="cp-mark">
              <line x1={vx - 4} y1={y} x2={vx + 4} y2={y} />
              {isButton ? (
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
                <text x={vx - 8} y={y} text-anchor="end" dominant-baseline="central">
                  {text}
                </text>
              )}
            </g>
          );
        })}
      {isNumbers && s.showOrigin && s.isCrossed === true && (
        <text class="cp-origin" x={vx - 7} y={base + 14} text-anchor="end">
          O
        </text>
      )}
      {s.showAxisNames && (
        <>
          <text
            class="cp-axis-name"
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
              class="cp-axis-name"
              {...shows("yName", s.axisNames[1][locale])}
              x={vx + 8}
              y={top - 8}
            >
              {s.axisNames[1][locale]}
            </text>
          )}
        </>
      )}
      {s.showDirections && s.axes === Axes.Both && (
        <g class="cp-directions">
          <text x={right - 2} y={base + 30} text-anchor="end">
            X
          </text>
          <text x={left + 2} y={base + 30}>
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
      {s.axes === Axes.Both &&
        QUADRANTS.slice(0, s.quadrantsNamed).map((q) => {
          const b = quadrantBox(s, q);
          if (b.x1 - b.x0 < 1 || b.y1 - b.y0 < 1) return null;
          const [cx, cy] = px.toPx((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2);
          return (
            <g key={q} class={`cp-quadrant${named === q ? " is-named" : ""}`}>
              <text x={cx} y={cy} text-anchor="middle" dominant-baseline="central">
                {q}
              </text>
              {s.showQuadrantSigns && (
                <text class="cp-signs" x={cx} y={cy + 20} text-anchor="middle">
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
  return (
    <g class="cp-part-taps">
      {QUADRANTS.map((q) => {
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
