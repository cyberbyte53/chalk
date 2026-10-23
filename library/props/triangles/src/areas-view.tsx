import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { AreaAction, AreaMode, AreaPart, type AreaState, areaRatioOf, isHalfOf } from "./areas";
import { ParallelMark, VertexLabel, centreOf, fitPoints, pathOf } from "./draw";
import { type Pt, type Words, lerp, numText, say } from "./geometry";
import { Button, Nudger } from "./ui";

const WORDS = {
  small: { en: "small triangles", hi: "छोटे त्रिभुज" },
  sides: { en: "Sides", hi: "भुजाएँ" },
  areas: { en: "areas", hi: "क्षेत्रफल" },
  half: { en: "exactly half the area", hi: "ठीक आधा क्षेत्रफल" },
  first: { en: "first", hi: "पहला" },
  second: { en: "second", hi: "दूसरा" },
} as const satisfies Record<string, Words>;

const H = 200;
const R3 = Math.sqrt(3) / 2;

/** A triangle of side n units made of n² small triangles, apex at (cx, top), unit u px. */
function Grid({
  n,
  cx,
  top,
  u,
  tone,
}: { n: number; cx: number; top: number; u: number; tone: string }): JSX.Element {
  const h = u * R3;
  const tris: JSX.Element[] = [];
  for (let i = 0; i < n; i++) {
    const yt = top + i * h;
    const yb = yt + h;
    const x0 = cx - ((i + 1) * u) / 2;
    for (let j = 0; j <= i; j++) {
      const p: Pt[] = [
        [x0 + j * u, yb],
        [x0 + (j + 1) * u, yb],
        [x0 + j * u + u / 2, yt],
      ];
      tris.push(<path key={`u${i}-${j}`} class={`tg-tile ${tone}`} d={pathOf(p)} />);
    }
    for (let j = 0; j < i; j++) {
      const p: Pt[] = [
        [x0 + j * u + u / 2, yt],
        [x0 + (j + 1) * u + u / 2, yt],
        [x0 + (j + 1) * u, yb],
      ];
      tris.push(<path key={`d${i}-${j}`} class={`tg-tile ${tone} is-down`} d={pathOf(p)} />);
    }
  }
  return <g>{tris}</g>;
}

export function AreasView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as AreaState;
  const n = s.names;
  let picture: JSX.Element;
  let readout: string;
  let label: string;
  if (s.mode === AreaMode.Tiles) {
    const gap = 28;
    const u = Math.min(
      (width - 24 - gap) / (s.small + s.big),
      (H - 52) / (Math.max(s.small, s.big) * R3),
    );
    const w1 = s.small * u;
    const w2 = s.big * u;
    const left = (width - (w1 + gap + w2)) / 2;
    const base = H - 30;
    const top1 = base - s.small * u * R3;
    const top2 = base - s.big * u * R3;
    picture = (
      <>
        <g data-part={AreaPart.Small}>
          <Grid n={s.small} cx={left + w1 / 2} top={top1} u={u} tone="is-one" />
          {s.showCounts && (
            <text class="tg-count" x={left + w1 / 2} y={H - 10} text-anchor="middle">
              {`${s.small * s.small} ${say(locale, WORDS.small)}`}
            </text>
          )}
        </g>
        <g data-part={AreaPart.Big}>
          <Grid n={s.big} cx={left + w1 + gap + w2 / 2} top={top2} u={u} tone="is-two" />
          {s.showCounts && (
            <text class="tg-count" x={left + w1 + gap + w2 / 2} y={H - 10} text-anchor="middle">
              {`${s.big * s.big} ${say(locale, WORDS.small)}`}
            </text>
          )}
        </g>
      </>
    );
    readout = `${say(locale, WORDS.sides)} ${s.small} : ${s.big} → ${say(locale, WORDS.areas)} ${s.small * s.small} : ${s.big * s.big}`;
    label = `Similar triangles with sides ${s.small} and ${s.big} units: ${s.small * s.small} and ${s.big * s.big} small triangles`;
  } else if (s.mode === AreaMode.Half) {
    const A: Pt = [1.3, 2.7];
    const B: Pt = [0, 0];
    const C: Pt = [4, 0];
    const fit = fitPoints([A, B, C], { left: 0, top: 0, width, height: H }, 24);
    const a = fit.px(A);
    const b = fit.px(B);
    const c = fit.px(C);
    const x = fit.px(lerp(B, A, s.t));
    const y = fit.px(lerp(B, C, s.t));
    const centre = centreOf([a, b, c]);
    const half = isHalfOf(s);
    picture = (
      <>
        <path class="tg-shape-1" d={pathOf([a, b, c])} />
        <g data-part={AreaPart.Line}>
          <path class={`tg-part ${half ? "is-half" : ""}`} d={pathOf([x, b, y])} />
          <line class="tg-cut is-parallel" x1={x[0]} y1={x[1]} x2={y[0]} y2={y[1]} />
          <ParallelMark p={x} q={y} />
          <ParallelMark p={a} q={c} />
          <circle class="tg-point" cx={x[0]} cy={x[1]} r={4} />
          <circle class="tg-point" cx={y[0]} cy={y[1]} r={4} />
          <text class="tg-vertex" x={x[0] - 13} y={x[1] + 3}>
            {n[3]}
          </text>
          <text class="tg-vertex" x={y[0]} y={y[1] + 17} text-anchor="middle">
            {n[4]}
          </text>
        </g>
        <VertexLabel at={a} centre={centre} text={n[0] as string} />
        <VertexLabel at={b} centre={centre} text={n[1] as string} />
        <VertexLabel at={c} centre={centre} text={n[2] as string} />
      </>
    );
    readout = `${n[3]}${n[1]}/${n[0]}${n[1]} = ${numText(s.t)} → ar(${n[3]}${n[1]}${n[4]}) / ar(${n[0]}${n[1]}${n[2]}) = ${numText(s.t, 2)}² = ${numText(areaRatioOf(s), 3)}${half ? ` (${say(locale, WORDS.half)})` : ""}`;
    label = `Triangle ${n[0]}${n[1]}${n[2]} cut by ${n[3]}${n[4]} parallel to ${n[0]}${n[2]}; the small triangle has ${numText(areaRatioOf(s), 3)} of the area`;
  } else {
    const A: Pt = [1.4, 2.8];
    const B: Pt = [0, 0];
    const C: Pt = [4, 0];
    const fit = fitPoints([A, B, C], { left: 0, top: 0, width, height: H }, 24);
    const a = fit.px(A);
    const b = fit.px(B);
    const c = fit.px(C);
    const d = fit.px(lerp(A, B, 0.5));
    const e = fit.px(lerp(B, C, 0.5));
    const f = fit.px(lerp(C, A, 0.5));
    const centre = centreOf([a, b, c]);
    picture = (
      <>
        <path class="tg-shape-1" d={pathOf([a, b, c])} />
        <path class="tg-part is-half" d={pathOf([d, e, f])} data-part={AreaPart.Small} />
        {[a, b, c].map((p, i) => (
          <VertexLabel key={`v${n[i]}`} at={p} centre={centre} text={n[i] as string} />
        ))}
        {[d, e, f].map((p, i) => (
          <VertexLabel
            key={`m${n[3 + i] ?? i}`}
            at={p}
            centre={centre}
            text={(n[3 + i] ?? "DEF"[i]) as string}
            gap={12}
          />
        ))}
      </>
    );
    readout = `ar(${n[3]}${n[4]}${n[5] ?? "F"}) : ar(${n[0]}${n[1]}${n[2]}) = (1 : 2)² = 1 : 4`;
    label = "The triangle joining the midpoints is one of four equal triangles";
  }
  const controls =
    s.mode === AreaMode.Tiles ? (
      <>
        {s.canSetSmall && (
          <Nudger
            name={say(locale, WORDS.first)}
            value={`${s.small}`}
            part={AreaPart.Controls}
            canDown={s.small > 1}
            canUp={s.small < 8}
            onNudge={(by) => call(AreaAction.NudgeSmall, { by })}
          />
        )}
        {s.canSetBig && (
          <Nudger
            name={say(locale, WORDS.second)}
            value={`${s.big}`}
            part={AreaPart.Controls}
            canDown={s.big > 1}
            canUp={s.big < 8}
            onNudge={(by) => call(AreaAction.NudgeBig, { by })}
          />
        )}
      </>
    ) : s.mode === AreaMode.Half && s.canMoveLine ? (
      <div class="tg-nudger" data-part={AreaPart.Controls}>
        <Button
          label="much smaller"
          isEnabled={s.t > 0.2}
          onPress={() => call(AreaAction.MoveLine, { by: -1, size: 5 })}
        >
          «
        </Button>
        <Button
          label="smaller"
          isEnabled={s.t > 0.2}
          onPress={() => call(AreaAction.MoveLine, { by: -1 })}
        >
          −
        </Button>
        <span class="tg-nudger-value">{`${n[3]}${n[1]}/${n[0]}${n[1]} = ${numText(s.t)}`}</span>
        <Button
          label="bigger"
          isEnabled={s.t < 0.99}
          onPress={() => call(AreaAction.MoveLine, { by: 1 })}
        >
          +
        </Button>
        <Button
          label="much bigger"
          isEnabled={s.t < 0.99}
          onPress={() => call(AreaAction.MoveLine, { by: 1, size: 5 })}
        >
          »
        </Button>
      </div>
    ) : null;
  return (
    <div class="tg tg-areas">
      <Stage label={label} x={[0, width]} width={width} height={H} svg={{ class: "tg-svg" }}>
        {picture}
      </Stage>
      <p class={`tg-verdict ${isHalfOf(s) ? "is-on" : ""}`} data-part={AreaPart.Readout}>
        {readout}
      </p>
      {controls !== null && <div class="tg-controls">{controls}</div>}
    </div>
  );
}
