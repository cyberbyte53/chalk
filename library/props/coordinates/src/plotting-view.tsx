import type { Locale } from "@chalk/content";
import { SymbolButton, useLabel } from "@chalk/draw";
import { type PropView, useDrags } from "@chalk/player";
import { type FramePixels, does, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { useRef } from "preact/hooks";
import { drawing } from "./layer-view";
import { isInWindow } from "./plane";
import { plotting } from "./plotting";
import { WORDS, num, pair, word } from "./words";

type PlottingView = PropView<typeof plotting>;
const actions = plotting.actions;

/**
 * A dot's pair, beside it where it is clear of every other word, dot and axis: above right first,
 * then round the dot, placed with the plane's other labels. Its own dot (the element just before
 * it) it may touch.
 */
function DotLabel({
  x,
  y,
  said,
  class: cls,
}: { x: number; y: number; said: string; class?: string }) {
  const ref = useRef<SVGTextElement>(null);
  useLabel(ref, () => ({
    spots: [
      [x + 9, y - 9, "start"],
      [x - 9, y - 9, "end"],
      [x + 9, y + 18, "start"],
      [x - 9, y + 18, "end"],
      [x, y - 13, "middle"],
      [x, y + 22, "middle"],
      [x + 11, y + 4, "start"],
      [x - 11, y + 4, "end"],
      // Further out, past a tick's number or the axis beside it.
      [x + 14, y - 22, "start"],
      [x - 14, y - 22, "end"],
      [x + 14, y + 30, "start"],
      [x - 14, y + 30, "end"],
    ],
    // Clear of everything drawn but what is coverable and its own dot, by a wider gap than words
    // keep; and nearer its own dot than any other, as the pair would read as that dot's.
    gap: 8,
    own: ref.current?.previousElementSibling ?? null,
    isNearOwn: true,
  }));
  return (
    <text ref={ref} class={cls} x={x + 9} y={y - 9}>
      {said}
    </text>
  );
}

/** The dots plotted so far, right or wrong, each with its swap when asked. */
function PlottedDraw({ s, px }: { s: PlottingView; px: FramePixels }): JSX.Element {
  return (
    <g class="cp-plotted">
      {s.plotted.map((d, i) => {
        // At a smaller scale a dot can fall off the plane: it isn't drawn there.
        if (!isInWindow(s.window, d)) return null;
        const [x, y] = px.toPx(d.x, d.y);
        const swap = { x: d.y, y: d.x };
        const isSwapShown = s.showSwaps && d.isRight && d.x !== d.y && isInWindow(s.window, swap);
        // A swap already plotted is only joined: drawn twice, its name would be written twice.
        const isSwapPlotted = s.plotted.some((q) => q.x === swap.x && q.y === swap.y);
        const [sx, sy] = px.toPx(swap.x, swap.y);
        return (
          <g key={i} class={`cp-dot${d.isRight ? " is-right" : " is-wrong"}`}>
            {isSwapShown && (
              <>
                <line class="cp-swap-line" x1={x} y1={y} x2={sx} y2={sy} />
                {!isSwapPlotted && (
                  <>
                    <circle class="cp-swap" cx={sx} cy={sy} r={5} />
                    <DotLabel class="cp-swap-label" x={sx} y={sy} said={pair(swap)} />
                  </>
                )}
              </>
            )}
            {/* Equal numbers: the swap is the same point, a ring round the dot itself. */}
            {s.showSwaps && d.x === d.y && <circle class="cp-swap-self" cx={x} cy={y} r={11} />}
            <circle cx={x} cy={y} r={6} />
            <DotLabel x={x} y={y} said={pair(d)} />
          </g>
        );
      })}
    </g>
  );
}

/**
 * The next pair's dot, at O until dragged: let go, it is dropped (`plotAt`), snapped to the step and
 * kept inside the plane. The dot is the part pressed; it is drawn over the kept dots.
 */
function NextDot({ s, px }: { s: PlottingView; px: FramePixels }): JSX.Element | null {
  const drag = useDrags();
  const next = s.toPlot[s.plotted.length];
  if (next === undefined) return null;
  const [x, y] = px.toPx(s.dot.x, s.dot.y);
  const snap = (v: number) => Number((Math.round(v / s.step) * s.step).toFixed(6));
  const inside = (v: number, lo: number, hi: number) =>
    Math.min(Math.floor(hi / s.step) * s.step, Math.max(Math.ceil(lo / s.step) * s.step, v));
  return (
    <circle
      class="cp-point cp-plot-dot"
      {...drag({
        axis: "xy",
        at: s.dot,
        place: (to) => ({
          x: inside(snap(to.x), s.window.xMin, s.window.xMax),
          y: inside(snap(to.y), s.window.yMin, s.window.yMax),
        }),
        move: actions.moveDot,
        release: { action: actions.plotAt },
        step: s.step,
        words: pair(next),
      })}
      cx={x}
      cy={y}
      r={9}
    />
  );
}

/** A scale in the book's words: "1 square = 2 units". */
const scaleWords = (every: number, locale: Locale) =>
  `${word(WORDS.oneSquare, locale)} ${num(every)} ${word(every === 1 ? WORDS.unit : WORDS.units, locale)}`;

/** The plotting layer's drawing: the table, the dots plotted, the next pair, the scales. */
export const plottingDrawing = drawing(plotting, {
  above: ({ s, locale }) =>
    !s.showTable ? null : (
      <table class="cp-table" {...shows("table", s.toPlot)}>
        <tbody>
          <tr>
            <th>{word(s.axisNames[0], locale)}</th>
            {s.toPlot.map((p, i) => (
              <td key={i} class={i === s.plotted.length ? "is-next" : undefined}>
                {num(p.x)}
              </td>
            ))}
          </tr>
          <tr>
            <th>{word(s.axisNames[1], locale)}</th>
            {s.toPlot.map((p, i) => (
              <td key={i} class={i === s.plotted.length ? "is-next" : undefined}>
                {num(p.y)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    ),
  front: ({ s, px }) => (
    <>
      <PlottedDraw s={s} px={px} />
      <NextDot s={s} px={px} />
    </>
  ),
  below: ({ s, locale }) => {
    const next = s.toPlot[s.plotted.length];
    return next === undefined ? null : (
      <p class="cp-line" {...shows("next", next, pair(next))}>
        {word(WORDS.next, locale)} <strong>{pair(next)}</strong>
      </p>
    );
  },
  controls: ({ s, locale }) => (
    <>
      {s.scaleChoices.map((every, i) => (
        <SymbolButton
          key={i}
          symbol={scaleWords(every, locale)}
          label={scaleWords(every, locale)}
          isWide
          isOn={s.tickEvery === every}
          {...does(actions.chooseScale, { every }, i)}
        />
      ))}
    </>
  ),
});
