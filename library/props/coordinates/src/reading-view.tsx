import { SymbolButton } from "@chalk/draw";
import { type PropView, useDrags } from "@chalk/player";
import { type FramePixels, does, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { drawing } from "./layer-view";
import { Reading, snapped } from "./reading";
import { reading } from "./reading";
import { WORDS, num, pair, word } from "./words";

type ReadingView = PropView<typeof reading>;
const actions = reading.actions;

/** The point the learner drags, read off the axes as far as the board writes it. */
function ReadingDraw({ s, px }: { s: ReadingView; px: FramePixels }): JSX.Element | null {
  const drag = useDrags();
  const p = s.point;
  if (p === null) return null;
  const [x, y] = px.toPx(p.x, p.y);
  const [ax, base] = px.toPx(p.x, 0);
  const [vx, ay] = px.toPx(0, p.y);
  const stage = s.reading;
  const isHidden = s.isReadingHidden;
  const hasLines = stage !== Reading.None && !isHidden;
  const hasLengths = (stage === Reading.Distances || stage === Reading.Abscissa) && !isHidden;
  const signed = stage === Reading.Abscissa;
  const unit = s.unit === "" ? "" : `\u00a0${s.unit}`;
  const xWords = signed ? `x = ${num(p.x)}${unit}` : `${num(Math.abs(p.x))}${unit}`;
  const yWords = signed ? `y = ${num(p.y)}${unit}` : `${num(Math.abs(p.y))}${unit}`;
  const words = isHidden
    ? "?"
    : stage === Reading.Pair
      ? pair(p)
      : hasLengths
        ? `${xWords}, ${yWords}`
        : "";
  return (
    <g class="cp-reading">
      {hasLines && (
        <>
          <line class="cp-drop" x1={x} y1={y} x2={ax} y2={base} />
          <line class="cp-drop" x1={x} y1={y} x2={vx} y2={ay} />
        </>
      )}
      {hasLengths && p.y !== 0 && (
        <text class="cp-length" x={ax + 6} y={(y + base) / 2} dominant-baseline="central">
          {yWords}
        </text>
      )}
      {hasLengths && p.x !== 0 && (
        <text class="cp-length" x={(x + vx) / 2} y={ay - 8} text-anchor="middle">
          {xWords}
        </text>
      )}
      <g {...shows("point", isHidden ? null : p, words === "" ? undefined : words)}>
        <circle
          class="cp-point"
          {...drag({
            axis: "xy",
            at: p,
            place: (to) => snapped(s, to),
            move: actions.movePoint,
            step: s.pointStep,
            words: isHidden ? "?" : pair(p),
          })}
          cx={x}
          cy={y}
          r={10}
        />
        {(stage === Reading.Pair || isHidden) && (
          <text class="cp-pair" x={x + 14} y={y - 12}>
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
