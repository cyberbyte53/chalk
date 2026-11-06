import type { Locale } from "@chalk/content";
import { SymbolButton, useLabel } from "@chalk/draw";
import { type PropView, useDrags } from "@chalk/player";
import { type FramePixels, does, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { useRef } from "preact/hooks";
import { drawing } from "./layer-view";
import { type Zeroes, parabola, spanOf, valueAt } from "./parabola";
import { unitOf } from "./plane-view";
import { WORDS, num, word } from "./words";

type ParabolaView = PropView<typeof parabola>;
const actions = parabola.actions;

/** Points along the curve, for its path: enough that it reads smooth on any phone. */
const SAMPLES = 240;

/** Where the tracing point is now, in x: as far along its span as it has traced. */
const headOf = (s: ParabolaView): number => {
  const [from, to] = spanOf(s, s.window);
  return from + (to - from) * s.traced;
};

/**
 * The curve, drawn up to the tracing point (all of it once traced), cut off at the plane's edges:
 * a nested picture the size of the window clips it, so no id is needed.
 */
function CurveDraw({ s, px }: { s: ParabolaView; px: FramePixels }): JSX.Element {
  const w = s.window;
  const [from, to] = spanOf(s, w);
  const head = headOf(s);
  // Drawn from the window's left edge (the span is only where the trace starts), so the curve
  // runs off the top of the plane rather than stopping at it.
  const left = s.traced >= 1 ? w.xMin : from;
  const right = s.traced >= 1 ? w.xMax : head;
  const n = Math.max(2, Math.round((SAMPLES * (right - left)) / (w.xMax - w.xMin)));
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = left + ((right - left) * i) / n;
    const [X, Y] = px.toPx(x, valueAt(s, x));
    pts.push(`${X.toFixed(1)},${Y.toFixed(1)}`);
  }
  const [x0, y0] = px.toPx(w.xMin, w.yMax);
  const [x1, y1] = px.toPx(w.xMax, w.yMin);
  const box = { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
  const r = Math.max(3.5, Math.min(6, unitOf(px) * 0.15));
  // A dot at each whole number x it has reached: its table of values, piling up as it goes.
  const values: number[] = [];
  if (s.showsValues)
    for (let x = Math.ceil(w.xMin); x <= Math.min(w.xMax, head + 1e-9); x++)
      if (x >= from - 1e-9) values.push(x);
  const h = (s.zeroes === null ? 0 : s.zeroes.alpha + s.zeroes.beta) / 2;
  const [hx] = px.toPx(h, 0);
  return (
    <g class="cp-parabola" {...shows("curve", s.expanded, `y = ${s.expanded}`)}>
      <svg
        x={box.x}
        y={box.y}
        width={box.width}
        height={box.height}
        viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
        overflow="hidden"
      >
        <title>{`y = ${s.expanded}`}</title>
        {s.showsSymmetry && (
          <line class="cp-parabola-symmetry" x1={hx} y1={box.y} x2={hx} y2={box.y + box.height} />
        )}
        <polyline class="cp-parabola-curve" points={pts.join(" ")} />
        {values.map((x) => {
          const [X, Y] = px.toPx(x, valueAt(s, x));
          return <circle key={x} class="cp-parabola-value" cx={X} cy={Y} r={r} />;
        })}
      </svg>
    </g>
  );
}

/** The point drawing the curve, and its height dropped to the x-axis, while it traces. */
function TracerDraw({ s, px }: { s: ParabolaView; px: FramePixels }): JSX.Element | null {
  if (s.traced <= 0 || s.traced >= 1) return null;
  const w = s.window;
  const x = headOf(s);
  const y = valueAt(s, x);
  const inside = Math.min(w.yMax, Math.max(w.yMin, y));
  const [X, Y] = px.toPx(x, inside);
  const [, Y0] = px.toPx(x, 0);
  const isIn = y >= w.yMin && y <= w.yMax;
  return (
    <g class="cp-parabola-tracer" {...shows("tracer", { x: Number(x.toFixed(2)), y })}>
      <line class="cp-drop" x1={X} y1={Y0} x2={X} y2={Y} />
      {isIn && (
        <>
          <circle class="cp-parabola-glow" cx={X} cy={Y} r={14} />
          <circle class="cp-parabola-head" cx={X} cy={Y} r={6.5} />
        </>
      )}
    </g>
  );
}

/**
 * A zero's name (α, β) beside its handle, placed with the plane's other labels: clear of the axis
 * numbers and the curve, touching only its own handle (the element just before it).
 */
function ZeroName({ x, y, name }: { x: number; y: number; name: string }): JSX.Element {
  const ref = useRef<SVGTextElement>(null);
  useLabel(ref, () => ({ gap: 6, own: ref.current?.previousElementSibling ?? null }));
  return (
    <text ref={ref} class="cp-parabola-zero-name" x={x + 12} y={y - 12}>
      {name}
    </text>
  );
}

/** A number as the screen writes it: to two places. */
const shown = (v: number) => num(Number(v.toFixed(2)));

const NAMES: Record<keyof Zeroes, string> = { alpha: "α", beta: "β" };

/**
 * Its zeroes on the x-axis: while it is held by them, a handle on each to drag (α and β); lifted,
 * a dot where it meets the axis now, if it does. Each shows once the trace has reached it.
 */
function ZeroesDraw({ s, px }: { s: ParabolaView; px: FramePixels }): JSX.Element | null {
  const drag = useDrags();
  if (s.zeroes === null) return null;
  const head = s.traced >= 1 ? Number.POSITIVE_INFINITY : headOf(s);
  const w = s.window;
  const vertex = s.vertex;
  const [vx, vy] = px.toPx(vertex.x, vertex.y);
  const isVertexIn = vertex.y >= w.yMin && vertex.y <= w.yMax && vertex.x <= head;
  const zeroes = s.zeroes;
  const isMet = shown(zeroes.alpha) === shown(zeroes.beta);
  return (
    <g class="cp-parabola-zeroes">
      {isVertexIn && !s.isTouching && <circle class="cp-parabola-vertex" cx={vx} cy={vy} r={5} />}
      {s.canMoveZeroes
        ? (["alpha", "beta"] as const).map((which) => {
            const x = zeroes[which];
            if (x > head) return null;
            const [X, Y] = px.toPx(x, 0);
            const move = which === "alpha" ? actions.moveAlpha : actions.moveBeta;
            return (
              <g key={which} {...shows(which, x, `${NAMES[which]} = ${num(x)}`)}>
                <circle
                  class="cp-parabola-zero is-handle"
                  {...drag({
                    axis: "x",
                    at: { x, y: 0 },
                    place: (to) => ({
                      x: Math.min(w.xMax, Math.max(w.xMin, Math.round(to.x / s.step) * s.step)),
                      y: 0,
                    }),
                    move,
                    step: s.step,
                    words: `${NAMES[which]} = ${num(x)}`,
                  })}
                  cx={X}
                  cy={Y}
                  r={10}
                />
                {/* Met, they are one point: one name for both. */}
                {!(isMet && which === "alpha") && (
                  <ZeroName x={X} y={Y} name={isMet ? "α = β" : NAMES[which]} />
                )}
              </g>
            );
          })
        : s.realZeroes
            .filter((x) => x <= head && x >= w.xMin && x <= w.xMax)
            .map((x) => {
              const [X, Y] = px.toPx(x, 0);
              return <circle key={x} class="cp-parabola-zero" cx={X} cy={Y} r={7} />;
            })}
    </g>
  );
}

/** Its zeroes in words: two, one (it touches), or none. */
function zeroWords(s: ParabolaView, locale: Locale): string {
  const z0 = s.realZeroes;
  if (z0.length === 0) return word(WORDS.noZeroes, locale);
  // Two that read the same (the last moment of a slide together) read as the one they become.
  if (z0.length === 1 || (z0.length === 2 && shown(z0[0] as number) === shown(z0[1] as number)))
    return `${word(WORDS.oneZero, locale)}: ${shown(z0[0] as number)} (${word(WORDS.touches, locale)})`;
  return `${word(WORDS.zeroes, locale)}: ${shown(z0[0] as number)} ${word(WORDS.and, locale)} ${shown(z0[1] as number)}`;
}

/** Its expression: y = x² − 2x − 3 = (x + 1)(x − 3); lifted, the first alone. */
const expressionOf = (s: ParabolaView): string =>
  s.factored === null || s.factored === s.expanded
    ? `y = ${s.expanded}`
    : `y = ${s.expanded} = ${s.factored}`;

/** The parabola's drawing: the curve on the lines, its zeroes in front, its expression below. */
export const parabolaDrawing = drawing(parabola, {
  on: ({ s, px }) => <CurveDraw s={s} px={px} />,
  front: ({ s, px }) => (
    <>
      <TracerDraw s={s} px={px} />
      <ZeroesDraw s={s} px={px} />
    </>
  ),
  below: ({ s, locale }) =>
    !s.showsExpression ? null : (
      <div class="cp-parabola-words">
        <p
          class="cp-line cp-parabola-expression"
          {...shows("expression", s.expanded, expressionOf(s))}
        >
          {/* Each side whole on its line: a narrow screen breaks it at its "=". */}
          <span class="cp-parabola-side">y = {s.expanded}</span>
          {expressionOf(s) !== `y = ${s.expanded}` && (
            <span class="cp-parabola-side"> = {s.factored}</span>
          )}
        </p>
        <p
          class="cp-line cp-parabola-count"
          {...shows("zeroes", s.realZeroes, zeroWords(s, locale))}
        >
          {zeroWords(s, locale)}
        </p>
      </div>
    ),
  controls: ({ s, locale }) =>
    !s.canFlip ? null : (
      <SymbolButton
        symbol={word(WORDS.flip, locale)}
        label={word(WORDS.flip, locale)}
        isWide
        {...does(actions.flip)}
      />
    ),
});
