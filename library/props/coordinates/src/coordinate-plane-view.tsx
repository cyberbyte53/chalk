import { Stepper, SymbolButton } from "@chalk/draw";
import { FrameStage, type PropViewProps, useDrags } from "@chalk/player";
import { type FramePixels, does, says, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { coordinatePlane, snapped } from "./coordinate-plane";
import { ROMAN, SIGNS, numText, pairText, quadrantOf } from "./plane";

/** Room round the grid for the axis numbers and names, px. */
const PAD = 26;

/** The plane's transform at a width: whole units square, y up. */
export function planePixels(
  s: { xMin: number; xMax: number; yMin: number; yMax: number },
  width: number,
): FramePixels {
  const unit = (width - 2 * PAD) / (s.xMax - s.xMin);
  const height = Math.round((s.yMax - s.yMin) * unit + 2 * PAD);
  const pad = PAD / unit;
  return {
    width,
    height,
    domain: { x: [s.xMin - pad, s.xMax + pad], y: [s.yMin - pad, s.yMax + pad] },
    toPx: (x, y = 0) => [PAD + (x - s.xMin) * unit, PAD + (s.yMax - y) * unit],
    fromPx: (px, py = 0) => [s.xMin + (px - PAD) / unit, s.yMax - (py - PAD) / unit],
  };
}

const range = (lo: number, hi: number, step = 1) => {
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step)
    out.push(Number(v.toFixed(6)));
  return out;
};

/** The grid, the tinted quadrants, the axes with their numbers and names. */
function Paper({
  s,
  px,
  xName,
  yName,
}: {
  s: PropViewProps<typeof coordinatePlane>["view"];
  px: FramePixels;
  xName: string;
  yName: string;
}): JSX.Element {
  const [left, top] = px.toPx(s.xMin, s.yMax);
  const [right, bottom] = px.toPx(s.xMax, s.yMin);
  const [ox, oy] = px.toPx(0, 0);
  const unit = px.toPx(1, 0)[0] - px.toPx(0, 0)[0];
  const every = unit >= 22 ? 1 : 2;
  // Text grows with the grid (styles.css uses the same rule), so its offsets do too.
  const fs = Math.min(22, Math.max(12, unit * 0.42));
  const hasXAxis = s.yMin <= 0 && s.yMax >= 0;
  const isLine = s.isNumberLine;
  const hasYAxis = !isLine && s.xMin <= 0 && s.xMax >= 0;
  const here = s.isXKnown && s.isYKnown ? quadrantOf(s.x, s.y) : 0;
  const quadrants = [
    { q: 1, x0: 0, x1: s.xMax, y0: 0, y1: s.yMax },
    { q: 2, x0: s.xMin, x1: 0, y0: 0, y1: s.yMax },
    { q: 3, x0: s.xMin, x1: 0, y0: s.yMin, y1: 0 },
    { q: 4, x0: 0, x1: s.xMax, y0: s.yMin, y1: 0 },
  ].filter((r) => r.x1 > r.x0 && r.y1 > r.y0);
  const isFourWay = quadrants.length === 4;
  return (
    <g class="cp-paper">
      {s.showQuadrants &&
        isFourWay &&
        quadrants.map((r) => {
          const [a, b] = px.toPx(r.x0, r.y1);
          const [c, d] = px.toPx(r.x1, r.y0);
          // In the quadrant's outer corner, out of the way of P and its lines near the axes.
          const cx = r.x0 === 0 ? r.x1 - 1.1 : r.x0 + 1.1;
          const cy = r.y0 === 0 ? r.y1 - 0.9 : r.y0 + (s.showSigns ? 1.4 : 0.9);
          const [mx, my] = px.toPx(cx, cy);
          return (
            <g
              key={r.q}
              class={r.q === here ? `cp-quadrant cp-q${r.q} is-here` : `cp-quadrant cp-q${r.q}`}
            >
              <rect x={a} y={b} width={c - a} height={d - b} />
            </g>
          );
        })}
      {range(s.xMin, s.xMax).map((v) => {
        const [x] = px.toPx(v, 0);
        // A number line has a tick at each whole number, not graph paper.
        if (s.scene !== "paper") return null;
        return isLine ? (
          <line key={`gx${v}`} class="cp-line-tick" x1={x} y1={oy - 8} x2={x} y2={oy + 8} />
        ) : (
          <line key={`gx${v}`} class="cp-grid" x1={x} y1={top} x2={x} y2={bottom} />
        );
      })}
      {!isLine &&
        s.scene === "paper" &&
        range(s.yMin, s.yMax).map((v) => {
          const [, y] = px.toPx(0, v);
          return <line key={`gy${v}`} class="cp-grid" x1={left} y1={y} x2={right} y2={y} />;
        })}
      {/* Their names over the grid, so no grid line cuts through them. */}
      {s.showQuadrants &&
        isFourWay &&
        quadrants.map((r) => {
          const [a, b] = px.toPx(r.x0, r.y1);
          const [c, d] = px.toPx(r.x1, r.y0);
          // In the quadrant's outer corner, out of the way of P and its lines near the axes.
          const cx = r.x0 === 0 ? r.x1 - 1.1 : r.x0 + 1.1;
          const cy = r.y0 === 0 ? r.y1 - 0.9 : r.y0 + (s.showSigns ? 1.4 : 0.9);
          const [mx, my] = px.toPx(cx, cy);
          return (
            <g
              key={r.q}
              class={r.q === here ? `cp-quadrant cp-q${r.q} is-here` : `cp-quadrant cp-q${r.q}`}
            >
              <text class="cp-quadrant-name" x={mx} y={s.showSigns ? my - 4 : my + 8}>
                {ROMAN[r.q]}
              </text>
              {s.showSigns && (
                <text class="cp-quadrant-signs" x={mx} y={my + 22}>
                  {SIGNS[r.q]}
                </text>
              )}
            </g>
          );
        })}
      {hasXAxis && (
        <g class="cp-axis">
          <line x1={left - 8} y1={oy} x2={right + 8} y2={oy} />
          <path d={`M${right + 12} ${oy} l-9 -5 v10 z`} />
          {s.xMin < 0 && <path d={`M${left - 12} ${oy} l9 -5 v10 z`} />}
          {!isLine && (
            <text class="cp-axis-name cp-x" x={right + 4} y={oy - 10}>
              {s.showAxisEnds ? "X" : xName}
            </text>
          )}
          {!isLine && s.showAxisEnds && s.xMin < 0 && (
            <text class="cp-axis-name cp-x is-start" x={left - 4} y={oy - 10}>
              X′
            </text>
          )}
          {range(s.xMin, s.xMax, every)
            .filter((v) => v !== 0)
            .map((v) => {
              const [x] = px.toPx(v, 0);
              return (
                <text key={`nx${v}`} class="cp-tick" x={x} y={oy + fs + 5}>
                  {numText(v)}
                </text>
              );
            })}
        </g>
      )}
      {hasYAxis && (
        <g class="cp-axis">
          <line x1={ox} y1={bottom + 8} x2={ox} y2={top - 8} />
          <path d={`M${ox} ${top - 12} l-5 9 h10 z`} />
          {s.yMin < 0 && <path d={`M${ox} ${bottom + 12} l-5 -9 h10 z`} />}
          <text class="cp-axis-name cp-y" x={ox + 10} y={top - 4}>
            {s.showAxisEnds ? "Y" : yName}
          </text>
          {s.showAxisEnds && s.yMin < 0 && (
            <text class="cp-axis-name cp-y" x={ox + 10} y={bottom + 18}>
              Y′
            </text>
          )}
          {range(s.yMin, s.yMax, every)
            .filter((v) => v !== 0)
            .map((v) => {
              const [, y] = px.toPx(0, v);
              return (
                <text key={`ny${v}`} class="cp-tick is-y" x={ox - 7} y={y + fs * 0.36}>
                  {numText(v)}
                </text>
              );
            })}
        </g>
      )}
      {isLine && s.xMin <= 0 && s.xMax >= 0 && (
        <g class="cp-axis">
          <line class="cp-line-tick is-zero" x1={ox} y1={oy - 12} x2={ox} y2={oy + 12} />
          <text class="cp-tick" x={ox} y={oy + fs + 5}>
            0
          </text>
          <text class="cp-origin is-line" x={ox} y={oy - 16}>
            O
          </text>
        </g>
      )}
      {hasXAxis && hasYAxis && (
        <text class="cp-origin" x={ox - 6} y={oy - 6}>
          O
        </text>
      )}
    </g>
  );
}

/**
 * One of P's numbers: a button "x = ?" until it is given (it gives the number shown), then a
 * stepper to change it. So the class sees nothing about x before the teacher gives it.
 */
function NumberInput({
  which,
  name,
  isKnown,
  value,
  min,
  max,
  step,
  set: action,
  call,
}: {
  which: "x" | "y";
  name: string;
  isKnown: boolean;
  value: number;
  min: number;
  max: number;
  step: number;
  set: typeof coordinatePlane.actions.setX;
  call: PropViewProps<typeof coordinatePlane>["call"];
}): JSX.Element {
  return (
    <span class={`cp-stepper cp-${which}`}>
      {isKnown ? (
        <Stepper
          name={name}
          value={value}
          min={min}
          max={max}
          step={step}
          {...says(action)}
          onChange={(v) => call(action, { value: v })}
        />
      ) : (
        <SymbolButton
          symbol={`${name} = ?`}
          label={`Give ${name}`}
          isWide
          {...does(action, { value })}
        />
      )}
    </span>
  );
}

/**
 * The whole grid as something to tap: a tap (or a drag) puts P on the nearest crossing. Drawn
 * under P and the walkers, inside the frame, which wires the pointer.
 */
function PickLayer({
  s,
  px,
}: {
  s: PropViewProps<typeof coordinatePlane>["view"];
  px: FramePixels;
}): JSX.Element {
  const drag = useDrags();
  const [left, top] = px.toPx(s.xMin, s.yMax);
  const [right, bottom] = px.toPx(s.xMax, s.yMin);
  const pad = (px.toPx(1, 0)[0] - px.toPx(0, 0)[0]) / 2;
  return (
    <rect
      class="cp-pick"
      x={left - pad}
      y={top - pad}
      width={right - left + 2 * pad}
      height={bottom - top + 2 * pad}
      {...drag(
        {
          axis: "xy",
          at: { x: s.x, y: s.y },
          follow: "finger",
          move: coordinatePlane.actions.movePoint,
          step: s.snap,
          words: pairText(s.x, s.y),
          place: (to) => ({
            x: snapped(to.x, s.snap, s.xMin, s.xMax),
            y: snapped(to.y, s.snap, s.yMin, s.yMax),
          }),
        },
        "pick",
      )}
    />
  );
}

/** P, the point to drag: drawn inside the frame, which wires its drag. */
function PointHandle({
  s,
  px,
}: {
  s: PropViewProps<typeof coordinatePlane>["view"];
  px: FramePixels;
}): JSX.Element {
  const drag = useDrags();
  const [pX, pY] = px.toPx(s.x, s.y);
  // The dot grows with the grid (a projector's grid is bigger), never past a fifth of a square.
  const dot = Math.min(9, Math.max(6, (px.toPx(1, 0)[0] - px.toPx(0, 0)[0]) * 0.18));
  return (
    <g class="cp-point" {...shows("point", { x: s.x, y: s.y }, pairText(s.x, s.y))}>
      <circle class="cp-point-halo" cx={pX} cy={pY} r={dot * 1.8} />
      <circle class="cp-point-dot" cx={pX} cy={pY} r={dot} />
      {/* What the pointer takes: bigger than the dot, so it is easy to grab on a projector. */}
      <circle
        class="cp-point-grab"
        cx={pX}
        cy={pY}
        r={20}
        {...drag({
          axis: "xy",
          at: { x: s.x, y: s.y },
          move: coordinatePlane.actions.movePoint,
          step: s.snap,
          isOn: s.isMovable,
          words: pairText(s.x, s.y),
          place: (to) => ({
            x: snapped(to.x, s.snap, s.xMin, s.xMax),
            y: snapped(to.y, s.snap, s.yMin, s.yMax),
          }),
        })}
      />
      <text
        class={s.x > s.xMax - 1 ? "cp-point-name is-end" : "cp-point-name"}
        x={s.x > s.xMax - 1 ? pX - dot - 4 : pX + dot + 4}
        y={pY - dot - 4}
      >
        {s.pointName}
      </text>
    </g>
  );
}

/**
 * A page of a squared maths notebook: light blue squares (two to a unit). No margin line: the page's
 * own left and bottom edges are the two lines distances are measured from.
 */
function Notebook({
  s,
  px,
}: {
  s: PropViewProps<typeof coordinatePlane>["view"];
  px: FramePixels;
}): JSX.Element {
  const [left, top] = px.toPx(s.xMin, s.yMax);
  const [right, bottom] = px.toPx(s.xMax, s.yMin);
  return (
    <g class="cp-notebook">
      <rect class="cp-page" x={left} y={top} width={right - left} height={bottom - top} />
      {range(s.xMin, s.xMax, 0.5).map((v) => {
        const [x] = px.toPx(v, 0);
        return (
          <line
            key={`nx${v}`}
            class={Number.isInteger(v) ? "cp-square" : "cp-square is-half"}
            x1={x}
            y1={top}
            x2={x}
            y2={bottom}
          />
        );
      })}
      {range(s.yMin, s.yMax, 0.5).map((v) => {
        const [, y] = px.toPx(0, v);
        return (
          <line
            key={`ny${v}`}
            class={Number.isInteger(v) ? "cp-square" : "cp-square is-half"}
            x1={left}
            y1={y}
            x2={right}
            y2={y}
          />
        );
      })}
    </g>
  );
}

/**
 * The plane drawn as a place: a colony (a main road along the x-axis, a street up from it at each
 * street number, a house beside the street at each house number) or a cinema hall (a seat at each
 * place, the screen in front of row 1). The grid's numbers and axes are drawn over it as usual.
 */
function Scene({
  s,
  px,
  screen,
}: {
  s: PropViewProps<typeof coordinatePlane>["view"];
  px: FramePixels;
  screen: string;
}): JSX.Element | null {
  if (s.scene === "paper") return null;
  if (s.scene === "notebook") return <Notebook s={s} px={px} />;
  const unit = px.toPx(1, 0)[0] - px.toPx(0, 0)[0];
  const [left, top] = px.toPx(s.xMin, s.yMax);
  const [right, bottom] = px.toPx(s.xMax, s.yMin);
  const xs = range(1, s.xMax);
  const ys = range(1, s.yMax);
  const known = s.isXKnown && s.isYKnown;
  // A place lights up while it could still be the one: on the known street (or row), or it is it.
  const stateOf = (x: number, y: number) =>
    known
      ? x === s.x && y === s.y
        ? " is-it"
        : ""
      : (s.isXKnown && x === s.x) || (s.isYKnown && y === s.y)
        ? " is-maybe"
        : "";
  if (s.scene === "colony") {
    const road = unit * 0.28;
    const h = unit * 0.46;
    const isMarked = (x: number, y: number) => s.marks.some((m) => m.x === x && m.y === y);
    return (
      <g class="cp-colony">
        <rect
          class="cp-grass"
          x={left}
          y={top - h * 0.7}
          width={right - left}
          height={bottom - top + h * 0.7}
        />
        {xs.map((x) => {
          const [cx] = px.toPx(x, 0);
          return (
            <g key={`st${x}`} class="cp-road">
              <rect
                x={cx - road / 2}
                y={top - h * 0.7}
                width={road}
                height={bottom - top + h * 0.7}
              />
              <line class="cp-road-mid" x1={cx} y1={top - h * 0.7} x2={cx} y2={bottom} />
            </g>
          );
        })}
        <rect class="cp-road" x={left} y={bottom - road / 2} width={right - left} height={road} />
        {xs.flatMap((x) =>
          ys.map((y) => {
            const [cx, cy] = px.toPx(x, y);
            // Each house stands just left of its street, inside the map.
            const hx = cx - road / 2 - h * 1.05;
            return (
              <g
                key={`h${x},${y}`}
                class={`cp-house${stateOf(x, y)}${isMarked(x, y) ? " is-marked" : ""}`}
              >
                <path d={`M${hx} ${cy} l${h / 2} ${-h * 0.55} l${h / 2} ${h * 0.55} z`} />
                <rect x={hx + h * 0.1} y={cy} width={h * 0.8} height={h * 0.6} />
                <rect
                  class="cp-house-door"
                  x={hx + h * 0.4}
                  y={cy + h * 0.25}
                  width={h * 0.2}
                  height={h * 0.35}
                />
              </g>
            );
          }),
        )}
      </g>
    );
  }
  const seat = unit * 0.5;
  const [, screenY] = px.toPx(0, 0.42);
  // A seat lights up when a walk has reached it: the ticket alone doesn't show where it is.
  const isReached = (x: number, y: number) => s.marks.some((m) => m.x === x && m.y === y);
  return (
    <g class="cp-cinema">
      <rect class="cp-hall" x={left} y={top} width={right - left} height={bottom - top} />
      <rect
        class="cp-screen"
        x={left + unit * 0.5}
        y={screenY - unit * 0.14}
        width={right - left - unit * 2}
        height={unit * 0.28}
        rx={unit * 0.08}
      />
      <text class="cp-screen-label" x={(left + right - unit * 1.5) / 2} y={screenY + unit * 0.09}>
        {screen}
      </text>
      {xs.flatMap((x) =>
        ys.map((y) => {
          const [cx, cy] = px.toPx(x, y);
          return (
            <g key={`s${x},${y}`} class={`cp-seat${isReached(x, y) ? " is-it" : ""}`}>
              <rect
                class="cp-seat-back"
                x={cx - seat * 0.4}
                y={cy - seat * 0.55}
                width={seat * 0.8}
                height={seat * 0.6}
                rx={seat * 0.18}
              />
              <rect
                x={cx - seat * 0.55}
                y={cy}
                width={seat * 1.1}
                height={seat * 0.32}
                rx={seat * 0.12}
              />
            </g>
          );
        }),
      )}
    </g>
  );
}

/**
 * The plane: the readout of P above it, the grid, P with its perpendiculars, the lines its known
 * numbers stand for, the walker and its dots, and below, the steppers and buttons the lesson turns
 * on. x-coordinates are always in one colour and y-coordinates in another, on the plane and in the
 * readout alike.
 */
export function CoordinatePlaneView({
  view,
  width,
  locale,
  call,
}: PropViewProps<typeof coordinatePlane>): JSX.Element {
  const s = view;
  const isLine = s.isNumberLine;
  // A number line is the x-axis alone: a strip one unit either side of it.
  const w = isLine ? { ...s, yMin: -1, yMax: 1, showQuadrants: false } : s;
  const px = planePixels(w, width);
  const known = s.isXKnown && s.isYKnown;
  const [ox, oy] = px.toPx(0, 0);
  const [pX, pY] = px.toPx(s.x, s.y);
  const [left, top] = px.toPx(s.xMin, s.yMax);
  const [right, bottom] = px.toPx(s.xMax, s.yMin);
  const xName = s.xName[locale];
  const yName = s.yName[locale];
  const fromO = s.x > 0 ? s.rightOfOWords[locale] : s.leftOfOWords[locale];
  const where = isLine
    ? s.x === 0
      ? "O"
      : fromO.replace("{n}", numText(Math.abs(s.x)))
    : s.x === 0 && s.y === 0
      ? s.originWords[locale]
      : s.y === 0
        ? s.onXAxisWords[locale]
        : s.x === 0
          ? s.onYAxisWords[locale]
          : `${s.quadrantWord[locale]} ${ROMAN[quadrantOf(s.x, s.y)]}`;
  const signs = known ? SIGNS[quadrantOf(s.x, s.y)] : "";
  const label = known
    ? `${s.pointName} at ${pairText(s.x, s.y)}, ${where}`
    : `${s.pointName}: ${s.isXKnown ? `x = ${numText(s.x)}` : s.isYKnown ? `y = ${numText(s.y)}` : "not placed"}`;
  // A known number alone stands for a line; its whole-unit places on it are drawn as candidates.
  const candidates =
    s.showLines && !known && s.scene === "paper"
      ? s.isXKnown
        ? // A window that starts at 0 has no places on its edge (no house 0).
          range(s.yMin === 0 ? 1 : s.yMin, s.yMax).map((y) => ({ x: s.x, y }))
        : s.isYKnown
          ? range(s.xMin === 0 ? 1 : s.xMin, s.xMax).map((x) => ({ x, y: s.y }))
          : []
      : [];
  return (
    <div class="cp-plane">
      {s.showReadout && (
        <p
          class={known ? "cp-readout" : "cp-readout is-partial"}
          {...shows(
            "readout",
            known ? { x: s.x, y: s.y } : null,
            known ? `${pairText(s.x, s.y)}, ${where}` : label,
          )}
        >
          {isLine ? (
            <span class="cp-readout-pair">
              <span class="cp-readout-name">{s.pointName}</span>
              {" = "}
              <span class="cp-x">{numText(s.x)}</span>
            </span>
          ) : known && !s.showCoordinates ? null : (
            <span class="cp-readout-pair">
              <span class="cp-readout-name">{s.pointName}</span>
              {" = ("}
              <span class="cp-x">
                {s.isXKnown && (known ? s.showCoordinates : true) ? numText(s.x) : "?"}
              </span>
              {", "}
              <span class="cp-y">
                {s.isYKnown && (known ? s.showCoordinates : true) ? numText(s.y) : "?"}
              </span>
              {")"}
            </span>
          )}
          {isLine && (
            <span class="cp-readout-where" {...shows("where", s.x, where)}>
              {where}
            </span>
          )}
          {!isLine && known && s.showQuadrants && (
            <span class="cp-readout-where" {...shows("where", quadrantOf(s.x, s.y), where)}>
              {where}
              {s.showSigns && signs !== "" && <span class="cp-readout-signs"> {signs}</span>}
            </span>
          )}
        </p>
      )}
      <div class="cp-frame">
        <FrameStage px={px} label={label} present={[]} look="cp-svg">
          <g style={{ "--cp-unit": `${(px.toPx(1, 0)[0] - px.toPx(0, 0)[0]).toFixed(1)}px` }}>
            <Scene s={w} px={px} screen={s.screenLabel[locale]} />
            <Paper s={w} px={px} xName={xName} yName={yName} />
            {s.showLines && s.isXKnown && (
              <g class="cp-line cp-x" {...shows("xLine", s.x, `${xName} = ${numText(s.x)}`)}>
                <line x1={pX} y1={top - 4} x2={pX} y2={bottom + 4} />
                <text
                  x={pX + 6}
                  y={s.isYKnown && s.y > s.yMax - 1.5 ? bottom - 8 : top + 14}
                >{`${xName} = ${numText(s.x)}`}</text>
              </g>
            )}
            {s.showLines && s.isYKnown && (
              <g class="cp-line cp-y" {...shows("yLine", s.y, `${yName} = ${numText(s.y)}`)}>
                <line x1={left - 4} y1={pY} x2={right + 4} y2={pY} />
                <text
                  x={s.x < (s.xMin + s.xMax) / 2 ? right - 6 : left + 6}
                  y={pY - 8}
                  class={s.x < (s.xMin + s.xMax) / 2 ? "is-end" : ""}
                >{`${yName} = ${numText(s.y)}`}</text>
              </g>
            )}
            {candidates.map((c) => {
              const [cx, cy] = px.toPx(c.x, c.y);
              return <circle key={`c${c.x},${c.y}`} class="cp-candidate" cx={cx} cy={cy} r={6} />;
            })}
            {known && s.showPerpendiculars && (s.x !== 0 || s.y !== 0) && (
              <g class="cp-drops">
                {s.y !== 0 && (
                  <g
                    class="cp-drop cp-y"
                    {...shows(
                      "toXAxis",
                      Math.abs(s.y),
                      `${numText(Math.abs(s.y))} ${s.y > 0 ? "above" : "below"} the x-axis`,
                    )}
                  >
                    <line x1={pX} y1={pY} x2={pX} y2={oy} />
                    <circle cx={pX} cy={oy} r={3.5} />
                    {/* A length, never negative; on the side toward the y-axis, inside the grid. */}
                    <text
                      x={pX + (s.x < 0 ? 8 : -8)}
                      y={(pY + oy) / 2 + 5}
                      class={s.x < 0 ? "" : "is-end"}
                    >
                      {numText(Math.abs(s.y))}
                    </text>
                  </g>
                )}
                {s.x !== 0 && (
                  <g
                    class="cp-drop cp-x"
                    {...shows(
                      "toYAxis",
                      Math.abs(s.x),
                      isLine
                        ? where
                        : `${numText(Math.abs(s.x))} ${s.x > 0 ? "right of" : "left of"} the y-axis`,
                    )}
                  >
                    <line x1={pX} y1={pY} x2={ox} y2={pY} />
                    <circle cx={ox} cy={pY} r={3.5} />
                    <text x={(pX + ox) / 2} y={pY + (s.y < 0 ? 20 : -9)} class="is-mid">
                      {numText(Math.abs(s.x))}
                    </text>
                  </g>
                )}
              </g>
            )}
            {s.canPick && <PickLayer s={s} px={px} />}
            {s.marks.map((m, i) => {
              if (s.scene === "colony" && m.name !== undefined) {
                const [mx, my] = px.toPx(m.x, m.y);
                return (
                  <text
                    key={`m${m.x},${m.y}`}
                    class="cp-point-name"
                    x={mx + 4}
                    y={my - (px.toPx(1, 0)[0] - px.toPx(0, 0)[0]) * 0.32}
                    {...shows(`mark:${i}`, m, m.name)}
                  >
                    {m.name}
                  </text>
                );
              }
              const [mx, my] = px.toPx(m.x, m.y);
              return (
                <g
                  key={`m${m.x},${m.y}`}
                  class={m.name === undefined ? `cp-mark cp-mark-${i % 2}` : "cp-mark is-named"}
                  {...shows(`mark:${i}`, m, m.name ?? pairText(m.x, m.y))}
                >
                  <circle cx={mx} cy={my} r={7} />
                  <text
                    x={m.x > s.xMax - 1.5 ? mx - 11 : mx + 11}
                    y={m.name === undefined ? my + 24 : my - 10}
                    class={m.x > s.xMax - 1.5 ? "is-end" : ""}
                  >
                    {m.name === undefined
                      ? pairText(m.x, m.y)
                      : s.showCoordinates
                        ? `${m.name}${pairText(m.x, m.y)}`
                        : m.name}
                  </text>
                </g>
              );
            })}
            {s.isWalker2Out && (
              <g class="cp-walk is-second" {...shows("walker2", { x: s.walk2X, y: s.walk2Y })}>
                <line class="cp-y" x1={ox} y1={oy} x2={ox} y2={px.toPx(0, s.walk2Y)[1]} />
                <line
                  class="cp-x"
                  x1={ox}
                  y1={px.toPx(0, s.walk2Y)[1]}
                  x2={px.toPx(s.walk2X, s.walk2Y)[0]}
                  y2={px.toPx(s.walk2X, s.walk2Y)[1]}
                />
                <circle
                  class="cp-walker"
                  cx={px.toPx(s.walk2X, s.walk2Y)[0]}
                  cy={px.toPx(s.walk2X, s.walk2Y)[1]}
                  r={9}
                />
              </g>
            )}
            {s.isWalkerOut && (
              <g class="cp-walk" {...shows("walker", { x: s.walkX, y: s.walkY })}>
                <line class="cp-x" x1={ox} y1={oy} x2={px.toPx(s.walkX, 0)[0]} y2={oy} />
                <line
                  class="cp-y"
                  x1={px.toPx(s.walkX, 0)[0]}
                  y1={oy}
                  x2={px.toPx(s.walkX, s.walkY)[0]}
                  y2={px.toPx(s.walkX, s.walkY)[1]}
                />
                <circle
                  class="cp-walker"
                  cx={px.toPx(s.walkX, s.walkY)[0]}
                  cy={px.toPx(s.walkX, s.walkY)[1]}
                  r={9}
                />
              </g>
            )}
            {/* Plotting by walking: P is where the walk lands, not shown before it. */}
            {known && s.scene === "colony" && (
              <text
                class="cp-point-name"
                x={px.toPx(s.x, s.y)[0] + 4}
                y={px.toPx(s.x, s.y)[1] - (px.toPx(1, 0)[0] - px.toPx(0, 0)[0]) * 0.32}
                {...shows("point", { x: s.x, y: s.y }, pairText(s.x, s.y))}
              >
                {s.pointName}
              </text>
            )}
            {known && s.scene !== "colony" && (s.isMovable || !s.canWalk) && (
              <PointHandle s={s} px={px} />
            )}
          </g>
        </FrameStage>
      </div>
      {(s.canSetNumbers ||
        s.canWalk ||
        s.canWalkBoth ||
        s.showLines ||
        s.pairs.length > 0 ||
        (isLine && s.canAddYAxis)) && (
        <div class="cp-controls">
          {s.canSetNumbers && (
            <div class="cp-steppers">
              <NumberInput
                which="x"
                name={xName}
                isKnown={s.isXKnown}
                value={s.x}
                min={s.xMin}
                max={s.xMax}
                step={s.snap}
                set={coordinatePlane.actions.setX}
                call={call}
              />
              {!isLine && (
                <NumberInput
                  which="y"
                  name={yName}
                  isKnown={s.isYKnown}
                  value={s.y}
                  min={s.yMin}
                  max={s.yMax}
                  step={s.snap}
                  set={coordinatePlane.actions.setY}
                  call={call}
                />
              )}
            </div>
          )}
          {s.pairs.length > 0 && (
            <div class="cp-pairs">
              {s.pairs.map((p) => (
                <SymbolButton
                  key={`${p.x},${p.y}`}
                  symbol={pairText(p.x, p.y)}
                  label={pairText(p.x, p.y)}
                  isWide
                  isOn={known && s.x === p.x && s.y === p.y}
                  {...does(coordinatePlane.actions.movePoint, { x: p.x, y: p.y }, `${p.x},${p.y}`)}
                />
              ))}
            </div>
          )}
          <div class="cp-buttons">
            {isLine && s.canAddYAxis && (
              <SymbolButton
                symbol={s.addYAxisLabel[locale]}
                label={s.addYAxisLabel[locale]}
                isWide
                {...does(coordinatePlane.actions.addYAxis)}
              />
            )}
            {s.canWalkBoth && (
              <SymbolButton
                symbol={s.walkBothLabel[locale]}
                label={s.walkBothLabel[locale]}
                isWide
                isEnabled={known}
                {...does(coordinatePlane.actions.walkBoth)}
              />
            )}
            {s.canWalk && (
              <SymbolButton
                symbol={s.walkLabel[locale]}
                label={s.walkLabel[locale]}
                isWide
                isEnabled={known}
                {...does(coordinatePlane.actions.walk)}
              />
            )}
            {s.canWalk && (
              <SymbolButton
                symbol={s.swapLabel[locale]}
                label={s.swapLabel[locale]}
                isWide
                isEnabled={known && s.x !== s.y}
                {...does(coordinatePlane.actions.swap)}
              />
            )}
            {(s.canWalk || s.showLines) && (
              <SymbolButton
                symbol="↺"
                label={s.againLabel[locale]}
                isEnabled={
                  s.marks.length > 0 || s.isWalkerOut || (s.showLines && (s.isXKnown || s.isYKnown))
                }
                {...does(coordinatePlane.actions.startAgain)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
