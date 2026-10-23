import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { AngleArc, VertexLabel, centreOf, fitPoints, pathOf } from "./draw";
import { type Pt, type Words, numText, say } from "./geometry";
import {
  SimilarAction,
  SimilarPair,
  SimilarPart,
  type SimilarState,
  anglesEqualOf,
  anglesFirstOf,
  anglesSecondOf,
  isSimilarOf,
  polygonsOf,
  ratiosEqualOf,
  ratiosOf,
  vertexCount,
} from "./similar";
import { Nudger } from "./ui";

const WORDS = {
  similar: { en: "Similar", hi: "समरूप" },
  notSimilar: { en: "Not similar", hi: "समरूप नहीं" },
  anglesYes: { en: "angles equal", hi: "कोण बराबर" },
  anglesNo: { en: "angles not equal", hi: "कोण बराबर नहीं" },
  ratiosYes: { en: "sides in one ratio", hi: "भुजाएँ एक ही अनुपात में" },
  ratiosNo: { en: "sides not in one ratio", hi: "भुजाएँ एक अनुपात में नहीं" },
  bulb: { en: "bulb", hi: "बल्ब" },
  angle: { en: "angle", hi: "कोण" },
  card: { en: "card", hi: "गत्ता" },
  shadow: { en: "shadow", hi: "छाया" },
} as const satisfies Record<string, Words>;

const H = 200;

export function SimilarView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as SimilarState;
  const n = vertexCount(s);
  const f = s.firstNames.slice(0, n);
  const g = s.secondNames.slice(0, n);
  const { first, second } = polygonsOf(s);
  const ratios = ratiosOf(s);
  const a1 = anglesFirstOf(s);
  const a2 = anglesSecondOf(s);
  const similar = isSimilarOf(s);
  const isShadow = s.pair === SimilarPair.Shadow;

  let firstPx: Pt[];
  let secondPx: Pt[];
  let bulb: Pt | null = null;
  if (isShadow) {
    // O above; the card a little below it, the shadow k times as far along every ray.
    const c = centreOf(first);
    const lift = 1.6;
    const v = first.map((p): Pt => [p[0] - c[0], p[1] - c[1] - lift]);
    const card = v.map((p): Pt => [p[0], p[1]]);
    const shade = v.map((p): Pt => [p[0] * s.scale, p[1] * s.scale]);
    const fit = fitPoints(
      [[0, 0], ...card, ...shade],
      { left: 0, top: 6, width, height: H - 6 },
      22,
    );
    bulb = fit.px([0, 0]);
    firstPx = card.map(fit.px);
    secondPx = shade.map(fit.px);
  } else {
    const half = width / 2;
    // One scale for both, so the sizes compare honestly.
    const spanX = (pts: readonly Pt[]) =>
      Math.max(...pts.map((p) => p[0])) - Math.min(...pts.map((p) => p[0]));
    const spanY = (pts: readonly Pt[]) =>
      Math.max(...pts.map((p) => p[1])) - Math.min(...pts.map((p) => p[1]));
    const k = Math.min(
      (half - 40) / Math.max(spanX(first), 1e-6),
      (half - 40) / Math.max(spanX(second), 1e-6),
      (H - 50) / Math.max(spanY(first), spanY(second), 1e-6),
    );
    const place = (pts: readonly Pt[], left: number): Pt[] => {
      const minX = Math.min(...pts.map((p) => p[0]));
      const maxX = Math.max(...pts.map((p) => p[0]));
      const minY = Math.min(...pts.map((p) => p[1]));
      const ox = left + (half - (maxX - minX) * k) / 2 - minX * k;
      const oy = H - 22 + minY * k;
      return pts.map((p): Pt => [ox + p[0] * k, oy - p[1] * k]);
    };
    firstPx = place(first, 0);
    secondPx = place(second, half);
  }
  const shape = (pts: Pt[], names: string[], angles: number[], cls: string, part: string) => {
    const c = centreOf(pts);
    return (
      <g data-part={part}>
        <path class={cls} d={pathOf(pts)} />
        {s.showAngles &&
          pts.map((v, i) => (
            <AngleArc
              key={`a${names[i]}`}
              v={v}
              p={pts[(i + n - 1) % n] as Pt}
              q={pts[(i + 1) % n] as Pt}
              r={11}
              label={`${angles[i]}°`}
            />
          ))}
        {pts.map((v, i) => (
          <VertexLabel key={`v${names[i]}`} at={v} centre={c} text={names[i] as string} gap={12} />
        ))}
      </g>
    );
  };
  const label = similar ? say(locale, WORDS.similar) : say(locale, WORDS.notSimilar);
  return (
    <div class="tg tg-similar">
      <Stage
        label={`${f.join("")} and ${g.join("")}: ${label.toLowerCase()}`}
        x={[0, width]}
        width={width}
        height={H}
        svg={{ class: "tg-svg" }}
      >
        {bulb !== null && (
          <g data-part={SimilarPart.Bulb}>
            {secondPx.map((p, i) => (
              <line
                key={`r${p[0].toFixed(1)}-${p[1].toFixed(1)}`}
                class="tg-ray"
                x1={bulb?.[0]}
                y1={bulb?.[1]}
                x2={p[0]}
                y2={p[1]}
              />
            ))}
            <circle class="tg-bulb-glow" cx={bulb[0]} cy={bulb[1]} r={11} />
            <circle class="tg-bulb" cx={bulb[0]} cy={bulb[1]} r={5} />
            <text class="tg-note" x={bulb[0] + 14} y={bulb[1] + 4}>
              {`O (${say(locale, WORDS.bulb)})`}
            </text>
          </g>
        )}
        {shape(secondPx, g, a2, isShadow ? "tg-shade" : "tg-shape-2", SimilarPart.Second)}
        {shape(firstPx, f, a1, "tg-shape-1", SimilarPart.First)}
      </Stage>
      {s.showRatios && (
        <div class="tg-readout" data-part={SimilarPart.Ratios}>
          {f.map((v, i) => (
            <span key={v} class="tg-chip">
              {`${g[i]}${g[(i + 1) % n]} / ${v}${f[(i + 1) % n]} = ${numText(ratios[i] as number)}`}
            </span>
          ))}
        </div>
      )}
      {s.showVerdict && (
        <p class={`tg-verdict ${similar ? "is-on" : "is-off"}`} data-part={SimilarPart.Verdict}>
          {`${label}: ${say(locale, anglesEqualOf(s) ? WORDS.anglesYes : WORDS.anglesNo)}, ${say(
            locale,
            ratiosEqualOf(s) ? WORDS.ratiosYes : WORDS.ratiosNo,
          )}`}
        </p>
      )}
      {(s.canScale || (s.canSetAngle && s.pair === SimilarPair.SquareRhombus)) && (
        <div class="tg-controls">
          {s.canScale && (
            <Nudger
              name="k"
              value={numText(s.scale)}
              part={SimilarPart.Scale}
              canDown={s.scale > 0.5}
              canUp={s.scale < 3}
              onNudge={(by) => call(SimilarAction.NudgeScale, { by })}
            />
          )}
          {s.canSetAngle && s.pair === SimilarPair.SquareRhombus && (
            <Nudger
              name={say(locale, WORDS.angle)}
              value={`${s.angle}°`}
              part={SimilarPart.Angle}
              canDown={s.angle > 30}
              canUp={s.angle < 90}
              onNudge={(by) => call(SimilarAction.NudgeAngle, { by })}
            />
          )}
        </div>
      )}
    </div>
  );
}
