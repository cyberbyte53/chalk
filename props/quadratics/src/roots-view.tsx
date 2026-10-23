import { type PropViewProps, RichText } from "@chalk/player";
import { Coordinates, Line, Mafs, Plot, Point, Text } from "mafs";
import type { JSX } from "preact";
import { NATURE_WORDS, Nature, natureOf, numText, say } from "./quad";
import {
  RootsAction,
  RootsPart,
  type RootsState,
  discriminantLines,
  discriminantOf,
  equationLines,
} from "./roots";
import { Nudger } from "./ui";

const INK = "var(--color-primary)";
const ROOT = "var(--color-secondary)";
const LEVEL = "var(--color-on-surface-variant)";

const WORDS = {
  none: { en: "no real roots", hi: "कोई वास्तविक मूल नहीं" },
  roots: { en: "Roots:", hi: "मूल:" },
  level: { en: "height", hi: "ऊँचाई" },
} as const;

/**
 * Where a root's number goes: on the outer side of the root, on the side of the line the curve
 * isn't (Mafs' "n" draws below the point, "s" above). Two roots: the left one to the west, the
 * right one to the east; a touching root straight across from the curve.
 */
function labelSide(a: number, count: number, i: number): "n" | "s" | "nw" | "ne" | "sw" | "se" {
  const v = a > 0 ? "n" : "s";
  if (count < 2) return v;
  return i === 0 ? `${v}w` : `${v}e`;
}

/** Grid steps that keep the axis numbers readable. */
function gridStep(span: number): number {
  for (const s of [1, 2, 5, 10, 20, 50, 100, 200, 500]) if (span / s <= 10) return s;
  return 1000;
}

export function RootsView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as RootsState & { roots: number[]; rootsTex: string[] };
  const { xMin, xMax, yMin, yMax } = s.window;
  const height = Math.round(Math.min(340, Math.max(220, width * 0.72)));
  const f = (x: number) => s.a * x * x + s.b * x + s.c;
  const d = discriminantOf(s);
  const nature = natureOf(d);
  const xStep = gridStep(xMax - xMin);
  const yStep = gridStep(yMax - yMin);
  const unique = [...new Set(s.roots)];
  const v = s.variable;
  const nearRoot = (x: number) => unique.some((r) => Math.abs(r - x) < xStep * 0.4);
  const tone =
    nature === Nature.TwoDistinct ? "is-two" : nature === Nature.TwoEqual ? "is-one" : "is-none";
  return (
    <div class="qd-roots-graph">
      <div class="qd-mafs" data-part={RootsPart.Plane} style={{ height: `${height}px` }}>
        <Mafs
          width={width}
          height={height}
          viewBox={{ x: [xMin, xMax], y: [yMin, yMax], padding: 0 }}
          preserveAspectRatio={false}
          pan={false}
          zoom={false}
        >
          <Coordinates.Cartesian
            xAxis={{
              lines: xStep,
              labels: (x) => (x !== 0 && x > xMin && x < xMax && !nearRoot(x) ? String(x) : ""),
            }}
            yAxis={{
              lines: yStep,
              labels: (y) => (y !== 0 && y > yMin && y < yMax ? String(y) : ""),
            }}
          />
          {s.level !== 0 && (
            <>
              <Line.ThroughPoints
                point1={[xMin, s.level]}
                point2={[xMax, s.level]}
                style="dashed"
                color={LEVEL}
              />
              {s.levelLabel !== "" && (
                <Text x={xMax} y={s.level} attach="sw" attachDistance={8} size={13} color={LEVEL}>
                  {s.levelLabel}
                </Text>
              )}
            </>
          )}
          <Plot.OfX y={f} color={INK} weight={3} />
          {unique.map((r) => (
            <Point key={r} x={r} y={s.level} color={ROOT} />
          ))}
          {unique.map((r, i) => (
            <Text
              key={`l${r}`}
              x={r}
              y={s.level}
              attach={labelSide(s.a, unique.length, i)}
              attachDistance={14}
              size={14}
              color={ROOT}
            >
              {numText(r)}
            </Text>
          ))}
        </Mafs>
      </div>
      <div class="qd-readout">
        {s.showEquation && (
          <div class="qd-equation" data-part={RootsPart.Equation}>
            {equationLines(s).map((line) => (
              <p key={line}>
                <RichText text={`$${line}$`} />
              </p>
            ))}
          </div>
        )}
        {s.showDiscriminant && (
          <div class={`qd-discriminant ${tone}`} data-part={RootsPart.Discriminant}>
            {discriminantLines(s).map((line) => (
              <p key={line}>
                <RichText text={`$${line}$`} />
              </p>
            ))}
            <p class="qd-nature">
              <RichText
                text={`$D ${d > 0 ? ">" : d === 0 ? "=" : "<"} 0$: ${say(locale, NATURE_WORDS[nature])}`}
              />
            </p>
          </div>
        )}
        {s.showRoots && (
          <p class="qd-roots" data-part={RootsPart.Roots}>
            {s.rootsTex.length === 0 ? (
              say(locale, WORDS.none)
            ) : (
              <RichText
                text={`${say(locale, WORDS.roots)} ${[...new Set(s.rootsTex)].map((r) => `$${v} = ${r}$`).join(", ")}`}
              />
            )}
          </p>
        )}
        {s.canSet.length > 0 && (
          <div class="qd-controls" data-part={RootsPart.Steppers}>
            {s.canSet.map((name) => (
              <Nudger
                key={name}
                name={name}
                value={numText(s[name])}
                onNudge={(by) => call(RootsAction.Nudge, { name, by })}
              />
            ))}
          </div>
        )}
        {s.canSetLevel && (
          <div class="qd-controls" data-part={RootsPart.Level}>
            <Nudger
              name={`${s.yName}`}
              value={numText(s.level)}
              onNudge={(by) => call(RootsAction.SetLevel, { level: s.level + by * s.step })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
