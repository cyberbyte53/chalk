import { SymbolButton } from "@chalk/draw";
import { type FramePixels, does, isLayerOn, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { type LayerView, actions } from "./layer-view";
import { isInWindow } from "./plane";
import type { PlaneView } from "./plane-view";
import { plotting } from "./plotting";
import { WORDS, num, pair, word } from "./words";

/** The dots plotted so far, right or wrong, each with its swap when asked. */
function PlottedDraw({ s, px }: { s: PlaneView; px: FramePixels }): JSX.Element {
  return (
    <g class="cp-plotted">
      {s.plotted.map((d, i) => {
        // At a smaller scale a dot can fall off the plane: it isn't drawn there.
        if (!isInWindow(s.window, d)) return null;
        const [x, y] = px.toPx(d.x, d.y);
        const swap = { x: d.y, y: d.x };
        const isSwapShown = s.showSwaps && d.isRight && d.x !== d.y && isInWindow(s.window, swap);
        const [sx, sy] = px.toPx(swap.x, swap.y);
        return (
          <g key={i} class={`cp-dot${d.isRight ? " is-right" : " is-wrong"}`}>
            {isSwapShown && (
              <>
                <line class="cp-swap-line" x1={x} y1={y} x2={sx} y2={sy} />
                <circle class="cp-swap" cx={sx} cy={sy} r={5} />
                <text class="cp-swap-label" x={sx + 8} y={sy - 8}>
                  {pair(swap)}
                </text>
              </>
            )}
            <circle cx={x} cy={y} r={6} />
            <text x={x + 9} y={y - 9}>
              {pair(d)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** The plotting layer's drawing: the table, the dots plotted, the next pair, the scales. */
export const plottingView: LayerView = {
  isOn: (s) => isLayerOn(plotting, s),
  above: ({ s }) =>
    !s.showTable ? null : (
      <table class="cp-table" {...shows("table", s.toPlot)}>
        <tbody>
          <tr>
            <th>x</th>
            {s.toPlot.map((p, i) => (
              <td key={i} class={i === s.plotted.length ? "is-next" : undefined}>
                {num(p.x)}
              </td>
            ))}
          </tr>
          <tr>
            <th>y</th>
            {s.toPlot.map((p, i) => (
              <td key={i} class={i === s.plotted.length ? "is-next" : undefined}>
                {num(p.y)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    ),
  over: ({ s, px }) => <PlottedDraw s={s} px={px} />,
  lines: ({ s }) => {
    const next = s.toPlot[s.plotted.length];
    return next === undefined ? null : (
      <p class="cp-line" {...shows("next", next, pair(next))}>
        {pair(next)}
      </p>
    );
  },
  controls: ({ s, locale }) => (
    <>
      {s.scaleChoices.map((every, i) => (
        <SymbolButton
          key={i}
          symbol={`${word(WORDS.scale, locale)} ${num(every)}`}
          label={`${word(WORDS.scale, locale)} ${num(every)}`}
          isWide
          isOn={s.tickEvery === every}
          {...does(actions.setScale, { every }, i)}
        />
      ))}
      {s.plotted.length > 0 && (
        <SymbolButton
          symbol="↺"
          label={word(WORDS.clear, locale)}
          {...does(actions.clearPlotted)}
        />
      )}
    </>
  ),
};
