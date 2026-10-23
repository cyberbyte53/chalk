import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Axes, frameOf } from "./chart";
import { type Words, numText, say } from "./numbers";
import {
  OgiveAction,
  OgivePart,
  OgiveShow,
  type OgiveState,
  plottedPoints,
  pointCount,
  readMedian,
} from "./ogive";
import { totalOf } from "./stats";
import { Button } from "./ui";

const WORDS = {
  plot: { en: "Plot next point", hi: "अगला बिंदु अंकित करो" },
  all: { en: "Plot all", hi: "सभी अंकित करो" },
  median: { en: "Read the median", hi: "माध्यक पढ़ो" },
  less: { en: "less than", hi: "से कम प्रकार" },
  more: { en: "more than", hi: "से अधिक प्रकार" },
  medianIs: { en: "Median", hi: "माध्यक" },
} as const satisfies Record<string, Words>;

const path = (pts: [number, number][], toX: (x: number) => number, toY: (y: number) => number) =>
  pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${toX(x).toFixed(1)} ${toY(y).toFixed(1)}`)
    .join(" ");

export function OgiveView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as OgiveState;
  const lo = s.rows[0]?.lo ?? 0;
  const hi = s.rows[s.rows.length - 1]?.hi ?? 1;
  const n = totalOf(s.rows);
  const yMax = n * 1.1;
  const height = 230;
  const frame = frameOf(width, height, [lo, hi], yMax, {
    left: 34,
    right: 14,
    top: 22,
    bottom: 34,
  });
  const { less, more } = plottedPoints(s);
  const isAll = s.plotted === pointCount(s);
  const median = readMedian(s);
  const half = n / 2;
  const ticks = [lo, ...s.rows.map((r) => r.hi)];
  return (
    <div class="dt-ogive">
      <Stage
        label="Ogive graph"
        x={[0, width]}
        width={width}
        height={height}
        svg={{ class: "dt-svg" }}
      >
        <g data-part={OgivePart.Graph}>
          <Axes
            frame={frame}
            xTicks={ticks}
            yMax={yMax}
            xName={say(locale, s.classHeading)}
            yName={`cf (${say(locale, s.freqHeading)})`}
          />
          {less.length > 1 && (
            <path class="dt-curve is-less" d={path(less, frame.toX, frame.toY)} />
          )}
          {more.length > 1 && (
            <path class="dt-curve is-more" d={path(more, frame.toX, frame.toY)} />
          )}
          {less.map(([x, y]) => (
            <circle
              key={`l${x}`}
              class="dt-point is-less"
              cx={frame.toX(x)}
              cy={frame.toY(y)}
              r={3.5}
            />
          ))}
          {more.map(([x, y]) => (
            <circle
              key={`m${x}`}
              class="dt-point is-more"
              cx={frame.toX(x)}
              cy={frame.toY(y)}
              r={3.5}
            />
          ))}
          {isAll && s.show !== OgiveShow.MoreThan && (
            <text
              class="dt-curve-name is-less"
              x={frame.right - 4}
              y={frame.toY(n) - 6}
              text-anchor="end"
            >
              {say(locale, WORDS.less)}
            </text>
          )}
          {isAll && s.show !== OgiveShow.LessThan && (
            <text class="dt-curve-name is-more" x={frame.left + 6} y={frame.toY(n) - 6}>
              {say(locale, WORDS.more)}
            </text>
          )}
          {s.isMedianShown && median !== null && (
            <g class="dt-reading">
              {s.show !== OgiveShow.Both && (
                <>
                  <line
                    x1={frame.left}
                    x2={frame.toX(median)}
                    y1={frame.toY(half)}
                    y2={frame.toY(half)}
                  />
                  <text x={frame.left + 4} y={frame.toY(half) - 4}>{`n/2 = ${numText(half)}`}</text>
                </>
              )}
              <line
                x1={frame.toX(median)}
                x2={frame.toX(median)}
                y1={frame.toY(half)}
                y2={frame.bottom}
              />
              <circle cx={frame.toX(median)} cy={frame.toY(half)} r={4.5} />
              <circle cx={frame.toX(median)} cy={frame.bottom} r={3.5} />
            </g>
          )}
        </g>
      </Stage>
      {s.isMedianShown && median !== null && (
        <p class="dt-verdict" data-part={OgivePart.Result}>
          {`${say(locale, WORDS.medianIs)} ≈ ${numText(median)}`}
        </p>
      )}
      <div class="dt-controls">
        {s.canPlot && !isAll && (
          <>
            <Button
              isWide
              label={say(locale, WORDS.plot)}
              part={OgivePart.Plot}
              onPress={() => call(OgiveAction.PlotNext, {})}
            >
              {say(locale, WORDS.plot)}
            </Button>
            <Button
              isWide
              label={say(locale, WORDS.all)}
              part={OgivePart.All}
              onPress={() => call(OgiveAction.PlotAll, {})}
            >
              {say(locale, WORDS.all)}
            </Button>
          </>
        )}
        {s.canShowMedian && isAll && !s.isMedianShown && (
          <Button
            isWide
            label={say(locale, WORDS.median)}
            part={OgivePart.Median}
            onPress={() => call(OgiveAction.ShowMedian, {})}
          >
            {say(locale, WORDS.median)}
          </Button>
        )}
      </div>
    </div>
  );
}
